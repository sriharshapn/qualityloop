from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import os

from app.memory.hindsight_service import hindsight_service
from app.agent.investigator import agent_investigator

router = APIRouter(prefix="/api/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    hindsight_api_key: Optional[str] = None
    hindsight_base_url: Optional[str] = None
    hindsight_bank_id: Optional[str] = None
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    anthropic_api_key: Optional[str] = None

@router.get("")
async def get_settings():
    h_key = hindsight_service.api_key
    g_key = agent_investigator.gemini_key or os.getenv("GEMINI_API_KEY", "")
    a_key = os.getenv("ANTHROPIC_API_KEY", "")

    return {
        "hindsight_base_url": hindsight_service.base_url,
        "hindsight_bank_id": hindsight_service.bank_id,
        "hindsight_api_key_configured": bool(h_key),
        "hindsight_api_key_masked": f"{h_key[:4]}...{h_key[-4:]}" if len(h_key) > 8 else ("Configured" if h_key else "Not set"),
        "gemini_api_key_configured": bool(g_key),
        "gemini_api_key_masked": f"{g_key[:4]}...{g_key[-4:]}" if len(g_key) > 8 else ("Configured" if g_key else "Not set"),
        "gemini_model": agent_investigator.gemini_model or "gemini-3.5-flash-lite",
        "anthropic_api_key_configured": bool(a_key),
        "anthropic_api_key_masked": f"{a_key[:7]}...{a_key[-4:]}" if len(a_key) > 11 else ("Configured" if a_key else "Not set"),
        "status": hindsight_service._status,
        "last_error": hindsight_service._last_error
    }

@router.post("")
async def update_settings(data: SettingsUpdate):
    if data.hindsight_api_key is not None:
        hindsight_service.update_credentials(
            api_key=data.hindsight_api_key,
            base_url=data.hindsight_base_url,
            bank_id=data.hindsight_bank_id
        )
        # Attempt to initialize bank
        init_res = await hindsight_service.initialize_bank()

    if data.gemini_api_key is not None:
        clean_gkey = data.gemini_api_key.strip()
        os.environ["GEMINI_API_KEY"] = clean_gkey
        agent_investigator.gemini_key = clean_gkey

    if data.gemini_model is not None:
        clean_model = data.gemini_model.strip()
        os.environ["GEMINI_MODEL"] = clean_model
        agent_investigator.gemini_model = clean_model

    if data.anthropic_api_key is not None:
        os.environ["ANTHROPIC_API_KEY"] = data.anthropic_api_key.strip()

    return await get_settings()
