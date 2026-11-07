from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import aiosqlite
import os
import uuid
import logging
from datetime import datetime, timezone

from app.database import get_db_path, persist_entity, sync_from_cloud
from app.models.incident import IncidentCreate, IncidentUpdate, IncidentResponse
from app.services.analytics import get_dashboard_stats

logger = logging.getLogger("qualityloop.incidents")
router = APIRouter(prefix="/api/incidents", tags=["incidents"])
DB_PATH = get_db_path()

@router.get("", response_model=List[IncidentResponse])
async def list_incidents(
    status: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None
):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Sync any newly persisted cloud incidents into local container
        try:
            await sync_from_cloud(db)
        except Exception as e:
            logger.debug(f"Cloud sync on list_incidents notice: {e}")

        query = "SELECT * FROM incidents WHERE 1=1"
        params = []

        if status and status != "All":
            query += " AND status = ?"
            params.append(status)
        if category and category != "All":
            query += " AND defect_category = ?"
            params.append(category)
        if severity and severity != "All":
            query += " AND severity = ?"
            params.append(severity)
        if search:
            query += " AND (title LIKE ? OR product_name LIKE ? OR batch_number LIKE ? OR id LIKE ?)"
            s = f"%{search}%"
            params.extend([s, s, s, s])

        query += " ORDER BY created_at DESC"

        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

@router.post("", response_model=IncidentResponse)
async def create_incident(data: IncidentCreate):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Sync before ID generation to avoid ID collisions across containers
        try:
            await sync_from_cloud(db)
        except Exception:
            pass

        # Generate next QL ID
        cursor = await db.execute("SELECT id FROM incidents WHERE id LIKE 'QL-%' ORDER BY id DESC LIMIT 1")
        last_row = await cursor.fetchone()
        next_num = 1
        if last_row:
            try:
                num_str = last_row["id"].replace("QL-", "")
                next_num = int(num_str) + 1
            except ValueError:
                next_num = int(datetime.now().strftime("%f")) % 1000

        new_id = f"QL-{next_num:03d}"
        created_at = datetime.now(timezone.utc).isoformat()

        await db.execute("""
            INSERT INTO incidents (
                id, title, product_name, product_id, batch_number, defect_category,
                severity, description, production_stage, machine, supplier,
                quantity_affected, status, image_url, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?)
        """, (
            new_id, data.title, data.product_name, data.product_id, data.batch_number,
            data.defect_category, data.severity, data.description, data.production_stage,
            data.machine, data.supplier, data.quantity_affected, data.image_url, created_at
        ))
        await db.commit()

        cursor = await db.execute("SELECT * FROM incidents WHERE id = ?", (new_id,))
        created = dict(await cursor.fetchone())

        # Persist to durable cloud storage for multi-container Vercel consistency
        try:
            await persist_entity("incident", new_id, created)
        except Exception as e:
            logger.warning(f"Notice: cloud persistence for incident {new_id}: {e}")

        return created

@router.get("/stats")
async def dashboard_stats():
    return await get_dashboard_stats()

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
        row = await cursor.fetchone()

        if not row:
            # Multi-container check: attempt cloud hydration if created on another container
            try:
                await sync_from_cloud(db, target_incident_id=incident_id)
                cursor = await db.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
                row = await cursor.fetchone()
            except Exception as e:
                logger.debug(f"Cloud sync on get_incident notice: {e}")

        if not row:
            raise HTTPException(status_code=404, detail="Incident not found")
        return dict(row)

@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(incident_id: str, data: IncidentUpdate):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        fields = []
        params = []
        if data.title is not None:
            fields.append("title = ?")
            params.append(data.title)
        if data.severity is not None:
            fields.append("severity = ?")
            params.append(data.severity)
        if data.status is not None:
            fields.append("status = ?")
            params.append(data.status)
        if data.description is not None:
            fields.append("description = ?")
            params.append(data.description)
        if data.quantity_affected is not None:
            fields.append("quantity_affected = ?")
            params.append(data.quantity_affected)

        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided for update")

        params.append(incident_id)
        query = f"UPDATE incidents SET {', '.join(fields)} WHERE id = ?"
        await db.execute(query, params)
        await db.commit()

        cursor = await db.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
        updated = await cursor.fetchone()
        if not updated:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        updated_dict = dict(updated)
        try:
            await persist_entity("incident", incident_id, updated_dict)
        except Exception:
            pass

        return updated_dict
