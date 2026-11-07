from fastapi import APIRouter, HTTPException
import aiosqlite
import os
import json
import logging
from typing import Optional

from app.database import get_db_path, sync_from_cloud
from app.models.investigation import InvestigationResponse, InvestigationTriggerRequest
from app.agent.investigator import agent_investigator

logger = logging.getLogger("qualityloop.investigations")
router = APIRouter(prefix="/api/investigations", tags=["investigations"])
DB_PATH = get_db_path()

@router.post("/{incident_id}", response_model=InvestigationResponse)
async def run_investigation(incident_id: str, payload: Optional[InvestigationTriggerRequest] = None):
    force_refresh = payload.force_refresh if payload else False
    try:
        result = await agent_investigator.investigate_incident(
            incident_id=incident_id,
            force_refresh=force_refresh
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Investigation execution error for {incident_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Investigation failed: {str(e)}")

@router.get("/{incident_id}", response_model=InvestigationResponse)
async def get_investigation(incident_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT * FROM investigations 
            WHERE incident_id = ? 
            ORDER BY created_at DESC LIMIT 1
        """, (incident_id,))
        row = await cursor.fetchone()

        if not row:
            # Check if synced from cloud store
            try:
                await sync_from_cloud(db, target_incident_id=incident_id)
                cursor = await db.execute("""
                    SELECT * FROM investigations 
                    WHERE incident_id = ? 
                    ORDER BY created_at DESC LIMIT 1
                """, (incident_id,))
                row = await cursor.fetchone()
            except Exception as e:
                logger.debug(f"Cloud sync on get_investigation notice: {e}")
        
        if not row:
            # Auto-run if not yet investigated
            try:
                return await agent_investigator.investigate_incident(incident_id=incident_id)
            except Exception as e:
                logger.error(f"Auto-run investigation failed for {incident_id}: {e}")
                raise HTTPException(status_code=404, detail="No investigation found and auto-run failed")

        record = dict(row)
        
        def safe_json(val, default):
            if isinstance(val, (list, dict)):
                return val
            if isinstance(val, str):
                try:
                    return json.loads(val)
                except Exception:
                    return default
            return default

        return {
            "id": record["id"],
            "incident_id": record["incident_id"],
            "summary": record["summary"],
            "possible_root_causes": safe_json(record.get("possible_root_causes"), []),
            "recommendations": safe_json(record.get("recommendations"), []),
            "evidence": safe_json(record.get("evidence"), []),
            "recalled_memories": safe_json(record.get("recalled_memories"), []),
            "confidence_level": record.get("confidence_level", "Medium"),
            "created_at": record.get("created_at") or record.get("created_at_iso") or ""
        }
