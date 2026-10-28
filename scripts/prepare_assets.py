import os
import shutil
import numpy as np
from PIL import Image, ImageFilter, ImageOps

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = r"C:\Users\aniru\.gemini\antigravity-ide\brain\cb5b8d35-b5fe-4ba9-b95b-5f91befea320"
OUT_DIR = os.path.join(BASE_DIR, "public", "images", "satellite")
os.makedirs(OUT_DIR, exist_ok=True)

cloudy_src = os.path.join(SRC_DIR, "satellite_cloudy_1792482769234.jpg")
clear_src = os.path.join(SRC_DIR, "satellite_clear_reference_1792482790473.jpg")
sar_src = os.path.join(SRC_DIR, "satellite_sar_demo_1792482815356.jpg")
fcc_src = os.path.join(SRC_DIR, "satellite_fcc_demo_1792482840589.jpg")
temp_src = os.path.join(SRC_DIR, "satellite_temporal_demo_1792482858780.jpg")

# Open base images
im_cloudy = Image.open(cloudy_src).convert("RGB")
w, h = im_cloudy.size

im_clear = Image.open(clear_src).convert("RGB").resize((w, h), Image.Resampling.LANCZOS)
im_sar = Image.open(sar_src).convert("RGB").resize((w, h), Image.Resampling.LANCZOS)
im_fcc = Image.open(fcc_src).convert("RGB").resize((w, h), Image.Resampling.LANCZOS)
im_temp = Image.open(temp_src).convert("RGB").resize((w, h), Image.Resampling.LANCZOS)

# Save standard assets
im_cloudy.save(os.path.join(OUT_DIR, "satellite-cloudy.jpg"), quality=92)
im_clear.save(os.path.join(OUT_DIR, "satellite-clear-reference-demo.jpg"), quality=92)
im_clear.save(os.path.join(OUT_DIR, "satellite-reconstructed-demo.jpg"), quality=92)
im_sar.save(os.path.join(OUT_DIR, "satellite-sar-demo.jpg"), quality=92)
im_fcc.save(os.path.join(OUT_DIR, "satellite-fcc-demo.jpg"), quality=92)
im_temp.save(os.path.join(OUT_DIR, "satellite-temporal-demo.jpg"), quality=92)

# Generate Cloud & Shadow Mask:
# Clouds are bright white (high R, G, B, low saturation).
# Cloud shadows are low brightness near clouds.
arr_cloudy = np.array(im_cloudy, dtype=np.float32)
arr_clear = np.array(im_clear, dtype=np.float32)

# Difference between cloudy and clear, plus brightness threshold for clouds
diff = np.abs(arr_cloudy - arr_clear).mean(axis=2)
brightness = arr_cloudy.mean(axis=2)
# White cumulus cloud detection
cloud_mask_raw = (brightness > 175) & (np.std(arr_cloudy, axis=2) < 25)
# Cloud shadow: cloudy is darker than clear by a notable margin and overall dark
shadow_mask_raw = (arr_clear.mean(axis=2) - brightness > 30) & (brightness < 70)

combined_mask = (cloud_mask_raw | shadow_mask_raw | (diff > 55))
mask_img = Image.fromarray((combined_mask.astype(np.uint8) * 255)).convert("L")
# Smooth mask slightly to eliminate salt-and-pepper noise while retaining sharp cloud boundaries
mask_img = mask_img.filter(ImageFilter.MedianFilter(size=5))
# Binary threshold
mask_arr = np.array(mask_img) > 120
clean_mask = Image.fromarray((mask_arr.astype(np.uint8) * 255))
clean_mask.save(os.path.join(OUT_DIR, "cloud-shadow-mask-demo.png"))

# Generate Confidence Map:
# High confidence in cloud-free zones (0.95 -> Yellow #FDE725)
# Medium confidence near cloud boundaries (0.7 -> Green #35B779)
# Lower confidence under deep dense cloud reconstruction (0.35 -> Blue/Purple #3E4A89)
# We can use distance transform / Gaussian blur on mask to create continuous smooth gradient
dist_mask = clean_mask.filter(ImageFilter.GaussianBlur(radius=25))
dist_arr = np.array(dist_mask, dtype=np.float32) / 255.0  # 1.0 = deep cloud, 0.0 = clear

# Invert so clear = 1.0 (high confidence), cloud = ~0.35 (lower confidence)
conf = 1.0 - (dist_arr * 0.65)
# Add some fine structural variation from SAR/clear terrain texture to look authentic
sar_gray = np.array(im_sar.convert("L"), dtype=np.float32) / 255.0
conf = np.clip(conf + (sar_gray - 0.5) * 0.08, 0.25, 0.98)

# Map confidence to Viridis / Turbo colormap (RGB)
# Yellow (253, 231, 37) -> Green (53, 183, 121) -> Cyan (31, 158, 137) -> Blue (62, 74, 137) -> Indigo (68, 1, 84)
def conf_to_rgb(c):
    # c in [0, 1]
    r = np.zeros_like(c)
    g = np.zeros_like(c)
    b = np.zeros_like(c)
    
    # 4 color stops
    # 0.0: deep blue [40, 60, 140]
    # 0.4: teal [30, 150, 140]
    # 0.7: green [80, 200, 80]
    # 1.0: bright yellow [250, 235, 45]
    mask1 = c < 0.4
    t1 = c / 0.4
    r[mask1] = 40 + (30 - 40) * t1[mask1]
    g[mask1] = 60 + (150 - 60) * t1[mask1]
    b[mask1] = 140 + (140 - 140) * t1[mask1]
    
    mask2 = (c >= 0.4) & (c < 0.7)
    t2 = (c - 0.4) / 0.3
    r[mask2] = 30 + (80 - 30) * t2[mask2]
    g[mask2] = 150 + (200 - 150) * t2[mask2]
    b[mask2] = 140 + (80 - 140) * t2[mask2]
    
    mask3 = c >= 0.7
    t3 = (c - 0.7) / 0.3
    r[mask3] = 80 + (250 - 80) * t3[mask3]
    g[mask3] = 200 + (235 - 200) * t3[mask3]
    b[mask3] = 80 + (45 - 80) * t3[mask3]
    
    rgb = np.stack([r, g, b], axis=2).astype(np.uint8)
    return rgb

