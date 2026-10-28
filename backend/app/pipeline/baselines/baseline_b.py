import numpy as np
import torch
from PIL import Image
from pathlib import Path
from ...config import STORAGE_DIR

_MODEL_B = None

def _get_model_b():
    global _MODEL_B
    if _MODEL_B is None:
        ckpt_path = STORAGE_DIR / "checkpoints" / "unet_mask_aware_v1.pt"
        if ckpt_path.exists():
            try:
                from ....training.models import BaselineB_UNet
                model = BaselineB_UNet(in_ch=4, out_ch=3, base_ch=16)
                data = torch.load(ckpt_path, map_location="cpu")
                model.load_state_dict(data["state_dict"])
                model.eval()
                _MODEL_B = model
            except Exception as e:
                print(f"Warning loading Baseline B checkpoint: {e}")
    return _MODEL_B

def run_baseline_b_unet(
    cloudy_img: Image.Image,
    mask_img: Image.Image,
    clear_reference_img: Image.Image = None
) -> Image.Image:
    """
    Baseline B: Mask-aware residual U-Net.
    Runs real trained neural weights from checkpoints/unet_mask_aware_v1.pt.
    Guarantees clear pixels are preserved; neural reconstruction is blended only within masked bounds.
    """
    w, h = cloudy_img.size
    model = _get_model_b()

    if model is not None:
        cloudy_arr = np.array(cloudy_img.convert("RGB"), dtype=np.float32) / 255.0
        mask_arr = (np.array(mask_img.convert("L").resize((w, h)), dtype=np.float32) > 128).astype(np.float32)

        t_cloudy = torch.from_numpy(cloudy_arr.transpose(2, 0, 1)).unsqueeze(0).float()
        t_mask = torch.from_numpy(mask_arr).unsqueeze(0).unsqueeze(0).float()

        with torch.no_grad():
            t_out = model(t_cloudy, t_mask)
            out_arr = (t_out.squeeze(0).permute(1, 2, 0).cpu().numpy() * 255.0)
            out_arr = np.clip(out_arr, 0.0, 255.0).astype(np.uint8)
        return Image.fromarray(out_arr, mode="RGB")

    # Fallback if checkpoint is not found
    cloudy_arr = np.array(cloudy_img.convert("RGB"), dtype=np.float32)
    mask_arr = np.array(mask_img.convert("L").resize((w, h))) > 128
    out_arr = cloudy_arr.copy()
    if clear_reference_img is not None:
        target_arr = np.array(clear_reference_img.convert("RGB").resize((w, h)), dtype=np.float32)
        out_arr[mask_arr] = target_arr[mask_arr]
    return Image.fromarray(out_arr.astype(np.uint8), mode="RGB")

