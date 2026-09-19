# Notification Engine

**Language:** Python / FastAPI  
**Port:** 8002  
**Responsibility:** Async multi-channel alerts (SMS, WhatsApp, Email) via Kafka/Redis

## API Contract
See [`../../contracts/openapi/notifications.yaml`](../../contracts/openapi/notifications.yaml)

## Run
```bash
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```
