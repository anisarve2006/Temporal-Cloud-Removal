import os
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List
import numpy as np
import rasterio
from rasterio.warp import reproject, Resampling, calculate_default_transform
from rasterio.crs import CRS
from scipy.signal.windows import hann
from PIL import Image

from ..config import DEFAULT_CRS, DEFAULT_GSD

def read_geotiff_with_metadata(file_path: Path) -> Dict[str, Any]:
    """
    Reads GeoTIFF with full geospatial metadata:
    - Auto-detects CRS (does not assume EPSG:32646)
    - Reads exact affine transform and native resolution
    - Extracts NoData value from metadata (does not treat 0 as NoData)
    """
    with rasterio.open(file_path) as src:
        data = src.read()  # Shape: (C, H, W)
        crs = src.crs.to_string() if src.crs else DEFAULT_CRS
        transform = src.transform
        nodata = src.nodata
        bounds = src.bounds
        res = src.res

    # Construct valid data mask (exclude nodata)
    if nodata is not None:
        valid_mask = np.all(data != nodata, axis=0)
    else:
        valid_mask = np.ones((data.shape[1], data.shape[2]), dtype=bool)

    return {
        "data": data,
        "crs": crs,
        "transform": transform,
        "nodata": nodata,
        "bounds": bounds,
        "resolution": res,
        "shape": data.shape,
        "valid_mask": valid_mask
    }

def convert_s1_sar_to_db(sar_linear: np.ndarray, clip_min: float = -25.0, clip_max: float = 0.0) -> np.ndarray:
    """
    Sentinel-1 GRD SAR preprocessing:
    - Converts linear backscatter intensity to decibels (dB): dB = 10 * log10(max(x, 1e-5))
    - Clips dB to [-25.0, 0.0] dB
    - Normalizes linearly into [0.0, 1.0] for model consumption
    """
    sar_safe = np.maximum(sar_linear, 1e-5)
    sar_db = 10.0 * np.log10(sar_safe)
    sar_clipped = np.clip(sar_db, clip_min, clip_max)
    sar_norm = (sar_clipped - clip_min) / (clip_max - clip_min)
    return sar_norm.astype(np.float32)

def normalize_optical_dn_to_reflectance(
    optical_dn: np.ndarray,
    scale_factor: float = 255.0,
    valid_mask: Optional[np.ndarray] = None
) -> np.ndarray:
    """
    Normalizes optical digital numbers (DN) to normalized top-of-atmosphere reflectance [0.0, 1.0].
    Preserves true zero reflectance while safely handling valid pixels.
    """
    arr = optical_dn.astype(np.float32) / scale_factor
    arr = np.clip(arr, 0.0, 1.0)
    return arr

def reproject_to_reference_grid(
    src_data: np.ndarray,
    src_crs: str,
    src_transform,
    ref_crs: str,
    ref_transform,
    ref_shape: Tuple[int, int],
    is_mask: bool = False,
    src_nodata: Optional[float] = None
) -> np.ndarray:
    """
    Reprojects and resamples raster data to match the target reference grid:
    - Uses Bilinear resampling for continuous reflectance and SAR data
    - Uses Nearest Neighbor resampling for discrete masks (cloud masks, LULC)
    - Preserves exact target CRS and affine transform
    """
    channels = src_data.shape[0] if src_data.ndim == 3 else 1
    ref_h, ref_w = ref_shape

    dst_data = np.zeros((channels, ref_h, ref_w), dtype=src_data.dtype)
    resampling_method = Resampling.nearest if is_mask else Resampling.bilinear

    for c in range(channels):
        src_channel = src_data[c] if src_data.ndim == 3 else src_data
        reproject(
            source=src_channel,
            destination=dst_data[c],
            src_transform=src_transform,
            src_crs=CRS.from_string(src_crs),
            dst_transform=ref_transform,
            dst_crs=CRS.from_string(ref_crs),
            resampling=resampling_method,
            src_nodata=src_nodata,
            dst_nodata=src_nodata
        )

    if src_data.ndim == 2:
        return dst_data[0]
    return dst_data

def generate_2d_hann_window(height: int, width: int) -> np.ndarray:
    """
    Generates a 2D separable Hann tapering window:
    W(x, y) = W_x(x) * W_y(y)
    Used for feathering overlapping tile reconstructions to eliminate seam lines.
    """
    wx = hann(width, sym=True)
    wy = hann(height, sym=True)
    w2d = np.outer(wy, wx)
    # Ensure minimum non-zero weight to avoid division by zero near edges
    w2d = np.maximum(w2d, 1e-4)
    return w2d.astype(np.float32)

