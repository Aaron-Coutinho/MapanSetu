# Fee Engine — Dynamic Fee Calculation

**Language:** Python / FastAPI  
**Port:** 8001  
**Responsibility:** Schedule IX fee computation — Tf = Fb + Fc + Pq

## API Contract
See [`../../contracts/openapi/fee-engine.yaml`](../../contracts/openapi/fee-engine.yaml)

## Run
```bash
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```
