import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BASE_DIR.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
OUTPUTS_DIR = STORAGE_DIR / "outputs"
BENCHMARKS_DIR = STORAGE_DIR / "benchmarks"
PUBLIC_IMAGES_DIR = WORKSPACE_DIR / "public" / "images" / "satellite"

# Create directories
for p in [UPLOADS_DIR, OUTPUTS_DIR, BENCHMARKS_DIR]:
    p.mkdir(parents=True, exist_ok=True)

# Geospatial Defaults
DEFAULT_CRS = "EPSG:32646"  # WGS 84 / UTM zone 46N (Assam & NE India)
DEFAULT_GSD = 5.0           # 5.0m LISS-IV native spatial resolution
SUPPORTED_FORMATS = [".tif", ".tiff", ".geotiff", ".png", ".jpg", ".jpeg"]
MAX_UPLOAD_SIZE_MB = 200

# Normalization parameters (Top of Atmosphere reflectance scaled 0-1)
LISS4_BAND_NAMES = ["Green (B2)", "Red (B3)", "NIR (B4)"]
SAR_BAND_NAMES = ["VV", "VH"]

# Model Registry
MODEL_REGISTRY = {
    "baseline_a": {
        "id": "baseline_a",
        "name": "Baseline A — Temporal Radiometric Matching",
        "version": "1.0.0",
        "type": "Non-Neural Temporal Fill",
        "description": "Aligns clear temporal acquisition, applies histogram/radiometric matching, and fills obscured regions.",
        "input_modalities": ["optical_cloudy", "cloud_mask", "optical_temporal"],
        "checkpoint": "none (analytical)"
    },
    "baseline_b": {
        "id": "baseline_b",
        "name": "Baseline B — Mask-Aware Neural U-Net",
        "version": "1.2.0",
        "type": "Neural Residual Encoder-Decoder",
        "description": "U-Net with hard mask conditioning that reconstructs cloud/shadow pixels while locking visible pixels.",
        "input_modalities": ["optical_cloudy", "cloud_mask"],
        "checkpoint": "checkpoints/unet_mask_aware_v1.pt"
    },
    "model_c": {
        "id": "model_c",
        "name": "Model C — Multi-Modal Fusion (SAR + Optical)",
        "version": "2.0.0",
        "type": "Modality-Specific Encoders + Cross-Attention",
        "description": "Fuses Sentinel-1 C-band dual-pol (VV/VH) radar backscatter with LISS-IV optical priors.",
        "input_modalities": ["optical_cloudy", "cloud_mask", "sar_vv_vh", "optical_temporal"],
        "checkpoint": "checkpoints/multimodal_fusion_v2.pt"
    },
    "model_d": {
        "id": "model_d",
        "name": "Model D — Quality-Aware with Uncertainty Head",
        "version": "2.1.0-prod",
        "type": "Multi-Modal Generative with UnCRtainTS Uncertainty Head & Fallback",
        "description": "Full production pipeline with continuous spatial confidence raster output and selective temporal fallback.",
        "input_modalities": ["optical_cloudy", "cloud_mask", "sar_vv_vh", "optical_temporal"],
        "checkpoint": "checkpoints/cloudless_model_d_uncertainty.pt"
    },
    "utilise_temporal": {
        "id": "utilise_temporal",
        "name": "U-TILISE — Sequence-to-Sequence Multi-Temporal Imputation",
        "version": "1.5.0",
        "type": "Multi-Temporal Attention (3-6 Dates w/o SAR)",
        "description": "Fills multi-date time series gaps using seasonal DOY conditioning and temporal multi-head attention.",
        "input_modalities": ["optical_time_series", "mask_time_series", "doy_sequence"],
        "checkpoint": "checkpoints/utilise_temporal_v1.pt"
    },
    "model_e": {
        "id": "model_e",
        "name": "Model E — Diffusion Bridge (DB-CR High Fidelity)",
        "version": "3.0.0-exp",
        "type": "Cross-Modality Latent Diffusion Bridge",
        "description": "Direct bridge between cloudy and cloud-free distributions with multi-sample variance uncertainty.",
        "input_modalities": ["optical_cloudy", "cloud_mask", "sar_vv_vh", "optical_temporal"],
        "checkpoint": "checkpoints/db_cr_diffusion_bridge.pt"
    }
}

