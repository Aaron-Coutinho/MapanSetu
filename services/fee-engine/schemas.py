from decimal import Decimal
from pydantic import BaseModel, Field
from typing import Literal


class FeeCalculationRequest(BaseModel):
    instrument_class: Literal["CLASS_I", "CLASS_II", "CLASS_III", "CLASS_IIII"] = Field(
        ..., json_schema_extra={"example": "CLASS_III"}
    )
    capacity_kg: float = Field(..., gt=0, json_schema_extra={"example": 500.0})
    district_code: str = Field(..., json_schema_extra={"example": "MH-PUNE"})
    quarters_lapsed: int = Field(
        default=0, ge=0, description="Nq — lapsed calendar quarters for late penalty"
    )


class FeeCalculationResponse(BaseModel):
    base_fee: Decimal = Field(..., description="Fb — base instrument fee")
    conveyance_fee: Decimal = Field(..., description="Fc — on-site conveyance charge")
    penalty_fee: Decimal = Field(..., description="Pq = Nq * Fb")
    total_fee: Decimal = Field(..., description="Tf = Fb + Fc + Pq")
    currency: str = "INR"
    district_category: str
    breakdown_formula: str


class ScheduleEntry(BaseModel):
    instrument_class: str
    capacity_bracket: str
    base_fee: Decimal
    currency: str = "INR"


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
