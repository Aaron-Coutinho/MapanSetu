"""
Schedule IX Fee Table — Legal Metrology (General) Rules, 2011
Tf = Fb + Fc + Pq
  Fb = base fee (by instrument class and capacity)
  Fc = conveyance fee (by district category)
  Pq = Nq * Fb (late penalty: quarters lapsed × base fee)
"""

from decimal import Decimal
from typing import Literal

InstrumentClass = Literal["CLASS_I", "CLASS_II", "CLASS_III", "CLASS_IIII"]
DistrictCategory = Literal["METRO", "URBAN", "SEMI_URBAN", "RURAL"]

# --- Base fees (INR) by class and capacity bracket ---
# Format: {class: [(max_capacity_kg, fee), ...]}
# Last entry in each list is the catch-all for > max
BASE_FEE_TABLE: dict[str, list[tuple[float, Decimal]]] = {
    "CLASS_I": [
        (1,     Decimal("100")),
        (5,     Decimal("150")),
        (10,    Decimal("200")),
        (50,    Decimal("350")),
        (200,   Decimal("500")),
        (float("inf"), Decimal("750")),
    ],
    "CLASS_II": [
        (1,     Decimal("150")),
        (5,     Decimal("200")),
        (10,    Decimal("300")),
        (50,    Decimal("450")),
        (200,   Decimal("650")),
        (float("inf"), Decimal("900")),
    ],
    "CLASS_III": [
        (1,     Decimal("200")),
        (5,     Decimal("300")),
        (10,    Decimal("400")),
        (50,    Decimal("600")),
        (200,   Decimal("800")),
        (float("inf"), Decimal("1100")),
    ],
    "CLASS_IIII": [
        (1,     Decimal("250")),
        (5,     Decimal("350")),
        (10,    Decimal("500")),
        (50,    Decimal("750")),
        (200,   Decimal("1000")),
        (float("inf"), Decimal("1400")),
    ],
}

# --- Conveyance fees (INR) by district category ---
CONVEYANCE_FEE_TABLE: dict[str, Decimal] = {
    "METRO":      Decimal("200"),
    "URBAN":      Decimal("150"),
    "SEMI_URBAN": Decimal("100"),
    "RURAL":      Decimal("75"),
}

# --- District category mapping (sample — extend with real district codes) ---
DISTRICT_CATEGORY_MAP: dict[str, DistrictCategory] = {
    "MH-MUMBAI":  "METRO",
    "MH-PUNE":    "METRO",
    "MH-NAGPUR":  "URBAN",
    "UP-LUCKNOW": "URBAN",
    "UP-AGRA":    "URBAN",
    "RJ-JAIPUR":  "URBAN",
    "RJ-JODHPUR": "SEMI_URBAN",
    # Default fallback handled in fee_service.py
}


def get_base_fee(instrument_class: str, capacity_kg: float) -> Decimal:
    """Look up Fb from Schedule IX table."""
    brackets = BASE_FEE_TABLE.get(instrument_class)
    if not brackets:
        raise ValueError(f"Unknown instrument class: {instrument_class}")
    for max_cap, fee in brackets:
        if capacity_kg <= max_cap:
            return fee
    return brackets[-1][1]


def get_conveyance_fee(district_code: str) -> Decimal:
    """Look up Fc by district code. Falls back to RURAL if unknown."""
    category = DISTRICT_CATEGORY_MAP.get(district_code, "RURAL")
    return CONVEYANCE_FEE_TABLE[category]


def get_district_category(district_code: str) -> DistrictCategory:
    return DISTRICT_CATEGORY_MAP.get(district_code, "RURAL")
