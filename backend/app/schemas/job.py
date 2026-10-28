from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class JobCreateRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    scene_name: str = Field(default="Assam_12JUN2023.tif", description="Scene filename or identifier")
    model_id: str = Field(default="model_d", description="Model version: baseline_a, baseline_b, model_c, or model_d")
    spectral_mode: str = Field(default="RGB", description="Spectral visualization: RGB or FCC")
    use_sar: bool = Field(default=True, description="Enable Sentinel-1 SAR guidance")
    use_temporal: bool = Field(default=True, description="Enable temporal reference conditioning")
    generate_confidence: bool = Field(default=True, description="Generate continuous uncertainty raster")
    run_lulc: bool = Field(default=False, description="Run downstream LULC classification")
    output_resolution: str = Field(default="5.0m", description="Output spatial resolution")

class JobProgress(BaseModel):
    stage: str
    percent: int
    duration_seconds: float

class JobMetrics(BaseModel):
    psnr: Optional[float] = None
    ssim: Optional[float] = None
    sam: Optional[float] = None
    mae_cloud: Optional[float] = None
    clear_pixels_unchanged: Optional[bool] = None
    ndvi_mae: Optional[float] = None
    cloud_coverage_pct: Optional[float] = None
    valid_pixels: Optional[int] = None
    lulc_gain_pct: Optional[float] = None
    calibration_ece: Optional[float] = None

class JobResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    job_id: str
    status: str  # queued, processing, completed, failed
    created_at: str
    scene_name: str
    model_id: str
    spectral_mode: str
    progress: JobProgress
    metrics: Optional[JobMetrics] = None
    error: Optional[str] = None

class JobResultFiles(BaseModel):
    reconstructed_geotiff: str
    confidence_geotiff: Optional[str] = None
    cloud_shadow_mask: str
    temporal_reference: Optional[str] = None
    sar_guidance: Optional[str] = None
    lulc_map: Optional[str] = None
    analysis_report_pdf: Optional[str] = None

class JobDetailResponse(JobResponse):
    results: Optional[JobResultFiles] = None
    provenance: Optional[Dict[str, Any]] = None

