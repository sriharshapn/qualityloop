from fastapi import APIRouter, HTTPException
import aiosqlite
import os
import json
from typing import Optional

from app.database import get_db_path
from app.models.investigation import InvestigationResponse, InvestigationTriggerRequest
from app.agent.investigator import agent_investigator

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
            # Auto-run if not yet investigated
            try:
                return await agent_investigator.investigate_incident(incident_id=incident_id)
            except Exception as e:
                raise HTTPException(status_code=404, detail="No investigation found and auto-run failed")

        record = dict(row)
        return {
            "id": record["id"],
            "incident_id": record["incident_id"],
            "summary": record["summary"],
            "possible_root_causes": json.loads(record["possible_root_causes"]),
            "recommendations": json.loads(record["recommendations"]),
            "evidence": json.loads(record["evidence"]),
            "recalled_memories": json.loads(record.get("recalled_memories", "[]")),
            "confidence_level": record["confidence_level"],
            "created_at": record["created_at"]
        }
