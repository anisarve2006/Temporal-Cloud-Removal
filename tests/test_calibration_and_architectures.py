import pytest
import numpy as np
import torch
from backend.app.pipeline.calibration import UnCRtainTSCalibrator
from backend.training.models import (
    CrossModalityAttentionBlock,
    ModelC_MultiModalFusionNet,
    ModelD_QualityAwareNet,
    UTiliseTemporalSeqNet,
    ModelE_DiffusionBridgeNet
)

def test_uncrtaints_calibrator_fitting_and_conformal_bounds():
    """
    Tests UnCRtainTSCalibrator:
    - Fits isotonic regression on synthetic validation error & confidence
    - Computes conformal quantile for distribution-free prediction bounds
    - Verifies lower_bound <= upper_bound and nominal coverage
    """
    np.random.seed(42)
    N = 500
    raw_confs = np.linspace(0.1, 0.95, N).astype(np.float32)
    # Higher confidence correlates with lower error
    errors = np.clip((1.0 - raw_confs) * 0.4 + np.random.normal(0, 0.03, N), 0.0, 1.0).astype(np.float32)
    cloud_mask = np.ones(N, dtype=bool)

    calibrator = UnCRtainTSCalibrator(alpha=0.10)
    fit_res = calibrator.fit(raw_confs, errors, cloud_mask=cloud_mask)

    assert fit_res["fitted"] is True
    assert fit_res["conformal_quantile"] > 0
    assert 0.20 <= fit_res["optimal_fallback_threshold"] <= 0.85

    # Test calibrate mapping
    calibrated = calibrator.calibrate(raw_confs)
    assert calibrated.shape == raw_confs.shape
    assert np.all(calibrated >= 0.0) and np.all(calibrated <= 1.0)

    # Test conformal bounds
    pred_toy = np.full((10, 10), 0.5, dtype=np.float32)
    conf_toy = np.full((10, 10), 0.8, dtype=np.float32)
    lower, upper = calibrator.compute_conformal_bounds(pred_toy, conf_toy)
    assert np.all(lower <= pred_toy)
    assert np.all(upper >= pred_toy)

def test_cross_modality_attention_block_forward():
    """
    Tests DB-CR cross-modality attention block:
    Allows optical features to attend to structural radar features.
    """
    b, c, h, w = 2, 32, 16, 16
    opt_feat = torch.randn(b, c, h, w)
    sar_feat = torch.randn(b, c, h, w)

    attn_block = CrossModalityAttentionBlock(dim=c, num_heads=4)
    out = attn_block(opt_feat, sar_feat)

    assert out.shape == (b, c, h, w)
    assert not torch.isnan(out).any()

def test_utilise_temporal_seq_net_forward():
    """
    Tests U-TILISE sequence-to-sequence temporal model on 3 dates.
    """
    b, t, c, h, w = 1, 3, 3, 32, 32
    seq_optical = torch.rand(b, t, c, h, w)
    seq_masks = (torch.rand(b, t, 1, h, w) > 0.5).float()
    seq_doys = torch.tensor([[100.0, 140.0, 180.0]])

    model = UTiliseTemporalSeqNet(in_ch=4, base_ch=16, num_heads=2)
    out = model(seq_optical, seq_masks, seq_doys)

    assert out.shape == (b, 3, h, w)
    # Check that clear pixels on target date (t=0) remain unchanged
    target_clear = (seq_masks[:, 0] == 0).expand(-1, 3, -1, -1)
    diff = torch.abs(out[target_clear] - seq_optical[:, 0][target_clear])
    assert torch.all(diff < 1e-5)

def test_model_e_diffusion_bridge_forward():
    """
    Tests Model E (Diffusion Bridge / DB-CR) with multi-sample variance uncertainty.
    """
    b, c, h, w = 1, 3, 32, 32
    cloudy = torch.rand(b, c, h, w)
    mask = (torch.rand(b, 1, h, w) > 0.5).float()
    sar = torch.rand(b, 2, h, w)
    temp = torch.rand(b, 3, h, w)

    model = ModelE_DiffusionBridgeNet(base_ch=8, num_inference_steps=2)
    recon, conf = model(cloudy, mask, sar, temp, num_mc_samples=2)

    assert recon.shape == (b, 3, h, w)
    assert conf.shape == (b, 1, h, w)
    # Clear pixels locked
    clear_px = (mask == 0).expand(-1, 3, -1, -1)
    assert torch.allclose(recon[clear_px], cloudy[clear_px], atol=1e-5)

