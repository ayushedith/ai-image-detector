from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    
    # Results
    verdict = Column(String, nullable=False)  # real, suspicious, edited, fake
    confidence = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    
    # Layers (stored as JSON)
    digital_footprint = Column(JSON, nullable=False)
    pixel_physics = Column(JSON, nullable=False)
    lighting_geometry = Column(JSON, nullable=False)
    semantic_analysis = Column(JSON, nullable=False)
    
    # Metadata
    metadata = Column(JSON, nullable=False)
    processing_time = Column(Float, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
