import json
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from PIL import Image

from ..config import PUBLIC_IMAGES_DIR, STORAGE_DIR
from ..pipeline.subcloud_labeling import classify_subcloud_features, SUBCLOUD_TAXONOMY
from ..pipeline.vegetation_health import analyze_vegetation_health, VEGETATION_HEALTH_TIERS

router = APIRouter(prefix="/analytics", tags=["Geospatial Analytics & Labelling"])

@router.get("/subcloud-labels/demo")
def get_demo_subcloud_labels() -> Dict[str, Any]:
    """
    Returns the scientific under-cloud terrain labelling analysis for the demonstration scene:
    - Identifies features beneath cloud cover: Water, City, Roads, Forest, Mountain, Cropland, Barren.
    - Provides sub-cloud class breakdown (area in km2, percentage, and pixel count).
    - Image URLs for full thematic map and masked sub-cloud map.
    """
    recon_path = PUBLIC_IMAGES_DIR / "satellite-reconstructed-demo.jpg"
    mask_path = PUBLIC_IMAGES_DIR / "cloud-shadow-mask-demo.png"
    fcc_path = PUBLIC_IMAGES_DIR / "satellite-fcc-demo.jpg"
    sar_path = PUBLIC_IMAGES_DIR / "satellite-sar-demo.jpg"

    if not recon_path.exists() or not mask_path.exists():
        raise HTTPException(status_code=404, detail="Demo satellite assets not found")

    im_recon = Image.open(recon_path)
    im_mask = Image.open(mask_path)
    im_fcc = Image.open(fcc_path) if fcc_path.exists() else None
    im_sar = Image.open(sar_path) if sar_path.exists() else None

    results = classify_subcloud_features(
        reconstructed_img=im_recon,
        cloud_mask_img=im_mask,
        sar_img=im_sar,
        fcc_img=im_fcc
    )

    return {
        "status": "success",
        "taxonomy": [
            {
                "id": v["id"],
                "key": v["key"],
                "name": v["name"],
                "hex": v["hex"],
                "color": v["color"],
                "description": v["description"]
            }
            for k, v in SUBCLOUD_TAXONOMY.items() if k != 7
        ],
        "assets": {
            "full_thematic_url": "/images/satellite/subcloud-terrain-full-demo.png",
            "under_cloud_thematic_url": "/images/satellite/subcloud-terrain-masked-demo.png",
            "cloudy_optical_url": "/images/satellite/satellite-cloudy.jpg",
            "reconstructed_url": "/images/satellite/satellite-reconstructed-demo.jpg",
            "cloud_mask_url": "/images/satellite/cloud-shadow-mask-demo.png"
        },
        "subcloud_statistics": results["subcloud_statistics"],
        "full_scene_statistics": results["full_scene_statistics"],
        "summary": results["summary"]
    }

@router.get("/vegetation-health/demo")
def get_demo_vegetation_health() -> Dict[str, Any]:
    """
    Returns the Near-Infrared (NIR) multi-spectral vegetation health analysis for the demonstration scene:
    - Exact NDVI, SAVI, and canopy vigor distribution.
    - 5 USGS/ESA remote sensing vegetation health tiers.
    - Sub-cloud vegetation recovery assessment (quantifying biomass uncovered beneath clouds).
    """
    recon_path = PUBLIC_IMAGES_DIR / "satellite-reconstructed-demo.jpg"
    mask_path = PUBLIC_IMAGES_DIR / "cloud-shadow-mask-demo.png"
    fcc_path = PUBLIC_IMAGES_DIR / "satellite-fcc-demo.jpg"

    if not recon_path.exists() or not mask_path.exists():
        raise HTTPException(status_code=404, detail="Demo satellite assets not found")

    im_recon = Image.open(recon_path)
    im_mask = Image.open(mask_path)
    im_fcc = Image.open(fcc_path) if fcc_path.exists() else None

    results = analyze_vegetation_health(
        reconstructed_img=im_recon,
        cloud_mask_img=im_mask,
        fcc_img=im_fcc
    )

    return {
        "status": "success",
        "tiers": [
            {
                "key": k,
                "name": v["name"],
                "range": v["range"],
                "hex": v["hex"],
                "status": v["status"],
                "action": v["action"]
            }
            for k, v in VEGETATION_HEALTH_TIERS.items()
        ],
        "assets": {
            "discrete_health_url": "/images/satellite/vegetation-health-discrete-demo.png",
            "continuous_ndvi_url": "/images/satellite/vegetation-health-ndvi-demo.png",
            "fcc_url": "/images/satellite/satellite-fcc-demo.jpg",
            "reconstructed_url": "/images/satellite/satellite-reconstructed-demo.jpg"
        },
        "health_tiers_full": results["health_tiers_full"],
        "health_tiers_subcloud": results["health_tiers_subcloud"],
        "ndvi_distribution": results["ndvi_distribution"],
        "spectral_profile": results["spectral_profile"],
        "summary": results["summary"]
    }

