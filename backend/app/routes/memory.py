from fastapi import APIRouter, HTTPException
import aiosqlite
import os
from typing import List, Optional

from app.memory.hindsight_service import hindsight_service
from app.models.memory_event import MemoryEventResponse, MemoryRetainRequest, MemoryRecallRequest, MemoryReflectRequest

router = APIRouter(prefix="/api/memory", tags=["memory"])
DB_PATH = os.getenv("SQLITE_DB_PATH", "qualityloop.db")

@router.get("/status")
async def get_memory_status():
    status = await hindsight_service.get_service_status()
    # Add count of events
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM memory_events")
        status["total_events"] = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT COUNT(*) FROM memory_events WHERE event_type = 'RETAIN' AND operation_status = 'SUCCESS'")
        status["retained_count"] = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT COUNT(*) FROM memory_events WHERE event_type = 'RECALL'")
        status["recall_count"] = (await cursor.fetchone())[0]

        cursor = await db.execute("SELECT COUNT(*) FROM memory_events WHERE event_type = 'REFLECT'")
        status["reflect_count"] = (await cursor.fetchone())[0]

    return status

@router.get("/events", response_model=List[MemoryEventResponse])
async def list_memory_events(limit: int = 50, event_type: Optional[str] = None):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM memory_events WHERE 1=1"
        params = []
        if event_type:
            query += " AND event_type = ?"
            params.append(event_type.upper())
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

@router.post("/recall")
async def manual_recall(data: MemoryRecallRequest):
    results, status = await hindsight_service.recall(query=data.query)
    return {
        "results": results,
        "status": status
    }

@router.post("/reflect")
async def manual_reflect(data: MemoryReflectRequest):
    res = await hindsight_service.reflect(query=data.query)
    return res

@router.post("/retain")
async def manual_retain(data: MemoryRetainRequest):
    content = f"""Incident: {data.incident_id}
Verified Root Cause: {data.verified_root_cause}
Corrective Action: {data.corrective_action}
Outcome: {data.outcome}
Lessons Learned: {data.lessons_learned or 'N/A'}"""
    
    res = await hindsight_service.retain(
        incident_id=data.incident_id,
        content=content,
        metadata={"incident_id": data.incident_id, "manual": "true"}
    )
    return res