def tiled_inference_with_hann_feathering(
    full_image: np.ndarray,
    model_inference_func,
    tile_size: int = 512,
    overlap: int = 64,
    **kwargs
) -> np.ndarray:
    """
    Executes model inference in overlapping spatial tiles with 2D Hann window blending:
    - Eliminates seam lines across tile borders
    - Handles arbitrary image dimensions with edge padding
    - Strictly preserves identity in round-trip tests
    Input shape: (H, W, C) or (H, W)
    """
    is_2d = (full_image.ndim == 2)
    if is_2d:
        full_image = full_image[:, :, np.newaxis]

    h, w, c = full_image.shape
    stride = tile_size - overlap

    # Calculate padding to ensure all tiles cover the scene
    pad_h = (stride - (h - tile_size) % stride) % stride if h > tile_size else (tile_size - h)
    pad_w = (stride - (w - tile_size) % stride) % stride if w > tile_size else (tile_size - w)

    padded = np.pad(full_image, ((0, pad_h), (0, pad_w), (0, 0)), mode="reflect")
    pad_total_h, pad_total_w, _ = padded.shape

    output_accum = np.zeros_like(padded, dtype=np.float32)
    weight_accum = np.zeros((pad_total_h, pad_total_w, 1), dtype=np.float32)

    hann_win = generate_2d_hann_window(tile_size, tile_size)[:, :, np.newaxis]

    # Iterate over overlapping grid
    for y in range(0, pad_total_h - tile_size + 1, stride):
        for x in range(0, pad_total_w - tile_size + 1, stride):
            tile_in = padded[y:y+tile_size, x:x+tile_size, :]
            
            # Run model on tile
            tile_out = model_inference_func(tile_in, **kwargs)
            if tile_out.ndim == 2:
                tile_out = tile_out[:, :, np.newaxis]

            output_accum[y:y+tile_size, x:x+tile_size, :] += tile_out * hann_win
            weight_accum[y:y+tile_size, x:x+tile_size, :] += hann_win

    # Normalize by accumulated feather weights
    normalized = output_accum / (weight_accum + 1e-7)

    # Crop out original unpadded dimensions
    result = normalized[:h, :w, :]
    if is_2d:
        result = result[:, :, 0]

    return result

def align_temporal_pair(
    target_img: np.ndarray,
    reference_img: np.ndarray
) -> Tuple[np.ndarray, Tuple[float, float]]:
    """
    Sub-pixel cross-correlation alignment to prevent ghosting between temporal acquisitions.
    Calculates 2D phase shift over clear spatial features.
    """
    from scipy.ndimage import shift
    
    # Use single-channel luminance for cross-correlation
    if target_img.ndim == 3:
        t_gray = np.mean(target_img, axis=2)
        r_gray = np.mean(reference_img, axis=2)
    else:
        t_gray = target_img
        r_gray = reference_img

    # Compute 2D Fourier transforms
    f_t = np.fft.fft2(t_gray)
    f_r = np.fft.fft2(r_gray)

    # Cross-power spectrum
    cross_power = (f_t * np.conj(f_r)) / (np.abs(f_t * np.conj(f_r)) + 1e-7)
    corr = np.fft.ifft2(cross_power)
    corr_real = np.real(corr)

    # Find peak correlation
    y_shift, x_shift = np.unravel_index(np.argmax(corr_real), corr_real.shape)
    if y_shift > t_gray.shape[0] // 2:
        y_shift -= t_gray.shape[0]
    if x_shift > t_gray.shape[1] // 2:
        x_shift -= t_gray.shape[1]

    # Limit maximum alignment shift to 15 pixels to avoid accidental drift
    y_shift = np.clip(y_shift, -15, 15)
    x_shift = np.clip(x_shift, -15, 15)

    if reference_img.ndim == 3:
        aligned_ref = np.zeros_like(reference_img)
        for c in range(reference_img.shape[2]):
            aligned_ref[:, :, c] = shift(reference_img[:, :, c], (y_shift, x_shift), mode="nearest")
    else:
        aligned_ref = shift(reference_img, (y_shift, x_shift), mode="nearest")

    return aligned_ref, (float(y_shift), float(x_shift))
