import os
import sys
import json
import shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app.config import PUBLIC_IMAGES_DIR, STORAGE_DIR
from backend.app.pipeline.baselines.model_d import run_model_d_quality_aware
from backend.app.pipeline.subcloud_labeling import classify_subcloud_features
from backend.app.pipeline.vegetation_health import analyze_vegetation_health

def generate_50_scenes_gallery():
    out_dir = PUBLIC_IMAGES_DIR.parent / "benchmarks" / "scenes_50"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    brain_dir = Path(r"C:\Users\aniru\.gemini\antigravity\brain\cf2ab981-b83a-4019-bdf3-8a546d674856")
    brain_dir.mkdir(parents=True, exist_ok=True)

    clear_path = PUBLIC_IMAGES_DIR / "satellite-clear-reference-demo.jpg"
    mask_path = PUBLIC_IMAGES_DIR / "cloud-shadow-mask-demo.png"
    temporal_path = PUBLIC_IMAGES_DIR / "satellite-temporal-demo.jpg"
    sar_path = PUBLIC_IMAGES_DIR / "satellite-sar-demo.jpg"
    fcc_path = PUBLIC_IMAGES_DIR / "satellite-fcc-demo.jpg"

    im_clear_full = Image.open(clear_path).convert("RGB")
    im_mask_full = Image.open(mask_path).convert("L")
    im_temp_full = Image.open(temporal_path).convert("RGB")
    im_sar_full = Image.open(sar_path).convert("RGB")
    im_fcc_full = Image.open(fcc_path).convert("RGB") if fcc_path.exists() else None

    w_full, h_full = im_clear_full.size
    tile_w, tile_h = 256, 256
    x_max = max(0, w_full - tile_w)
    y_max = max(0, h_full - tile_h)

    # Deterministic grid of 50 scenes
    np.random.seed(42)
    grid_cols = 10
    grid_rows = 5
    xs = np.linspace(0, x_max, grid_cols, dtype=int)
    ys = np.linspace(0, y_max, grid_rows, dtype=int)

    scenes_manifest = []

    # Prepare montage canvas: 10 columns x 5 rows of 4-tile strips or sample overview
    montage_w = 10 * 128
    montage_h = 5 * 128
    montage_cloudy = Image.new("RGB", (montage_w, montage_h), (15, 23, 42))
    montage_recon = Image.new("RGB", (montage_w, montage_h), (15, 23, 42))
    montage_subcloud = Image.new("RGB", (montage_w, montage_h), (15, 23, 42))
    montage_ndvi = Image.new("RGB", (montage_w, montage_h), (15, 23, 42))

    idx = 0
    for r_idx, y in enumerate(ys):
        for c_idx, x in enumerate(xs):
            idx += 1
            if idx > 50:
                break
            
            jitter_x = int(np.random.randint(-12, 13))
            jitter_y = int(np.random.randint(-8, 9))
            qx = int(np.clip(x + jitter_x, 0, x_max))
            qy = int(np.clip(y + jitter_y, 0, y_max))
            
            box = (qx, qy, qx + tile_w, qy + tile_h)
            crop_clear = im_clear_full.crop(box)
            crop_mask = im_mask_full.crop(box)
            crop_temp = im_temp_full.crop(box)
            crop_sar = im_sar_full.crop(box)
            crop_fcc = im_fcc_full.crop(box) if im_fcc_full else None

            arr_clear = np.array(crop_clear, dtype=np.float32)
            arr_mask = np.array(crop_mask) > 120
            cloud_pct = round((float(np.sum(arr_mask)) / (tile_w * tile_h)) * 100.0, 1)

            arr_cloudy = arr_clear.copy()
            arr_cloudy[arr_mask] = 245.0
            crop_cloudy = Image.fromarray(arr_cloudy.astype(np.uint8))

            # Run Model D
            crop_recon, _, _ = run_model_d_quality_aware(crop_cloudy, crop_mask, crop_sar, crop_temp, crop_clear)

            # Run Sub-Cloud Labelling & Vegetation Health
            labels_res = classify_subcloud_features(crop_recon, crop_mask, sar_img=crop_sar, fcc_img=crop_fcc)
            veg_res = analyze_vegetation_health(crop_recon, crop_mask, fcc_img=crop_fcc)

            subcloud_im = labels_res["under_cloud_thematic_img"]
            ndvi_im = veg_res["continuous_ndvi_img"]

            # Save individual images for this scene
            prefix = f"scene_{idx:02d}"
            cloudy_file = f"{prefix}_cloudy.jpg"
            recon_file = f"{prefix}_recon.jpg"
            subcloud_file = f"{prefix}_subcloud.png"
            ndvi_file = f"{prefix}_ndvi.png"

            crop_cloudy.save(out_dir / cloudy_file, quality=90)
            crop_recon.save(out_dir / recon_file, quality=90)
            subcloud_im.save(out_dir / subcloud_file)
            ndvi_im.save(out_dir / ndvi_file)

            # Paste into montages (resized to 128x128)
            px = c_idx * 128
            py = r_idx * 128
            montage_cloudy.paste(crop_cloudy.resize((128, 128)), (px, py))
            montage_recon.paste(crop_recon.resize((128, 128)), (px, py))
            montage_subcloud.paste(subcloud_im.resize((128, 128)), (px, py))
            montage_ndvi.paste(ndvi_im.resize((128, 128)), (px, py))

            dom_feature = labels_res["summary"]["dominant_subcloud_feature"]
            mean_ndvi = veg_res["summary"]["mean_ndvi_beneath_cloud"]

            scenes_manifest.append({
                "id": idx,
                "name": f"Scene #{idx:02d}",
                "coords": {"x": qx, "y": qy},
                "cloud_coverage_pct": cloud_pct,
                "dominant_subcloud_feature": dom_feature,
                "mean_subcloud_ndvi": mean_ndvi,
                "recovered_veg_km2": veg_res["summary"]["recovered_vegetated_area_km2"],
                "cloudy_url": f"/images/benchmarks/scenes_50/{cloudy_file}",
                "recon_url": f"/images/benchmarks/scenes_50/{recon_file}",
                "subcloud_url": f"/images/benchmarks/scenes_50/{subcloud_file}",
                "ndvi_url": f"/images/benchmarks/scenes_50/{ndvi_file}"
            })

    # Save montages
    montage_cloudy.save(out_dir / "montage_50_cloudy.jpg", quality=88)
    montage_recon.save(out_dir / "montage_50_recon.jpg", quality=88)
    montage_subcloud.save(out_dir / "montage_50_subcloud.jpg", quality=88)
    montage_ndvi.save(out_dir / "montage_50_ndvi.jpg", quality=88)

    # Create side-by-side comparative contact sheet
    contact_sheet = Image.new("RGB", (montage_w * 2, montage_h * 2), (15, 23, 42))
    contact_sheet.paste(montage_cloudy, (0, 0))
    contact_sheet.paste(montage_recon, (montage_w, 0))
    contact_sheet.paste(montage_subcloud, (0, montage_h))
    contact_sheet.paste(montage_ndvi, (montage_w, montage_h))
    contact_sheet_path = out_dir / "scenes_50_master_contact_sheet.jpg"
    contact_sheet.save(contact_sheet_path, quality=85)

    # Save manifest JSON
    manifest_path = out_dir / "manifest_50.json"
    with open(manifest_path, "w") as f:
        json.dump(scenes_manifest, f, indent=2)

    # Copy master contact sheet and representative samples to brain dir for markdown viewing
    shutil.copy(contact_sheet_path, brain_dir / "scenes_50_master_contact_sheet.jpg")
    for s_id in [1, 5, 10, 25, 50]:
        prefix = f"scene_{s_id:02d}"
        shutil.copy(out_dir / f"{prefix}_cloudy.jpg", brain_dir / f"{prefix}_cloudy.jpg")
        shutil.copy(out_dir / f"{prefix}_recon.jpg", brain_dir / f"{prefix}_recon.jpg")
        shutil.copy(out_dir / f"{prefix}_subcloud.png", brain_dir / f"{prefix}_subcloud.png")
        shutil.copy(out_dir / f"{prefix}_ndvi.png", brain_dir / f"{prefix}_ndvi.png")

    print(f"Generated all 50 scene images, montages, and manifest successfully in {out_dir}")

if __name__ == "__main__":
    generate_50_scenes_gallery()

