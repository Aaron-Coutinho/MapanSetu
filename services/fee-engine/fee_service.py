from decimal import Decimal
from schemas import FeeCalculationRequest, FeeCalculationResponse
from fee_table import get_base_fee, get_conveyance_fee, get_district_category


def calculate_fee(req: FeeCalculationRequest) -> FeeCalculationResponse:
    """
    Compute total verification fee:
        Tf = Fb + Fc + Pq
        Pq = Nq * Fb
    """
    fb = get_base_fee(req.instrument_class, req.capacity_kg)
    fc = get_conveyance_fee(req.district_code)
    pq = Decimal(req.quarters_lapsed) * fb
    tf = fb + fc + pq

    district_category = get_district_category(req.district_code)
    formula = f"Tf = {fb} + {fc} + ({req.quarters_lapsed} × {fb}) = {tf}"

    return FeeCalculationResponse(
        base_fee=fb,
        conveyance_fee=fc,
        penalty_fee=pq,
        total_fee=tf,
        district_category=district_category,
        breakdown_formula=formula,
    )


def get_full_schedule() -> list[dict]:
    """Return the full Schedule IX fee table as a list."""
    from fee_table import BASE_FEE_TABLE
    rows = []
    prev = 0.0
    for cls, brackets in BASE_FEE_TABLE.items():
        for max_cap, fee in brackets:
            bracket_label = (
                f"Up to {max_cap} kg" if max_cap != float("inf") else f"Above {prev} kg"
            )
            rows.append({
                "instrument_class": cls,
                "capacity_bracket": bracket_label,
                "base_fee": fee,
                "currency": "INR",
            })
        prev = 0.0
    return rows
