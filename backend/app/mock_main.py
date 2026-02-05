"""
Minimal mock backend for development without heavy ML dependencies
"""
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
from datetime import datetime

app = FastAPI(title="TruthLens Mock API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data store
mock_analyses = {}
analysis_counter = 0

@app.get("/")
async def root():
    return {"message": "TruthLens API - Mock Development Server"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/analyze")
async def analyze_image(image: UploadFile = File(...)):
    """
    Mock image analysis endpoint
    Returns a fake but realistic analysis result
    """
    global analysis_counter
    analysis_counter += 1
    
    analysis_id = f"mock-{analysis_counter}"
    
    # Mock response matching the API schema
    mock_result = {
        "id": analysis_id,
        "verdict": "fake",  # Change to "real", "fake", "edited", "suspicious"
        "confidence": 0.98,
        "processing_time": 2.847,
        "layers": {
            "digital_footprint": {
                "name": "Digital Footprint",
                "score": 92,
                "confidence": 0.95,
                "findings": [
                    "Suspicious EXIF metadata patterns",
                    "Missing camera information"
                ],
                "details": {
                    "exif_score": 92,
                    "resolution": "2048x1536"
                }
            },
            "pixel_physics": {
                "name": "Pixel Physics",
                "score": 87,
                "confidence": 0.92,
                "findings": [
                    "High ELA variance detected (78.4)",
                    "Abnormal noise distribution"
                ],
                "details": {
                    "ela_score": 87,
                    "noise_variance": 0.78
                }
            },
            "lighting_geometry": {
                "name": "Lighting & Geometry",
                "score": 95,
                "confidence": 0.94,
                "findings": [
                    "Edge coherence anomalies",
                    "Inconsistent lighting angles"
                ],
                "details": {
                    "edge_score": 95,
                    "lighting_consistency": 0.85
                }
            },
            "semantic_analysis": {
                "name": "AI Semantic Analysis",
                "score": 99,
                "confidence": 0.99,
                "findings": [
                    "AI model ensemble vote: 98% FAKE",
                    "Strong GAN artifact signatures"
                ],
                "details": {
                    "ensemble_confidence": 0.99,
                    "gan_probability": 0.98
                }
            }
        },
        "metadata": {
            "file_info": {
                "format": "JPEG",
                "dimensions": [2048, 1536],
                "size": 867328,
                "color_space": "RGB"
            },
            "exif": {
                "camera": "Generated",
                "date_taken": datetime.now().isoformat()
            }
        }
    }
    
    # Store in mock memory
    mock_analyses[analysis_id] = mock_result
    
    return mock_result

@app.get("/api/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get a previous analysis result"""
    if analysis_id in mock_analyses:
        return mock_analyses[analysis_id]
    return JSONResponse(
        status_code=404,
        content={"error": "Analysis not found"}
    )

@app.get("/api/history")
async def get_history():
    """Get analysis history"""
    return {
        "analyses": list(mock_analyses.values())[-10:],  # Last 10
        "total": len(mock_analyses)
    }

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    """Swagger UI will be auto-generated"""
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
