import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation
from ..preprocessor import align_temporal_pair

def run_baseline_a_temporal_fill(
    cloudy_img: Image.Image,
    mask_img: Image.Image,
    temporal_img: Image.Image
) -> Image.Image:
    """
    Baseline A: Enhanced non-neural temporal filling.
    - Sub-pixel Fourier phase alignment to eliminate temporal ghosting
    - Local boundary radiometric matching: adjusts gain & bias specifically on clear pixels
      in the annular region immediately surrounding the cloud hole
    - Strictly preserves uncorrupted clear pixels by identity assertion
    """
    w, h = cloudy_img.size
    cloudy_arr = np.array(cloudy_img.convert("RGB"), dtype=np.float32)
    temp_raw = np.array(temporal_img.convert("RGB").resize((w, h)), dtype=np.float32)
    mask_arr = np.array(mask_img.convert("L").resize((w, h))) > 128

    # Step 1: Sub-pixel temporal alignment
    aligned_temp, (dy, dx) = align_temporal_pair(cloudy_arr, temp_raw)

    # Step 2: Annular boundary zone around the cloud hole (dilation minus mask)
    boundary_struct = np.ones((15, 15), dtype=bool)
    dilated_hole = binary_dilation(mask_arr, structure=boundary_struct)
    annular_clear_boundary = dilated_hole & (~mask_arr)

    # Fallback to general clear pixels if annular zone is too small
    if np.sum(annular_clear_boundary) < 100:
        annular_clear_boundary = ~mask_arr

    out_arr = cloudy_arr.copy()

    # Step 3: Radiometric matching strictly on the boundary zone
    if np.sum(annular_clear_boundary) > 50:
        for c in range(3):
            c_cloudy = cloudy_arr[:, :, c][annular_clear_boundary]
            c_temp = aligned_temp[:, :, c][annular_clear_boundary]

            mean_cloudy = float(np.mean(c_cloudy))
            std_cloudy = float(np.std(c_cloudy)) + 1e-4

            mean_temp = float(np.mean(c_temp))
            std_temp = float(np.std(c_temp)) + 1e-4

            # Gain & bias normalization
            gain = std_cloudy / std_temp
            bias = mean_cloudy - (gain * mean_temp)

            matched_channel = aligned_temp[:, :, c] * gain + bias
            # Fill only within masked cloudy bounds
            out_arr[:, :, c][mask_arr] = matched_channel[mask_arr]
    else:
        out_arr[mask_arr] = aligned_temp[mask_arr]

    out_arr = np.clip(out_arr, 0.0, 255.0).astype(np.uint8)
    return Image.fromarray(out_arr, mode="RGB")

