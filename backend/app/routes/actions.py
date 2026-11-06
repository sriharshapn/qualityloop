from fastapi import APIRouter, HTTPException
import aiosqlite
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from app.models.action import ActionCreate, ActionFeedbackUpdate, ActionResponse
from app.memory.hindsight_service import hindsight_service

router = APIRouter(prefix="/api/actions", tags=["corrective_actions"])
DB_PATH = os.getenv("SQLITE_DB_PATH", "qualityloop.db")

@router.get("/incident/{incident_id}", response_model=List[ActionResponse])
async def list_actions_for_incident(incident_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT * FROM corrective_actions 
            WHERE incident_id = ? 
            ORDER BY created_at ASC
        """, (incident_id,))
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

@router.post("", response_model=ActionResponse)
async def create_action(data: ActionCreate):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        action_id = f"ACT-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc).isoformat()

        await db.execute("""
            INSERT INTO corrective_actions (
                id, incident_id, action_description, status, outcome, feedback, verified_root_cause, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            action_id, data.incident_id, data.action_description,
            data.status, data.outcome, data.feedback, data.verified_root_cause, now
        ))
        await db.commit()

        cursor = await db.execute("SELECT * FROM corrective_actions WHERE id = ?", (action_id,))
        created = await cursor.fetchone()
        return dict(created)

@router.patch("/{action_id}", response_model=ActionResponse)
async def update_action(action_id: str, data: ActionFeedbackUpdate):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM corrective_actions WHERE id = ?", (action_id,))
        existing = await cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Corrective action not found")
        
        current = dict(existing)
        new_status = data.status if data.status is not None else current["status"]
        new_outcome = data.outcome if data.outcome is not None else current["outcome"]
        new_feedback = data.feedback if data.feedback is not None else current["feedback"]
        new_cause = data.verified_root_cause if data.verified_root_cause is not None else current["verified_root_cause"]
        
        completed_at = current["completed_at"]
        if new_status == "Completed" and not completed_at:
            completed_at = datetime.now(timezone.utc).isoformat()

        await db.execute("""
            UPDATE corrective_actions 
            SET status = ?, outcome = ?, feedback = ?, verified_root_cause = ?, completed_at = ?
            WHERE id = ?
        """, (new_status, new_outcome, new_feedback, new_cause, completed_at, action_id))

        # Check if outcome is marked as 'Successful' -> RETAIN to Hindsight
        should_retain = (new_outcome == "Successful") or (new_status == "Completed" and new_outcome in ["Successful", "Partially successful"])
        
        if should_retain:
            # Fetch full incident details for rich context
            cursor = await db.execute("SELECT * FROM incidents WHERE id = ?", (current["incident_id"],))
            inc = await cursor.fetchone()
            if inc:
                inc_dict = dict(inc)
                
                # Format structured memory content for Hindsight
                memory_content = f"""Incident: {inc_dict['id']}
Product: {inc_dict['product_name']} (SKU: {inc_dict['product_id']})
Batch: {inc_dict['batch_number']}
Defect Category: {inc_dict['defect_category']}
Defect Description: {inc_dict['description']}
Production Stage: {inc_dict['production_stage']}
Machine: {inc_dict.get('machine') or 'N/A'}
Supplier: {inc_dict.get('supplier') or 'N/A'}
Verified Root Cause: {new_cause or 'Verified by Quality Engineering'}
Corrective Action: {current['action_description']}
Outcome: {new_outcome}
Engineering Notes: {new_feedback or 'Outcome verified in post-implementation inspection.'}"""

                # Retain asynchronously to Hindsight
                await hindsight_service.retain(
                    incident_id=inc_dict["id"],
                    content=memory_content,
                    metadata={
                        "incident_id": inc_dict["id"],
                        "product_name": inc_dict["product_name"],
                        "defect_category": inc_dict["defect_category"],
                        "outcome": new_outcome
                    },
                    tags=["manufacturing_defect", inc_dict["defect_category"].replace(" ", "_").lower(), inc_dict["id"]]
                )

                # Mark incident resolved if outcome is verified
                await db.execute("UPDATE incidents SET status = 'Resolved' WHERE id = ?", (inc_dict["id"],))

        await db.commit()

        cursor = await db.execute("SELECT * FROM corrective_actions WHERE id = ?", (action_id,))
        updated = await cursor.fetchone()
        return dict(updated)
