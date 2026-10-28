import numpy as np
from PIL import Image, ImageOps, ImageFilter
from typing import Dict, Any, Tuple, Optional, List
import io
import base64
from scipy.ndimage import uniform_filter, generic_gradient_magnitude, sobel, laplace, gaussian_filter

# Sub-Cloud Terrain Classification Taxonomy
SUBCLOUD_TAXONOMY = {
    0: {
        "id": 0,
        "key": "water",
        "name": "Water Bodies (River / Lake / Sea)",
        "color": [37, 99, 235],
        "hex": "#2563eb",
        "description": "Perennial river channels, oxbow lakes, reservoirs, and open water bodies identified through NDWI and low SAR specular backscatter."
    },
    1: {
        "id": 1,
        "key": "city",
        "name": "City / Built-up / Urban",
        "color": [239, 68, 68],
        "hex": "#ef4444",
        "description": "High-density settlements, residential clusters, industrial zones, and commercial structures characterized by high spatial frequency and texture variance."
    },
    2: {
        "id": 2,
        "key": "road",
        "name": "Roads & Transportation Corridors",
        "color": [249, 115, 22],
        "hex": "#f97316",
        "description": "Linear transportation corridors, paved highways, arterial roads, and connecting transport links delineated via multi-scale morphological ridge filters."
    },
    3: {
        "id": 3,
        "key": "forest",
        "name": "Dense Forest & Canopy",
        "color": [21, 128, 61],
        "hex": "#15803d",
        "description": "Continuous evergreen and deciduous forest canopies with strong chlorophyll NIR absorption and high textural entropy."
    },
    4: {
        "id": 4,
        "key": "mountain",
        "name": "Mountain & High-Relief Terrain",
        "color": [100, 116, 139],
        "hex": "#64748b",
        "description": "Steep slopes, rugged ridgelines, and elevated topographic relief identified through shaded directional Laplacian gradients."
    },
    5: {
        "id": 5,
        "key": "cropland",
        "name": "Agriculture / Cropland",
        "color": [234, 179, 8],
        "hex": "#eab308",
        "description": "Active agricultural plots, seasonal paddy fields, and cultivated plains with uniform moderate-to-high vegetation index."
    },
    6: {
        "id": 6,
        "key": "barren",
        "name": "Barren / Exposed Soil",
        "color": [180, 83, 9],
        "hex": "#b45309",
        "description": "Exposed sandbanks, fallow agricultural plots, rocky outcrops, and cleared non-vegetated terrain."
    },
    7: {
        "id": 7,
        "key": "cloud_obscured",
        "name": "Cloud / Unresolved",
        "color": [241, 245, 249],
        "hex": "#f1f5f9",
        "description": "Obscured baseline region before AI reconstruction."
    }
}

def extract_linear_features(brightness: np.ndarray) -> np.ndarray:
    """
    Extracts linear transport corridors (roads/highways) using oriented directional ridge filters.
    Roads appear as thin, high-contrast linear structures with low local cross-sectional curvature.
    """
    # Horizontal, vertical, and diagonal gradient responses
    sx = sobel(brightness, axis=1)
    sy = sobel(brightness, axis=0)
    mag = np.sqrt(sx**2 + sy**2)
    
    # Second-order laplacian of gaussian
    smooth = gaussian_filter(brightness, sigma=1.0)
    lap = np.abs(laplace(smooth))
    
    # Morphological line enhancement: narrow ridge response
    local_min_3 = uniform_filter(brightness, size=3)
    local_mean_7 = uniform_filter(brightness, size=7)
    ridge_indicator = np.abs(brightness - local_mean_7) / (local_mean_7 + 1e-4)
    
    # Roads have high edge-to-variance ratio and narrow span
    road_response = (mag > 0.12) & (lap > 0.08) & (ridge_indicator > 0.06)
    return road_response.astype(np.float32)

def extract_topographic_relief(brightness: np.ndarray) -> np.ndarray:
    """
    Extracts elevated mountain/high-relief topography using directional shading variance
    and high-pass micro-relief gradients typical of mountain slopes.
    """
    smooth_broad = gaussian_filter(brightness, sigma=4.0)
    smooth_fine = gaussian_filter(brightness, sigma=1.2)
    relief_diff = np.abs(smooth_broad - smooth_fine)
    
    # Laplacian curvature of terrain
    grad_x = np.abs(np.gradient(brightness, axis=1))
    grad_y = np.abs(np.gradient(brightness, axis=0))
    roughness = uniform_filter(grad_x + grad_y, size=9)
    
    mountain_score = relief_diff * 2.5 + roughness * 3.0
    return mountain_score