@router.get("/probe-pixel")
def probe_pixel_values(
    norm_x: float = Query(..., ge=0.0, le=1.0, description="Normalized horizontal coordinate [0, 1]"),
    norm_y: float = Query(..., ge=0.0, le=1.0, description="Normalized vertical coordinate [0, 1]")
) -> Dict[str, Any]:
    """
    Interactive pixel probe: returns multi-spectral reflection, sub-cloud class,
    and vegetation health indices at the queried normalized coordinate.
    """
    import numpy as np

    recon_path = PUBLIC_IMAGES_DIR / "satellite-reconstructed-demo.jpg"
    mask_path = PUBLIC_IMAGES_DIR / "cloud-shadow-mask-demo.png"
    fcc_path = PUBLIC_IMAGES_DIR / "satellite-fcc-demo.jpg"

    if not recon_path.exists():
        raise HTTPException(status_code=404, detail="Demo satellite assets not found")

    im_recon = Image.open(recon_path).convert("RGB")
    w, h = im_recon.size
    px_x = int(np.clip(norm_x * (w - 1), 0, w - 1))
    px_y = int(np.clip(norm_y * (h - 1), 0, h - 1))

    rgb = np.array(im_recon, dtype=np.float32) / 255.0
    r_val = float(rgb[px_y, px_x, 0])
    g_val = float(rgb[px_y, px_x, 1])
    b_val = float(rgb[px_y, px_x, 2])

    # NIR from FCC if available
    if fcc_path.exists():
        im_fcc = Image.open(fcc_path).convert("RGB").resize((w, h))
        fcc_arr = np.array(im_fcc, dtype=np.float32) / 255.0
        nir_val = float(fcc_arr[px_y, px_x, 0])
        red_val = float(fcc_arr[px_y, px_x, 1])
    else:
        nir_val = float(np.clip(g_val * 1.55 - r_val * 0.40 + 0.05, 0.02, 1.0))
        red_val = r_val

    # Cloud mask check
    if mask_path.exists():
        im_mask = Image.open(mask_path).convert("L").resize((w, h))
        is_cloud_obscured = bool(np.array(im_mask)[px_y, px_x] > 120)
    else:
        is_cloud_obscured = False

    # NDVI
    denom = nir_val + red_val + 1e-6
    ndvi_val = round((nir_val - red_val) / denom, 3)
    savi_val = round(((nir_val - red_val) * 1.5) / (nir_val + red_val + 0.5 + 1e-6), 3)

    # Classify health
    if ndvi_val < 0.10:
        health_tier = VEGETATION_HEALTH_TIERS["non_vegetation"]
    elif ndvi_val < 0.25:
        health_tier = VEGETATION_HEALTH_TIERS["severely_stressed"]
    elif ndvi_val < 0.45:
        health_tier = VEGETATION_HEALTH_TIERS["moderate_stress"]
    elif ndvi_val < 0.70:
        health_tier = VEGETATION_HEALTH_TIERS["healthy"]
    else:
        health_tier = VEGETATION_HEALTH_TIERS["vibrant"]

    # Basic terrain heuristic for probed point
    if (g_val - nir_val) / (g_val + nir_val + 1e-5) > 0.05 or ((r_val + g_val + b_val)/3 < 0.18 and b_val >= r_val):
        terrain_name = "Water Body (River / Lake)"
        terrain_color = "#2563eb"
    elif ndvi_val > 0.48:
        terrain_name = "Dense Forest & Canopy"
        terrain_color = "#15803d"
    elif ndvi_val >= 0.25:
        terrain_name = "Cropland / Agriculture"
        terrain_color = "#eab308"
    elif (r_val + g_val + b_val)/3 > 0.48 and ndvi_val < 0.25:
        terrain_name = "City / Built-up Area"
        terrain_color = "#ef4444"
    else:
        terrain_name = "Mountain / Soil / Mixed Terrain"
        terrain_color = "#64748b"

    return {
        "pixel_coord": {"x": px_x, "y": px_y, "norm_x": round(norm_x, 4), "norm_y": round(norm_y, 4)},
        "was_beneath_cloud": is_cloud_obscured,
        "terrain_class": terrain_name,
        "terrain_color": terrain_color,
        "reflectance": {
            "green_b2": round(g_val, 3),
            "red_b3": round(red_val, 3),
            "nir_b4": round(nir_val, 3),
            "brightness": round((r_val + g_val + b_val) / 3.0, 3)
        },
        "vegetation": {
            "ndvi": ndvi_val,
            "savi": savi_val,
            "tier_name": health_tier["name"],
            "status": health_tier["status"],
            "hex": health_tier["hex"],
            "action": health_tier["action"]
        }
    }
