import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_basic_fee_no_penalty():
    r = client.post("/api/v1/fees/calculate", json={
        "instrument_class": "CLASS_III",
        "capacity_kg": 500,
        "district_code": "MH-PUNE",
        "quarters_lapsed": 0,
    })
    assert r.status_code == 200
    data = r.json()
    assert data["penalty_fee"] == "0"
    assert float(data["total_fee"]) == float(data["base_fee"]) + float(data["conveyance_fee"])


def test_fee_with_penalty():
    r = client.post("/api/v1/fees/calculate", json={
        "instrument_class": "CLASS_III",
        "capacity_kg": 500,
        "district_code": "MH-PUNE",
        "quarters_lapsed": 2,
    })
    assert r.status_code == 200
    data = r.json()
    fb = float(data["base_fee"])
    pq = float(data["penalty_fee"])
    assert pq == 2 * fb  # Pq = Nq * Fb


def test_invalid_class():
    r = client.post("/api/v1/fees/calculate", json={
        "instrument_class": "CLASS_X",
        "capacity_kg": 100,
        "district_code": "MH-PUNE",
        "quarters_lapsed": 0,
    })
    assert r.status_code == 422


def test_fee_schedule():
    r = client.get("/api/v1/fees/schedule")
    assert r.status_code == 200
    assert "schedule" in r.json()
    assert len(r.json()["schedule"]) > 0


def test_unknown_district_falls_back_to_rural():
    r = client.post("/api/v1/fees/calculate", json={
        "instrument_class": "CLASS_II",
        "capacity_kg": 10,
        "district_code": "XX-UNKNOWN",
        "quarters_lapsed": 0,
    })
    assert r.status_code == 200
    assert r.json()["district_category"] == "RURAL"
