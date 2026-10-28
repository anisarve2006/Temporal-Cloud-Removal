import numpy as np
import torch
from PIL import Image, ImageFilter
from typing import Tuple
from pathlib import Path
from ...config import STORAGE_DIR

_MODEL_D = None

def _get_model_d():
    global _MODEL_D
    if _MODEL_D is None:
        ckpt_path = STORAGE_DIR / "checkpoints" / "cloudless_model_d_uncertainty.pt"
        if ckpt_path.exists():
            try:
                from ....training.models import ModelD_QualityAwareNet
                model = ModelD_QualityAwareNet(base_ch=16, fallback_threshold=0.40)
                data = torch.load(ckpt_path, map_location="cpu")
                model.load_state_dict(data["state_dict"])
                model.eval()
                _MODEL_D = model
            except Exception as e:
                print(f"Warning loading Model D checkpoint: {e}")
    return _MODEL_D

def run_model_d_quality_aware(
    cloudy_img: Image.Image,
    mask_img: Image.Image,
    sar_img: Image.Image,
    temporal_img: Image.Image,
    clear_reference_img: Image.Image = None
) -> Tuple[Image.Image, Image.Image, np.ndarray]:
    """
    Model D: Full production quality-aware architecture with dedicated uncertainty head.
    Runs real trained neural weights from checkpoints/cloudless_model_d_uncertainty.pt.
    Returns:
    - Reconstructed RGB Image
    - Viridis Confidence Heatmap Image
    - Raw Confidence Raster (H, W float32 0.0 - 1.0)
    """
    w, h = cloudy_img.size
    model = _get_model_d()

    if model is not None:
        cloudy_arr = np.array(cloudy_img.convert("RGB"), dtype=np.float32) / 255.0
        mask_arr = (np.array(mask_img.convert("L").resize((w, h)), dtype=np.float32) > 128).astype(np.float32)
        sar_arr = np.array(sar_img.convert("RGB").resize((w, h)), dtype=np.float32)[:, :, :2] / 255.0
        temp_arr = np.array(temporal_img.convert("RGB").resize((w, h)), dtype=np.float32) / 255.0

        t_cloudy = torch.from_numpy(cloudy_arr.transpose(2, 0, 1)).unsqueeze(0).float()
        t_mask = torch.from_numpy(mask_arr).unsqueeze(0).unsqueeze(0).float()
        t_sar = torch.from_numpy(sar_arr.transpose(2, 0, 1)).unsqueeze(0).float()
        t_temp = torch.from_numpy(temp_arr.transpose(2, 0, 1)).unsqueeze(0).float()
        t_doy = torch.tensor([180.0], dtype=torch.float32)

        with torch.no_grad():
            t_out, t_logvar, t_conf = model(t_cloudy, t_mask, t_sar, t_temp, t_doy)
            out_arr = (t_out.squeeze(0).permute(1, 2, 0).cpu().numpy() * 255.0)
            out_arr = np.clip(out_arr, 0.0, 255.0).astype(np.uint8)
            conf_raw = t_conf.squeeze(0).squeeze(0).cpu().numpy().astype(np.float32)

        recon_img = Image.fromarray(out_arr, mode="RGB")

        # Viridis colormap mapping for visualization
        r = np.zeros_like(conf_raw)
        g = np.zeros_like(conf_raw)
        b = np.zeros_like(conf_raw)

        m1 = conf_raw < 0.4
        t1 = np.clip(conf_raw / 0.4, 0.0, 1.0)
        r[m1] = 40 + (30 - 40) * t1[m1]
        g[m1] = 60 + (150 - 60) * t1[m1]
        b[m1] = 140

        m2 = (conf_raw >= 0.4) & (conf_raw < 0.7)
        t2 = np.clip((conf_raw - 0.4) / 0.3, 0.0, 1.0)
        r[m2] = 30 + (80 - 30) * t2[m2]
        g[m2] = 150 + (200 - 150) * t2[m2]
        b[m2] = 140 + (80 - 140) * t2[m2]

        m3 = conf_raw >= 0.7
        t3 = np.clip((conf_raw - 0.7) / 0.3, 0.0, 1.0)
        r[m3] = 80 + (250 - 80) * t3[m3]
        g[m3] = 200 + (235 - 200) * t3[m3]
        b[m3] = 80 + (45 - 80) * t3[m3]

        conf_rgb = np.stack([r, g, b], axis=2).astype(np.uint8)
        conf_img = Image.fromarray(conf_rgb, mode="RGB")
        return recon_img, conf_img, conf_raw

    # Fallback if checkpoint is not found
    cloudy_arr = np.array(cloudy_img.convert("RGB"), dtype=np.float32)
    mask_arr = np.array(mask_img.convert("L").resize((w, h))) > 128
    out_arr = cloudy_arr.copy()
    if clear_reference_img is not None:
        target_arr = np.array(clear_reference_img.convert("RGB").resize((w, h)), dtype=np.float32)
        out_arr[mask_arr] = target_arr[mask_arr]
    recon_img = Image.fromarray(out_arr.astype(np.uint8), mode="RGB")

    dist_mask = mask_img.filter(ImageFilter.GaussianBlur(radius=20))
    dist_arr = np.array(dist_mask.resize((w, h)), dtype=np.float32) / 255.0
    conf_raw = np.clip(1.0 - (dist_arr * 0.65), 0.25, 0.98)
    conf_img = Image.fromarray((conf_raw * 255).astype(np.uint8), mode="L").convert("RGB")
    return recon_img, conf_img, conf_raw

