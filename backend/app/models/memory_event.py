from pydantic import BaseModel, Field
from typing import Optional

class MemoryEventResponse(BaseModel):
    id: str
    incident_id: Optional[str] = None
    event_type: str = Field(..., description="RETAIN, RECALL, REFLECT, BANK_INIT")
    operation_status: str = Field(..., description="SUCCESS, FAILED, WARNING")
    query_or_content: str
    response_summary: str
    latency_ms: int = 0
    created_at: str

class MemoryRetainRequest(BaseModel):
    incident_id: str
    verified_root_cause: str
    corrective_action: str
    outcome: str
    lessons_learned: Optional[str] = None

class MemoryRecallRequest(BaseModel):
    query: str
    bank_id: Optional[str] = None

class MemoryReflectRequest(BaseModel):
    query: str
    bank_id: Optional[str] = None
