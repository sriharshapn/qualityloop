from pydantic import BaseModel, Field
from typing import Optional

class ActionCreate(BaseModel):
    incident_id: str
    action_description: str
    status: str = Field("Proposed", description="Proposed, Accepted, In Progress, Completed, Rejected")
    outcome: str = Field("Pending verification", description="Pending verification, Successful, Partially successful, Unsuccessful")
    feedback: Optional[str] = None
    verified_root_cause: Optional[str] = None

class ActionFeedbackUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Proposed, Accepted, In Progress, Completed, Rejected")
    outcome: Optional[str] = Field(None, description="Pending verification, Successful, Partially successful, Unsuccessful")
    feedback: Optional[str] = Field(None, description="Detailed notes on trial or inspection results")
    verified_root_cause: Optional[str] = Field(None, description="Root cause confirmed by engineering investigation")

class ActionResponse(BaseModel):
    id: str
    incident_id: str
    action_description: str
    status: str
    outcome: str
    feedback: Optional[str] = None
    verified_root_cause: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None
