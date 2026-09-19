# Certificate Service — PKI & Certificate Generation

**Language:** Python / FastAPI  
**Port:** 8003  
**Responsibility:** PDF/A assembly, SHA-256 QR code generation, HSM/eSign integration

## API Contract
See [`../../contracts/openapi/certificate.yaml`](../../contracts/openapi/certificate.yaml)

## Run
```bash
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8003
```
