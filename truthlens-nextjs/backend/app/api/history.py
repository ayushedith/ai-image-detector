from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Analysis
from app.schemas.analysis import HistoryItem
from typing import List

router = APIRouter()

@router.get("/history", response_model=List[HistoryItem])
async def get_history(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get analysis history"""
    
    analyses = (
        db.query(Analysis)
        .order_by(Analysis.created_at.desc())
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": a.id,
            "filename": a.filename,
            "verdict": a.verdict,
            "confidence": a.confidence,
            "created_at": a.created_at,
            "thumbnail_url": a.thumbnail_url
        }
        for a in analyses
    ]
