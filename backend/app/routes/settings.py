from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import os

from app.memory.hindsight_service import hindsight_service
from app.agent.investigator import agent_investigator

router = APIRouter(prefix="/api/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    gemini_model: Optional[str] = None

@router.get("")
async def get_settings():
    h_key = hindsight_service.api_key
    g_key = agent_investigator.gemini_key or os.getenv("GEMINI_API_KEY", "")

    return {
        "hindsight_bank_id": hindsight_service.bank_id,
        "hindsight_connected": bool(h_key),
        "gemini_connected": bool(g_key),
        "gemini_model": agent_investigator.gemini_model or "gemini-3.5-flash-lite",
        "memory_status": hindsight_service._status,
        "engine_mode": "Enterprise Managed",
        "storage_engine": "SQLite (Dynamic Resolution)"
    }

@router.post("")
async def update_settings(data: SettingsUpdate):
    if data.gemini_model is not None:
        clean_model = data.gemini_model.strip()
        os.environ["GEMINI_MODEL"] = clean_model
        agent_investigator.gemini_model = clean_model

    return await get_settings()
