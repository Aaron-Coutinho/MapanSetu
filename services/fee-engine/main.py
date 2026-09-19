from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from config import settings

app = FastAPI(
    title="MapanSetu — Fee Engine",
    description="Dynamic verification fee calculation under Schedule IX, Legal Metrology (General) Rules 2011",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/", include_in_schema=False)
def root():
    return {"service": "fee-engine", "status": "running", "docs": "/docs"}
