from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class EvaluationRequest(BaseModel):
    prediction_path: str = Field(description="Path to reconstructed image file")
    reference_path: str = Field(description="Path to verified cloud-free reference image")
    cloud_mask_path: Optional[str] = Field(default=None, description="Path to binary cloud/shadow mask")
    dataset_version: str = Field(default="LISS4_NORTHEAST_v1", description="Dataset identifier")
    split: str = Field(default="test_heldout_spatial", description="Geographic split identifier")

class MaskedMetrics(BaseModel):
    mae: float
    rmse: float
    psnr: float
    ssim: float
    sam_degrees: float
    ndvi_mae: float
    valid_pixels_count: int

class EvaluationReport(BaseModel):
    evaluation_id: str
    timestamp: str
    dataset_version: str
    geographic_split: str
    model_version: str
    checkpoint_hash: str
    overall_metrics: MaskedMetrics
    cloud_region_metrics: MaskedMetrics
    cloud_plus_shadow_metrics: MaskedMetrics
    clear_region_metrics: MaskedMetrics
    lulc_consistency: Optional[Dict[str, Any]] = None
    scientific_acceptance: bool = True
