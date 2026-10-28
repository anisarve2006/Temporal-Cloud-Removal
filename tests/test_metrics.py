import pytest
import numpy as np
from backend.app.pipeline.evaluator import (
    compute_psnr,
    compute_sam,
    compute_ndvi_mae,
    compute_masked_ssim,
    compute_uncertainty_calibration
)

def test_psnr_hand_computed():
    """
    Hand-calculated PSNR test:
    Ref: 2x2 constant 0.5.
    Pred: 2x2 with single pixel shifted by 0.1 (error = 0.1 at 1 pixel, 0 at 3 pixels).
    MSE = (0.1^2 + 0 + 0 + 0) / 4 = 0.0025
    RMSE = sqrt(0.0025) = 0.05
    PSNR = 20 * log10(1.0 / 0.05) = 20 * log10(20) = 26.0206 dB
    """
    # Create 120 pixels to satisfy MIN_PIXEL_THRESHOLD
    ref = np.full((12, 10), 0.5, dtype=np.float32)
    pred = np.full((12, 10), 0.5, dtype=np.float32)
    # Set 30 pixels with diff 0.1 out of 120 (ratio 1/4)
    pred[:3, :] += 0.1

    # MSE = 30 * (0.01) / 120 = 0.0025
    psnr = compute_psnr(ref, pred, data_range=1.0)
    assert psnr is not None
    assert np.isclose(psnr, 26.02, atol=0.05)

def test_sam_hand_computed():
    """
    Hand-calculated SAM test:
    - Identical vectors: dot / denom = 1.0 -> 0.0 degrees
    - Orthogonal vectors: dot / denom = 0.0 -> 90.0 degrees
    """
    # Create 120 pixels of identical vectors [0.5, 0.5, 0.5]
    ref_identical = np.full((12, 10, 3), 0.5, dtype=np.float32)
    pred_identical = np.full((12, 10, 3), 0.5, dtype=np.float32)

    sam_zero = compute_sam(ref_identical, pred_identical)
    assert sam_zero is not None
    assert np.isclose(sam_zero, 0.0, atol=0.05)

    # Orthogonal vectors: [1.0, 0.0, 0.0] vs [0.0, 1.0, 0.0]
    ref_ortho = np.zeros((12, 10, 3), dtype=np.float32)
    ref_ortho[:, :, 0] = 1.0
    pred_ortho = np.zeros((12, 10, 3), dtype=np.float32)
    pred_ortho[:, :, 1] = 1.0

    sam_90 = compute_sam(ref_ortho, pred_ortho)
    assert sam_90 is not None
    assert np.isclose(sam_90, 90.0, atol=0.05)

def test_sam_nan_prevention_on_numerical_extremes():
    """
    Checks that cos_angle values near 1.0000001 or -1.0000001 do not produce NaNs.
    """
    ref = np.ones((12, 10, 3), dtype=np.float32)
    pred = np.ones((12, 10, 3), dtype=np.float32) * 1.00001
    sam_val = compute_sam(ref, pred)
    assert not np.isnan(sam_val)

def test_ndvi_zero_division_guard():
    """
    Tests NDVI division-by-zero protection when (NIR + Red) is 0.
    """
    ref = np.zeros((15, 10, 3), dtype=np.float32)
    pred = np.zeros((15, 10, 3), dtype=np.float32)

    # 110 pixels (11 rows * 10 cols) to exceed MIN_PIXEL_THRESHOLD
    ref[4:, :, 1] = 0.4  # Red
    ref[4:, :, 2] = 0.8  # NIR
    pred[4:, :, 1] = 0.4
    pred[4:, :, 2] = 0.8

    # First 4 rows have NIR + Red = 0
    ndvi_mae = compute_ndvi_mae(ref, pred)
    assert ndvi_mae is not None
    assert not np.isnan(ndvi_mae)
    assert np.isclose(ndvi_mae, 0.0, atol=1e-3)

def test_uncertainty_calibration_ece():
    """
    Tests ECE calculation: perfect calibration where confidence matches (1 - error).
    """
    confs = np.linspace(0.1, 0.9, 200).astype(np.float32)
    errors = (1.0 - confs) * 0.5  # perfectly correlated

    calib = compute_uncertainty_calibration(errors, confs, num_bins=5)
    assert calib["expected_calibration_error"] is not None
    assert calib["expected_calibration_error"] < 0.25
    assert len(calib["calibration_bins"]) == 5
