from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Analysis
from app.schemas.analysis import AnalysisResponse
from app.services.detector import ImageDetector
from app.services.forensics import ForensicAnalyzer
from app.core.config import settings
import time
import uuid
import os
import shutil
from PIL import Image

router = APIRouter()

detector = ImageDetector()
forensics = ForensicAnalyzer()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    model: str = "ensemble"
):
    """Analyze an image for AI detection with 4-layer forensic analysis"""
    
    start_time = time.time()
    
    # Validate file
    if not image.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    
    # Save uploaded file
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(image.filename)[1]
    file_path = f"{settings.UPLOAD_DIR}/{file_id}{file_ext}"
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    try:
        # Load image
        img = Image.open(file_path)
        
        # Run forensic analysis
        forensic_results = await forensics.analyze_all_layers(file_path, img)
        
        # Run AI detection
        ai_results = await detector.detect(file_path, model)
        
        # Combine results
        overall_score = (
            forensic_results["digital_footprint"]["score"] * 0.2 +
            forensic_results["pixel_physics"]["score"] * 0.3 +
            forensic_results["lighting_geometry"]["score"] * 0.2 +
            ai_results["score"] * 0.3
        )
        
        # Determine verdict
        if overall_score >= 81:
            verdict = "fake"
        elif overall_score >= 61:
            verdict = "edited"
        elif overall_score >= 21:
            verdict = "suspicious"
        else:
            verdict = "real"
        
        # Calculate confidence
        confidence = min(abs(overall_score - 50) / 50, 1.0)
        
        # Extract metadata
        exif_data = forensics.extract_exif(file_path)
        file_info = {
            "size": os.path.getsize(file_path),
            "format": img.format,
            "dimensions": img.size
        }
        
        processing_time = time.time() - start_time
        
        image_url = f"/uploads/{file_id}{file_ext}"

        # Save to database
        analysis = Analysis(
            id=file_id,
            filename=image.filename,
            file_path=file_path,
            thumbnail_url=image_url,
            verdict=verdict,
            confidence=confidence,
            overall_score=overall_score,
            digital_footprint=forensic_results["digital_footprint"],
            pixel_physics=forensic_results["pixel_physics"],
            lighting_geometry=forensic_results["lighting_geometry"],
            semantic_analysis=ai_results,
            metadata={
                "exif": exif_data,
                "file_info": file_info
            },
            processing_time=processing_time
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        return {
            "id": analysis.id,
            "filename": analysis.filename,
            "verdict": analysis.verdict,
            "confidence": analysis.confidence,
            "overall_score": analysis.overall_score,
            "layers": {
                "digital_footprint": analysis.digital_footprint,
                "pixel_physics": analysis.pixel_physics,
                "lighting_geometry": analysis.lighting_geometry,
                "semantic_analysis": analysis.semantic_analysis
            },
            "metadata": analysis.metadata,
            "processing_time": analysis.processing_time,
            "created_at": analysis.created_at,
            "image_url": image_url
        }
        
    except Exception as e:
        # Cleanup on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(500, f"Analysis failed: {str(e)}")

@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Get analysis results by ID"""
    
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(404, "Analysis not found")
    
    return {
        "id": analysis.id,
        "filename": analysis.filename,
        "verdict": analysis.verdict,
        "confidence": analysis.confidence,
        "overall_score": analysis.overall_score,
        "layers": {
            "digital_footprint": analysis.digital_footprint,
            "pixel_physics": analysis.pixel_physics,
            "lighting_geometry": analysis.lighting_geometry,
            "semantic_analysis": analysis.semantic_analysis
        },
        "metadata": analysis.metadata,
        "processing_time": analysis.processing_time,
        "created_at": analysis.created_at,
        "image_url": analysis.thumbnail_url or f"/uploads/{os.path.basename(analysis.file_path)}"
    }
