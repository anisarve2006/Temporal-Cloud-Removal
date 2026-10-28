from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.database import init_db
from .routers import jobs, evaluations, models, benchmarks, export, health

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database on startup
    init_db()
    yield

app = FastAPI(
    title="Cloudless AI — Geospatial Processing & Benchmarking API",
    description="Physics-guided multi-modal satellite cloud removal, uncertainty estimation, and reproducible benchmarking backend.",
    version="2.1.0",
    lifespan=lifespan
)

# Secure CORS: explicit frontend origins, no insecure wildcard with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount API Routers under /api/v1
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(evaluations.router, prefix="/api/v1")
app.include_router(models.router, prefix="/api/v1")
app.include_router(benchmarks.router, prefix="/api/v1")
app.include_router(export.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "project": "Cloudless AI",
        "description": "Multi-Modal Generative Satellite Cloud Removal & Benchmarking Pipeline",
        "version": "2.1.0-prod",
        "docs_url": "/docs",
        "api_v1_base": "/api/v1"
    }
