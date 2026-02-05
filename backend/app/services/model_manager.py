import torch
from app.services.detector import ImageDetector

class ModelManager:
    """Manage AI models lifecycle"""
    
    def __init__(self):
        self.detector = ImageDetector()
    
    async def load_models(self):
        """Load all models on startup"""
        print("🔄 Loading AI models...")
        try:
            await self.detector.load_models()
            print("✓ Models loaded successfully")
        except Exception as e:
            print(f"⚠ Model loading failed: {e}")
            print("Continuing in fallback mode")
    
    async def cleanup(self):
        """Cleanup models on shutdown"""
        print("🔄 Cleaning up models...")
        if hasattr(self.detector, 'models'):
            self.detector.models.clear()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        print("✓ Cleanup complete")
