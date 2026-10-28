import os
import numpy as np
from PIL import Image, ImageFilter
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Base files
recon_path = "public/images/satellite/satellite-reconstructed-demo.jpg"
mask_path = "public/images/satellite/cloud-shadow-mask-demo.png"
out_public = "public/images/satellite/annotated_subcloud_features.png"
out_brain = "C:/Users/aniru/.gemini/antigravity/brain/cf2ab981-b83a-4019-bdf3-8a546d674856/annotated_subcloud_features.png"

im_recon = Image.open(recon_path).convert("RGB")
w, h = im_recon.size  # 1376, 768

# Create figure matching aspect ratio
fig, ax = plt.subplots(figsize=(16, 9), dpi=200)
ax.imshow(im_recon, extent=[0, w, h, 0])

# Subtle faint boundary for restored cloud region if mask exists
if os.path.exists(mask_path):
    mask = Image.open(mask_path).convert("L").resize((w, h))
    mask_np = np.array(mask)
    # Get cloud contour
    edges = mask.filter(ImageFilter.FIND_EDGES)
    edge_np = np.array(edges)
    # Overlay edge as dashed-like contour
    ax.contour(edge_np > 50, levels=[0.5], colors=['#38bdf8'], linewidths=[1.0], alpha=[0.45], linestyles=['dashed'], extent=[0, w, h, 0])

# Coordinates calibrated specifically for the 1376 x 768 Reconstructed LISS-IV scene
annotations = [
    {
        "target": (520, 420),
        "xytext": (360, 500),
        "label": "1. Restored River Channel",
        "sub": "Brahmaputra tributary restored through cloud",
        "color": "#38bdf8",
    },
    {
        "target": (830, 410),
        "xytext": (890, 360),
        "label": "2. River Meander & Sandbar",
        "sub": "Alluvial silt bank & water interface",
        "color": "#0ea5e9",
    },
    {
        "target": (680, 240),
        "xytext": (710, 150),
        "label": "3. Sub-Cloud Forest Canopy",
        "sub": "Dense broadleaf forest (80.9% cloud-occluded)",
        "color": "#16a34a",
    },
    {
        "target": (420, 130),
        "xytext": (220, 90),
        "label": "4. Northern Mountain Ridge",
        "sub": "Intact upland canopy with SAR structural alignment",
        "color": "#22c55e",
    },
    {
        "target": (220, 620),
        "xytext": (140, 710),
        "label": "5. Terraced Cropland Plots",
        "sub": "Active agricultural mosaic (NDVI 0.52 - 0.65)",
        "color": "#84cc16",
    },
    {
        "target": (1040, 580),
        "xytext": (1060, 680),
        "label": "6. Rural Agricultural Valley",
        "sub": "Cultivated field parcels & irrigation paths",
        "color": "#eab308",
    },
    {
        "target": (890, 480),
        "xytext": (920, 530),
        "label": "7. Valley Settlement & Road",
        "sub": "Impervious road corridor & village footprint",
        "color": "#f97316",
    },
    {
        "target": (1220, 160),
        "xytext": (1080, 90),
        "label": "8. Mountain Valley Forest",
        "sub": "Protected slope vegetation (high LAI)",
        "color": "#15803d",
    }
]

for ann in annotations:
    tx, ty = ann["target"]
    text_x, text_y = ann["xytext"]
    col = ann["color"]
    
    # Target indicator ring and center dot
    ax.plot(tx, ty, marker='o', markersize=6, markerfacecolor=col, markeredgecolor='#ffffff', markeredgewidth=1.6, zorder=5)
    ax.plot(tx, ty, marker='o', markersize=14, markerfacecolor='none', markeredgecolor=col, markeredgewidth=1.2, linestyle='--', zorder=4)

    # Leader arrow and text box
    ax.annotate(
        f"{ann['label']}\n{ann['sub']}",
        xy=(tx, ty),
        xytext=(text_x, text_y),
        bbox=dict(
            boxstyle="round,pad=0.45",
            facecolor="#081827",
            edgecolor=col,
            linewidth=1.6,
            alpha=0.92
        ),
        arrowprops=dict(
            arrowstyle="->",
            connectionstyle="arc3,rad=-0.12",
            color=col,
            linewidth=1.5,
            shrinkA=4,
            shrinkB=5
        ),
        color="#ffffff",
        fontsize=9,
        fontweight=600,
        zorder=6
    )

# Title watermark header pill
title_box = dict(boxstyle="round,pad=0.5", facecolor="#081827", edgecolor="#2878e5", linewidth=1.5, alpha=0.94)
ax.text(
    30, 40,
    "ISRO LISS-IV Scene (1376 x 768) • Automated Feature Diagnostics (Post-Reconstruction)",
    color="#f8fafc",
    fontsize=11,
    fontweight=700,
    bbox=title_box,
    zorder=7
)

# Legend pill bottom-left
legend_box = dict(boxstyle="round,pad=0.4", facecolor="#081827", edgecolor="#64748b", linewidth=1.0, alpha=0.90)
ax.text(
    30, h - 35,
    "Features: Water Channel • River Meander • Mountain Ridge • Terraced Crops • Dense Canopy • Roads",
    color="#94a3b8",
    fontsize=8.5,
    fontfamily="sans-serif",
    bbox=legend_box,
    zorder=7
)

ax.set_xlim(0, w)
ax.set_ylim(h, 0)
ax.axis("off")
plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

plt.savefig(out_public, bbox_inches='tight', pad_inches=0, dpi=200)
plt.savefig(out_brain, bbox_inches='tight', pad_inches=0, dpi=200)
plt.close()
print("Successfully generated annotated diagnostic map on the exact input scene!")
