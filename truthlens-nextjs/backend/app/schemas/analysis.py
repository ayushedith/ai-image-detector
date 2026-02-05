from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class LayerResult(BaseModel):
    name: str
    score: float
    confidence: float
    findings: List[str]
    details: Dict[str, Any]

class FileInfo(BaseModel):
    size: int
    format: str
    dimensions: tuple[int, int]

class AnalysisMetadata(BaseModel):
    exif: Dict[str, Any]
    file_info: FileInfo

class AnalysisResponse(BaseModel):
    id: str
    verdict: str
    confidence: float
    overall_score: float
    layers: Dict[str, LayerResult]
    metadata: AnalysisMetadata
    processing_time: float
    created_at: datetime

    class Config:
        from_attributes = True

class HistoryItem(BaseModel):
    id: str
    filename: str
    verdict: str
    confidence: float
    created_at: datetime
    thumbnail_url: str | None

    class Config:
        from_attributes = True
