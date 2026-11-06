from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class HistoricalMemory(BaseModel):
    id: str = Field(..., description="Memory or referenced incident identifier")
    original_incident_id: Optional[str] = Field(None, description="Original Incident ID if tracked")
    previous_defect: str = Field(..., description="Previous defect description")
    verified_root_cause: Optional[str] = Field(None, description="Verified root cause from past investigation")
    corrective_action: str = Field(..., description="Corrective action applied")
    recorded_outcome: str = Field(..., description="Recorded outcome (e.g. Successful, Unsuccessful)")
    relevance_reason: str = Field(..., description="Why this memory is relevant to current incident")
    source: str = Field("Hindsight Memory Engine", description="Source indicator")
    confidence: Optional[float] = Field(None, description="Relevance score or match strength")

class RecommendationItem(BaseModel):
    id: str = Field(..., description="Unique action item ID")
    action: str = Field(..., description="Concrete corrective or preventive action step")
    priority: str = Field("Medium", description="Low, Medium, High, Critical")
    target_stage: Optional[str] = Field(None, description="Production stage for intervention")
    expected_impact: str = Field(..., description="Expected engineering impact")
    grounded_in_memory: bool = Field(False, description="Whether this recommendation is directly informed by past experience")

class InvestigationResponse(BaseModel):
    id: str
    incident_id: str
    summary: str
    possible_root_causes: List[str]
    recommendations: List[RecommendationItem]
    evidence: List[str]
    recalled_memories: List[HistoricalMemory]
    confidence_level: str
    created_at: str

class InvestigationTriggerRequest(BaseModel):
    force_refresh: bool = False
