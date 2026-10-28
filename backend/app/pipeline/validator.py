import os
from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
from PIL import Image
from ..config import DEFAULT_CRS, DEFAULT_GSD

def validate_satellite_scene(file_path: str) -> Dict[str, Any]:
    """
    Validates geospatial satellite scene: format, dimensions, band count,
    auto-detects CRS from raster metadata (falling back to DEFAULT_CRS),
    and checks NoData explicitly from raster metadata (not assuming 0 is nodata).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Scene file not found: {file_path}")

    # Attempt geospatial raster inspection via rasterio
    try:
        import rasterio
        with rasterio.open(file_path) as src:
            width = src.width
            height = src.height
            bands = src.count
            crs = src.crs.to_string() if src.crs else DEFAULT_CRS
            nodata = src.nodata
            gsd = src.res[0] if src.res else DEFAULT_GSD

            # Check nodata ratio using raster metadata value
            data = src.read(1)
            if nodata is not None:
                nodata_ratio = float(np.mean(data == nodata))
            else:
                nodata_ratio = 0.0

            return {
                "valid": True,
                "width": width,
                "height": height,
                "bands": bands,
                "mode": f"GeoTIFF_{bands}Band",
                "crs": crs,
                "gsd_meters": round(float(gsd), 2),
                "nodata_value": nodata,
                "nodata_ratio": round(nodata_ratio, 4),
                "file_size_bytes": os.path.getsize(file_path),
                "error": None
            }
    except Exception:
        # Fallback to standard PIL inspection for standard image files (.png, .jpg)
        try:
            im = Image.open(file_path)
            width, height = im.size
            mode = im.mode
            bands = len(im.getbands()) if hasattr(im, "getbands") else 3

            return {
                "valid": True,
                "width": width,
                "height": height,
                "bands": bands,
                "mode": mode,
                "crs": DEFAULT_CRS,
                "gsd_meters": DEFAULT_GSD,
                "nodata_value": None,
                "nodata_ratio": 0.0,
                "file_size_bytes": os.path.getsize(file_path),
                "error": None
            }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }

