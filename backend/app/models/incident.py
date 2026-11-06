from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class IncidentCreate(BaseModel):
    title: str = Field(..., description="Incident title")
    product_name: str = Field(..., description="Product name")
    product_id: str = Field(..., description="Product ID/SKU")
    batch_number: str = Field(..., description="Production batch number")
    defect_category: str = Field(..., description="Category of defect (e.g., Surface defect, Dimensional defect)")
    severity: str = Field(..., description="Severity level: Low, Medium, High, Critical")
    description: str = Field(..., description="Detailed description of defect")
    production_stage: str = Field(..., description="Stage where defect was detected or caused")
    machine: Optional[str] = Field(None, description="Specific machine or equipment identifier")
    supplier: Optional[str] = Field(None, description="Supplier name if material or component related")
    quantity_affected: int = Field(1, ge=1, description="Number of units affected")
    image_url: Optional[str] = Field(None, description="Optional uploaded defect image URL / base64")

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    quantity_affected: Optional[int] = None

class IncidentResponse(BaseModel):
    id: str
    title: str
    product_name: str
    product_id: str
    batch_number: str
    defect_category: str
    severity: str
    description: str
    production_stage: str
    machine: Optional[str] = None
    supplier: Optional[str] = None
    quantity_affected: int
    status: str
    image_url: Optional[str] = None
    created_at: str
