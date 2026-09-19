from fastapi import APIRouter, HTTPException
from schemas import FeeCalculationRequest, FeeCalculationResponse, HealthResponse
from fee_service import calculate_fee, get_full_schedule

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(status="ok", service="fee-engine", version="0.1.0")


@router.post(
    "/fees/calculate",
    response_model=FeeCalculationResponse,
    tags=["Fees"],
    summary="Calculate total verification fee — Tf = Fb + Fc + Pq",
)
def calculate_verification_fee(req: FeeCalculationRequest):
    """
    Compute the Schedule IX verification fee for a weighing instrument.

    - **Fb** — base fee by instrument class and capacity
    - **Fc** — conveyance fee by district
    - **Pq = Nq × Fb** — late payment penalty for lapsed quarters
    - **Tf = Fb + Fc + Pq** — total fee
    """
    try:
        return calculate_fee(req)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get(
    "/fees/schedule",
    tags=["Fees"],
    summary="Get full Schedule IX fee table",
)
def get_fee_schedule():
    """Return the complete base fee table by instrument class and capacity bracket."""
    return {"schedule": get_full_schedule()}
