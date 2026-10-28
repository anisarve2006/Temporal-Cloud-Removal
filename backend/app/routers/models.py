from fastapi import APIRouter
from typing import List, Dict, Any
from ..config import MODEL_REGISTRY

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("", response_model=List[Dict[str, Any]])
def list_available_models():
    """
    Lists the registered reconstruction engines and their architectural roles:
    - Baseline A: Non-neural temporal radiometric fill
    - Baseline B: Mask-aware neural U-Net
    - Model C: Multi-modal fusion (Optical + SAR + Temporal)
    - Model D: Quality-aware reconstruction with uncertainty estimation
    """
    return list(MODEL_REGISTRY.values())
