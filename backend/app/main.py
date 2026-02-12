from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.api import analyze, history, models
from app.core.config import settings
from app.db.database import engine, Base
from app.services.model_manager import ModelManager

load_dotenv()

# Initialize database
Base.metadata.create_all(bind=engine)

# Initialize model manager
model_manager = ModelManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load AI models
    await model_manager.load_models()
    yield
    # Shutdown: Cleanup
    await model_manager.cleanup()

app = FastAPI(
    title="TruthLens API",
    description="Professional AI Image Detection API with 4-Layer Forensic Analysis",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(models.router, prefix="/api", tags=["Models"])

# Serve uploaded assets for in-app previews
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/")
async def root():
    return {
        "name": "TruthLens API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
