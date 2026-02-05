from fastapi import APIRouter

router = APIRouter()

@router.get("/models")
async def get_models():
    """Get available AI models"""
    
    return [
        "efficientnet-b7",
        "xception",
        "resnet50",
        "huggingface/umm-maybe/AI-image-detector",
        "ensemble"
    ]
