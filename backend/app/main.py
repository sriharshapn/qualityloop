import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from app.database import init_db
from app.memory.hindsight_service import hindsight_service
from app.routes import (
    incidents_router,
    investigations_router,
    actions_router,
    memory_router,
    demo_router,
    settings_router
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("qualityloop")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing QualityLoop database...")
    await init_db()
    
    logger.info("Checking Hindsight Persistent Memory Engine...")
    bank_status = await hindsight_service.initialize_bank()
    logger.info(f"Hindsight Bank status: {bank_status}")
    
    yield
    logger.info("Shutting down QualityLoop backend.")

app = FastAPI(
    title="QualityLoop API",
    description="Self-Learning Manufacturing Quality Intelligence Agent powered by Hindsight Persistent Memory",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(incidents_router)
app.include_router(investigations_router)
app.include_router(actions_router)
app.include_router(memory_router)
app.include_router(demo_router)
app.include_router(settings_router)

@app.get("/")
@app.get("/api")
async def root():
    return {
        "app": "QualityLoop",
        "tagline": "Every defect teaches. Every experience improves.",
        "version": "2.0.0",
        "hindsight_bank": hindsight_service.bank_id,
        "docs_url": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
async def health_check():
    status = await hindsight_service.get_service_status()
    return {
        "status": "healthy",
        "hindsight": status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