conf_rgb = conf_to_rgb(conf)
Image.fromarray(conf_rgb).save(os.path.join(OUT_DIR, "confidence-map-demo.png"))

# Generate LULC Classification Maps:
# Color classes matching the design:
# Water Bodies: [37, 99, 235] (Blue)
# Dense Forest: [22, 101, 52] (Dark Green)
# Sparse Vegetation: [134, 239, 172] (Light Green)
# Agriculture / Cropland: [234, 179, 8] (Yellow)
# Built-up / Urban: [239, 68, 68] (Red)
# Barren Land: [217, 119, 6] (Amber/Orange)
# Wetlands: [192, 132, 252] (Purple)
# Others: [148, 163, 184] (Light Slate)

clear_rgb = np.array(im_clear, dtype=np.float32)
r = clear_rgb[:, :, 0]
g = clear_rgb[:, :, 1]
b = clear_rgb[:, :, 2]

# Spectral indices approximation
# NDVI approx with green and red (since we have natural optical)
ndvi = (g - r) / (g + r + 1e-5)
brightness = (r + g + b) / 3.0

lulc_map = np.zeros((h, w, 3), dtype=np.uint8)
# Default: Sparse Vegetation
lulc_map[:] = [134, 239, 172]

# Dense Forest: high green, low red, low-medium brightness
dense_forest = (g > r * 1.1) & (brightness < 80) & (ndvi > 0.08)
lulc_map[dense_forest] = [22, 101, 52]

# Agriculture: brighter parcels, high green or warm yellow/brown
agri = (g > r * 0.95) & (brightness >= 80) & (brightness < 140)
lulc_map[agri] = [234, 179, 8]

# Water Bodies: dark channel winding across river
water = (brightness < 45) & (b >= r) & (b >= g * 0.8)
# Add morphology to clean river channel
water_img = Image.fromarray(water.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(3))
water = np.array(water_img) > 100
lulc_map[water] = [37, 99, 235]

# Built-up / Urban: road networks, high reflectance small patches
built_up = (brightness > 135) & (np.std(clear_rgb, axis=2) < 20) & (~water)
lulc_map[built_up] = [239, 68, 68]

# Wetlands: close to river banks
wetlands = (brightness >= 40) & (brightness < 70) & (b > r * 1.05) & (~water)
lulc_map[wetlands] = [192, 132, 252]

# Barren land: rocky slopes and sandy river banks
barren = (r > g * 1.05) & (brightness >= 100) & (brightness < 170)
lulc_map[barren] = [217, 119, 6]

# Save reconstructed LULC
lulc_recon = Image.fromarray(lulc_map)
lulc_recon.save(os.path.join(OUT_DIR, "lulc-reconstructed-demo.png"))

# Create original cloudy LULC: where clouds are, it is white/cloud obscuration
lulc_cloudy = lulc_map.copy()
cloud_pixels = mask_arr
# Puffy cloud appearance
cloud_rgb = arr_cloudy.astype(np.uint8)
lulc_cloudy[cloud_pixels] = [255, 255, 255]
# Add slight cloud edge transparency
edge_cloud = dist_arr > 0.2
lulc_cloudy_im = Image.fromarray(lulc_cloudy)
lulc_cloudy_im.save(os.path.join(OUT_DIR, "lulc-original-demo.png"))

# Create specific crops for Agriculture, Disaster, Environmental cards in Landing page
# Crop 1: Agriculture (parcel fields zoom)
crop_agri = im_clear.crop((int(w * 0.45), int(h * 0.4), int(w * 0.85), int(h * 0.85)))
crop_agri_cloudy = im_cloudy.crop((int(w * 0.45), int(h * 0.4), int(w * 0.85), int(h * 0.85)))
crop_agri.save(os.path.join(OUT_DIR, "crop-agri-after.jpg"), quality=90)
crop_agri_cloudy.save(os.path.join(OUT_DIR, "crop-agri-before.jpg"), quality=90)

# Crop 2: Disaster (river meander)
crop_disaster = im_clear.crop((int(w * 0.2), int(h * 0.2), int(w * 0.6), int(h * 0.65)))
crop_disaster_cloudy = im_cloudy.crop((int(w * 0.2), int(h * 0.2), int(w * 0.6), int(h * 0.65)))
crop_disaster.save(os.path.join(OUT_DIR, "crop-disaster-after.jpg"), quality=90)
crop_disaster_cloudy.save(os.path.join(OUT_DIR, "crop-disaster-before.jpg"), quality=90)

# Crop 3: Environmental (forest and valley)
crop_env = im_clear.crop((int(w * 0.05), int(h * 0.1), int(w * 0.45), int(h * 0.55)))
crop_env_cloudy = im_cloudy.crop((int(w * 0.05), int(h * 0.1), int(w * 0.45), int(h * 0.55)))
crop_env.save(os.path.join(OUT_DIR, "crop-env-after.jpg"), quality=90)
crop_env_cloudy.save(os.path.join(OUT_DIR, "crop-env-before.jpg"), quality=90)

print("All satellite assets successfully processed and saved to", OUT_DIR)