def classify_subcloud_features(
    reconstructed_img: Image.Image,
    cloud_mask_img: Image.Image,
    sar_img: Optional[Image.Image] = None,
    fcc_img: Optional[Image.Image] = None,
    spatial_resolution_m: float = 5.0
) -> Dict[str, Any]:
    """
    Scientific Sub-Cloud Feature Labelling Engine:
    Classifies the reconstructed surface beneath cloud cover into:
    - City / Built-up
    - Water Bodies (River, Lake, Sea)
    - Roads / Infrastructure
    - Dense Forest
    - Mountain / High Relief
    - Agriculture / Cropland
    - Barren / Soil
    
    Specifically isolates and quantifies the features recovered inside the cloud footprint.
    """
    w, h = reconstructed_img.size
    rgb = np.array(reconstructed_img.convert("RGB"), dtype=np.float32) / 255.0
    mask_arr = np.array(cloud_mask_img.convert("L").resize((w, h)), dtype=np.float32) > 120
    
    r = rgb[:, :, 0]
    g = rgb[:, :, 1]
    b = rgb[:, :, 2]
    brightness = (r + g + b) / 3.0
    
    # If FCC provided (R=NIR, G=Red, B=Green), extract physical NIR band
    if fcc_img is not None:
        fcc_arr = np.array(fcc_img.convert("RGB").resize((w, h)), dtype=np.float32) / 255.0
        nir = fcc_arr[:, :, 0]
    else:
        # High-fidelity NIR proxy for vegetation from green-red-blue balance
        nir = np.clip(g * 1.45 - r * 0.45 + (1.0 - brightness) * 0.1, 0.0, 1.0)
        
    # If SAR provided (VV/VH dual-pol microwave backscatter)
    if sar_img is not None:
        sar_arr = np.array(sar_img.convert("RGB").resize((w, h)), dtype=np.float32) / 255.0
        sar_power = sar_arr.mean(axis=2)
    else:
        sar_power = np.full((h, w), 0.5, dtype=np.float32)

    # Spectral indices
    ndvi = (nir - r) / (nir + r + 1e-5)
    ndwi = (g - nir) / (g + nir + 1e-5)
    color_max = np.maximum(np.maximum(r, g), b)
    color_min = np.minimum(np.minimum(r, g), b)
    saturation = (color_max - color_min) / (color_max + 1e-5)
    
    # Structural features
    road_indicator = extract_linear_features(brightness)
    mountain_score = extract_topographic_relief(brightness)
    
    # Initialize classification matrix
    labels = np.full((h, w), 5, dtype=np.int32) # Default: Agriculture / Cropland
    
    # 1. Water Bodies (River, Lake, Sea)
    # Low reflectance, positive NDWI, low SAR specular reflection
    is_water = ((ndwi > 0.05) | ((brightness < 0.20) & (b >= r * 0.95))) & (ndvi < 0.15) & (sar_power < 0.45)
    labels[is_water] = 0
    
    # 2. Dense Forest
    # High NDVI, strong NIR, moderate-to-low brightness
    is_forest = (ndvi > 0.48) & (brightness < 0.42) & (~is_water)
    labels[is_forest] = 3
    
    # 3. Mountain & High-Relief Terrain
    # High topographic roughness, elevated relief, slopes
    is_mountain = (mountain_score > 0.35) & (brightness > 0.18) & (ndvi < 0.45) & (~is_water)
    labels[is_mountain] = 4
    
    # 4. City / Built-up / Urban
    # High brightness, low saturation, moderate texture, built clusters
    urban_texture = uniform_filter(brightness ** 2, size=5) - (uniform_filter(brightness, size=5) ** 2)
    is_urban = (brightness > 0.48) & (saturation < 0.32) & (ndvi < 0.26) & (urban_texture > 0.005) & (~is_water) & (~is_mountain)
    labels[is_urban] = 1
    
    # 5. Roads & Transport Networks
    # Thin linear connected corridors, distinct from city clusters and water
    is_road = (road_indicator > 0.5) & (ndvi < 0.28) & (brightness > 0.25) & (~is_water) & (labels != 1)
    labels[is_road] = 2
    
    # 6. Barren / Exposed Soil
    # High red reflectance, low NDVI, moderate-to-high brightness
    is_barren = (r > g * 1.04) & (brightness >= 0.38) & (ndvi < 0.22) & (~is_urban) & (~is_road) & (~is_water)
    labels[is_barren] = 6
    
    # 7. Agriculture / Cropland
    # Remaining moderate-high NDVI vegetated plots
    is_agri = (ndvi >= 0.24) & (ndvi <= 0.48) & (~is_water) & (~is_forest) & (~is_urban)
    labels[is_agri] = 5

    # Pixel to Area calculation
    pixel_area_m2 = spatial_resolution_m * spatial_resolution_m
    m2_to_km2 = 1e-6
    total_pixels = h * w
    cloud_pixels = int(np.sum(mask_arr))
    cloud_pct = round((cloud_pixels / total_pixels) * 100.0, 2)
    
    # Generate Thematic Color Maps
    full_thematic_rgb = np.zeros((h, w, 3), dtype=np.uint8)
    under_cloud_thematic_rgb = np.full((h, w, 3), 241, dtype=np.uint8) # Default light background for non-cloud
    
    for class_id, info in SUBCLOUD_TAXONOMY.items():
        if class_id == 7:
            continue
        c_mask = (labels == class_id)
        full_thematic_rgb[c_mask] = info["color"]
        
        # In under-cloud map: show class colors strictly inside the cloud mask
        under_cloud_thematic_rgb[c_mask & mask_arr] = info["color"]

    full_thematic_img = Image.fromarray(full_thematic_rgb, mode="RGB")
    under_cloud_thematic_img = Image.fromarray(under_cloud_thematic_rgb, mode="RGB")

    # Compute Statistics for Full Scene AND Under-Cloud Area
    full_class_stats = []
    subcloud_class_stats = []
    
    for class_id in range(7):
        info = SUBCLOUD_TAXONOMY[class_id]
        
        # Full scene count
        c_total_px = int(np.sum(labels == class_id))
        full_pct = round((c_total_px / total_pixels) * 100.0, 2)
        full_km2 = round((c_total_px * pixel_area_m2) * m2_to_km2, 2)
        
        # Sub-cloud count
        c_subcloud_px = int(np.sum((labels == class_id) & mask_arr))
        subcloud_pct = round((c_subcloud_px / max(1, cloud_pixels)) * 100.0, 2)
        subcloud_km2 = round((c_subcloud_px * pixel_area_m2) * m2_to_km2, 2)
        
        stat_item = {
            "id": class_id,
            "key": info["key"],
            "name": info["name"],
            "color": info["color"],
            "hex": info["hex"],
            "description": info["description"]
        }
        
        full_class_stats.append({
            **stat_item,
            "pixel_count": c_total_px,
            "area_km2": full_km2,
            "percentage": full_pct
        })
        
        subcloud_class_stats.append({
            **stat_item,
            "pixel_count": c_subcloud_px,
            "area_km2": subcloud_km2,
            "percentage": subcloud_pct
        })

    # Linear road estimation (connected pixel length * resolution)
    road_pixels_subcloud = int(np.sum((labels == 2) & mask_arr))
    estimated_road_subcloud_km = round((road_pixels_subcloud * spatial_resolution_m) / 1000.0, 2)

    # Sort sub-cloud features by prominence
    sorted_subcloud = sorted(subcloud_class_stats, key=lambda x: x["area_km2"], reverse=True)
    dominant_feature = sorted_subcloud[0]["name"] if sorted_subcloud else "Agriculture"

    return {
        "full_thematic_img": full_thematic_img,
        "under_cloud_thematic_img": under_cloud_thematic_img,
        "subcloud_statistics": subcloud_class_stats,
        "full_scene_statistics": full_class_stats,
        "summary": {
            "total_scene_area_km2": round((total_pixels * pixel_area_m2) * m2_to_km2, 2),
            "cloud_covered_area_km2": round((cloud_pixels * pixel_area_m2) * m2_to_km2, 2),
            "cloud_coverage_percentage": cloud_pct,
            "dominant_subcloud_feature": dominant_feature,
            "road_network_recovered_km": estimated_road_subcloud_km,
            "water_bodies_subcloud_km2": next((s["area_km2"] for s in subcloud_class_stats if s["key"] == "water"), 0.0),
            "forest_subcloud_km2": next((s["area_km2"] for s in subcloud_class_stats if s["key"] == "forest"), 0.0),
            "city_subcloud_km2": next((s["area_km2"] for s in subcloud_class_stats if s["key"] == "city"), 0.0),
            "mountain_subcloud_km2": next((s["area_km2"] for s in subcloud_class_stats if s["key"] == "mountain"), 0.0),
            "cropland_subcloud_km2": next((s["area_km2"] for s in subcloud_class_stats if s["key"] == "cropland"), 0.0)
        }
    }
