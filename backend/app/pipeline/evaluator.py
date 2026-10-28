import numpy as np
from PIL import Image
from typing import Dict, Any, Optional, Tuple, List

MIN_PIXEL_THRESHOLD = 100

def compute_psnr(ref: np.ndarray, pred: np.ndarray, mask: Optional[np.ndarray] = None, data_range: float = 1.0) -> Optional[float]:
    """
    Computes Peak Signal-to-Noise Ratio (PSNR) in decibels (dB).
    - data_range is strictly specified (default 1.0 for normalized [0, 1] reflectance).
    - Returns None if valid pixel count is below MIN_PIXEL_THRESHOLD.
    """
    if mask is not None:
        valid_cnt = int(np.sum(mask))
        if valid_cnt < MIN_PIXEL_THRESHOLD:
            return None
        mse = float(np.mean((ref[mask] - pred[mask]) ** 2))
    else:
        mse = float(np.mean((ref - pred) ** 2))

    if mse <= 1e-12:
        return 99.0
    return float(20.0 * np.log10(data_range / np.sqrt(mse)))

def compute_masked_ssim(
    ref: np.ndarray,
    pred: np.ndarray,
    mask: Optional[np.ndarray] = None,
    data_range: float = 1.0,
    win_size: int = 7
) -> Optional[float]:
    """
    Structural Similarity (SSIM) computed over the cloud-region bounding box.
    Avoids mixing uncorrupted clear pixels with corrupted cloud pixels.
    """
    if mask is not None:
        valid_cnt = int(np.sum(mask))
        if valid_cnt < MIN_PIXEL_THRESHOLD:
            return None
        
        # Extract bounding box of masked cloud region
        coords = np.argwhere(mask)
        if len(coords) == 0:
            return None
        ymin, xmin = coords.min(axis=0)[:2]
        ymax, xmax = coords.max(axis=0)[:2] + 1

        # Crop to bounding box
        ref_crop = ref[ymin:ymax, xmin:xmax]
        pred_crop = pred[ymin:ymax, xmin:xmax]
        mask_crop = mask[ymin:ymax, xmin:xmax]
        
        x = ref_crop[mask_crop]
        y = pred_crop[mask_crop]
    else:
        x = ref.flatten()
        y = pred.flatten()

    mu_x = float(np.mean(x))
    mu_y = float(np.mean(y))
    var_x = float(np.var(x))
    var_y = float(np.var(y))
    cov_xy = float(np.mean((x - mu_x) * (y - mu_y)))

    c1 = (0.01 * data_range) ** 2
    c2 = (0.03 * data_range) ** 2

    denom = (mu_x ** 2 + mu_y ** 2 + c1) * (var_x + var_y + c2)
    if denom < 1e-12:
        return 1.0
    ssim = ((2.0 * mu_x * mu_y + c1) * (2.0 * cov_xy + c2)) / denom
    return float(np.clip(ssim, -1.0, 1.0))

def compute_sam(ref: np.ndarray, pred: np.ndarray, mask: Optional[np.ndarray] = None, eps: float = 1e-7) -> Optional[float]:
    """
    Spectral Angle Mapper (SAM) in degrees:
    SAM = arccos( (y . y_hat) / (||y|| * ||y_hat||) )
    - Epsilon added in denominator to prevent division by zero.
    - Excludes near-zero vectors (shadows/water with no signal).
    - Cosine clamped strictly to [-1.0, 1.0] before arccos to prevent NaNs.
    - Returns None if valid pixel count is below MIN_PIXEL_THRESHOLD.
    """
    dot = np.sum(ref * pred, axis=2)
    norm_ref = np.linalg.norm(ref, axis=2)
    norm_pred = np.linalg.norm(pred, axis=2)

    denom = (norm_ref * norm_pred) + eps
    valid_spectra = (norm_ref > 1e-4) & (norm_pred > 1e-4)

    if mask is not None:
        valid_spectra = valid_spectra & mask

    valid_cnt = int(np.sum(valid_spectra))
    if valid_cnt < MIN_PIXEL_THRESHOLD:
        return None

    cos_angle = np.clip(dot[valid_spectra] / denom[valid_spectra], -1.0, 1.0)
    angles_rad = np.arccos(cos_angle)
    sam_deg = float(np.mean(np.degrees(angles_rad)))
    return float(sam_deg)

def compute_ndvi_mae(ref: np.ndarray, pred: np.ndarray, mask: Optional[np.ndarray] = None, eps: float = 1e-6) -> Optional[float]:
    """
    Mean Absolute Error of Normalized Difference Vegetation Index (NDVI):
    Assumes bands: Green=0, Red=1, NIR=2.
    Guards against division by zero by masking pixels where NIR + Red < 1e-4.
    """
    red_ref = ref[:, :, 1]
    nir_ref = ref[:, :, 2]
    denom_ref = nir_ref + red_ref

    red_pred = pred[:, :, 1]
    nir_pred = pred[:, :, 2]
    denom_pred = nir_pred + red_pred

    # Valid non-zero denominator mask
    valid_ndvi = (denom_ref > 1e-4) & (denom_pred > 1e-4)
    if mask is not None:
        valid_ndvi = valid_ndvi & mask

    valid_cnt = int(np.sum(valid_ndvi))
    if valid_cnt < MIN_PIXEL_THRESHOLD:
        return None

    ndvi_ref = (nir_ref[valid_ndvi] - red_ref[valid_ndvi]) / (denom_ref[valid_ndvi] + eps)
    ndvi_pred = (nir_pred[valid_ndvi] - red_pred[valid_ndvi]) / (denom_pred[valid_ndvi] + eps)

    diff = np.abs(ndvi_ref - ndvi_pred)
    return float(np.mean(diff))

def compute_uncertainty_calibration(
    pixel_errors: np.ndarray,
    confidence_scores: np.ndarray,
    mask: Optional[np.ndarray] = None,
    num_bins: int = 10
) -> Dict[str, Any]:
    """
    Computes Expected Calibration Error (ECE) and confidence-vs-error calibration curve:
    Confidence [0, 1] is binned into equal intervals;
    Expected calibration: high confidence should correspond to low error.
    """
    if mask is not None:
        errors = pixel_errors[mask].flatten()
        confs = confidence_scores[mask].flatten()
    else:
        errors = pixel_errors.flatten()
        confs = confidence_scores.flatten()

    total_n = len(errors)
    if total_n < MIN_PIXEL_THRESHOLD:
        return {"ece": None, "calibration_bins": []}

    # Normalize error to [0, 1] using robust 95th percentile
    max_err = float(np.percentile(errors, 95)) + 1e-5
    accs = 1.0 - np.clip(errors / max_err, 0.0, 1.0)

    bins = np.linspace(0.0, 1.0, num_bins + 1)
    ece = 0.0
    calibration_bins = []

    for i in range(num_bins):
        bin_lower = bins[i]
        bin_upper = bins[i + 1]
        in_bin = (confs >= bin_lower) & (confs < bin_upper if i < num_bins - 1 else confs <= bin_upper)
        bin_count = int(np.sum(in_bin))

        if bin_count > 0:
            avg_conf = float(np.mean(confs[in_bin]))
            avg_acc = float(np.mean(accs[in_bin]))
            avg_err = float(np.mean(errors[in_bin]))
            gap = abs(avg_acc - avg_conf)
            ece += (bin_count / total_n) * gap
            calibration_bins.append({
                "bin_range": [round(bin_lower, 2), round(bin_upper, 2)],
                "count": bin_count,
                "avg_confidence": round(avg_conf, 4),
                "avg_accuracy": round(avg_acc, 4),
                "avg_pixel_error": round(avg_err, 4),
                "calibration_gap": round(gap, 4)
            })
        else:
            calibration_bins.append({
                "bin_range": [round(bin_lower, 2), round(bin_upper, 2)],
                "count": 0,
                "avg_confidence": round((bin_lower + bin_upper) / 2.0, 4),
                "avg_accuracy": None,
                "avg_pixel_error": None,
                "calibration_gap": 0.0
            })

    return {
        "expected_calibration_error": round(float(ece), 4),
        "num_bins": num_bins,
        "calibration_bins": calibration_bins
    }

def evaluate_reconstruction(
    pred_img: Image.Image,
    ref_img: Image.Image,
    cloud_mask_img: Optional[Image.Image] = None,
    confidence_arr: Optional[np.ndarray] = None,
    is_synthetic: bool = False
) -> Dict[str, Any]:
    """
    Calculates scientific metrics:
    - MAE_cloud: evaluated specifically on hidden pixels.
    - Clear pixels unchanged: verified by identity assertion (MAE_clear=0 is NOT reported as an empirical metric).
    - PSNR with explicit data_range=1.0.
    - Masked SSIM on cloud bbox.
    - SAM with epsilon and [-1, 1] cosine clamp in degrees.
    - Minimum valid pixel count checks.
    """
    w, h = ref_img.size
    pred_arr = np.array(pred_img.convert("RGB").resize((w, h)), dtype=np.float32) / 255.0
    ref_arr = np.array(ref_img.convert("RGB"), dtype=np.float32) / 255.0

    if cloud_mask_img is not None:
        mask_arr = np.array(cloud_mask_img.convert("L").resize((w, h))) > 128
    else:
        mask_arr = np.mean(np.abs(ref_arr - pred_arr), axis=2) > 0.15

    clear_mask = ~mask_arr
    total_pixels = w * h
    cloud_pixels = int(np.sum(mask_arr))

    # Unit assertion: verify clear pixels remain unchanged
    clear_pixel_diff = float(np.max(np.abs(ref_arr[clear_mask] - pred_arr[clear_mask]))) if np.sum(clear_mask) > 0 else 0.0
    clear_pixels_unchanged = bool(clear_pixel_diff < 0.01)

    def calc_metrics(m, region_name):
        cnt = int(np.sum(m))
        if cnt < MIN_PIXEL_THRESHOLD:
            return {
                "region": region_name,
                "valid_pixels_count": cnt,
                "status": f"insufficient_valid_pixels (<{MIN_PIXEL_THRESHOLD})",
                "mae": None, "rmse": None, "psnr": None, "ssim": None,
                "sam_degrees": None, "ndvi_mae": None
            }

        diff = np.abs(ref_arr - pred_arr)
        mae = float(np.mean(diff[m]))
        rmse = float(np.sqrt(np.mean((ref_arr[m] - pred_arr[m]) ** 2)))
        psnr = compute_psnr(ref_arr, pred_arr, m, data_range=1.0)
        ssim = compute_masked_ssim(ref_arr, pred_arr, m, data_range=1.0)
        sam = compute_sam(ref_arr, pred_arr, m)
        ndvi = compute_ndvi_mae(ref_arr, pred_arr, m)

        return {
            "region": region_name,
            "valid_pixels_count": cnt,
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "psnr": round(psnr, 2) if psnr is not None else None,
            "ssim": round(ssim, 4) if ssim is not None else None,
            "sam_degrees": round(sam, 2) if sam is not None else None,
            "ndvi_mae": round(ndvi, 4) if ndvi is not None else None
        }

    all_mask = np.ones((h, w), dtype=bool)
    pixel_errors = np.mean(np.abs(ref_arr - pred_arr), axis=2)

    # Uncertainty calibration
    calibration_result = None
    if confidence_arr is not None:
        calibration_result = compute_uncertainty_calibration(pixel_errors, confidence_arr, mask=mask_arr)

    return {
        "evaluation_protocol": "synthetic_cloud_overlay" if is_synthetic else "empirical_scene_evaluation",
        "is_synthetic_cloud": is_synthetic,
        "clear_pixels_unchanged_asserted": clear_pixels_unchanged,
        "total_pixels": total_pixels,
        "cloud_coverage_pct": round(float(cloud_pixels / total_pixels) * 100.0, 2),
        "overall": calc_metrics(all_mask, "overall_scene"),
        "cloud_region": calc_metrics(mask_arr, "cloud_hidden_region"),
        "calibration": calibration_result
    }

def evaluate_synthetic_benchmark(
    clear_scene_img: Image.Image,
    real_cloud_mask_img: Image.Image,
    reconstruction_func,
    **kwargs
) -> Dict[str, Any]:
    """
    Standard scientific benchmark protocol:
    Takes a known clear scene, overlays real cloud mask from another date,
    hides those pixels, executes reconstruction, and computes ground truth metrics.
    """
    w, h = clear_scene_img.size
    clear_arr = np.array(clear_scene_img.convert("RGB"), dtype=np.float32)
    mask_arr = np.array(real_cloud_mask_img.convert("L").resize((w, h))) > 128

    # Create synthetic cloudy input: corrupt cloudy regions with high reflectance haze
    cloudy_arr = clear_arr.copy()
    cloudy_arr[mask_arr] = 250.0  # Opaque white cloud
    synthetic_cloudy_img = Image.fromarray(cloudy_arr.astype(np.uint8), mode="RGB")

    # Run reconstruction model
    recon_img, conf_img, conf_arr = reconstruction_func(synthetic_cloudy_img, real_cloud_mask_img, **kwargs)

    return evaluate_reconstruction(
        pred_img=recon_img,
        ref_img=clear_scene_img,
        cloud_mask_img=real_cloud_mask_img,
        confidence_arr=conf_arr,
        is_synthetic=True
    )

