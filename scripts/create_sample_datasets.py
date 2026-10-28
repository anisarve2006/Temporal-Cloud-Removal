import os
import numpy as np
from PIL import Image
import rasterio
from rasterio.transform import from_origin

# Directories
sample_dir = "sample_datasets_for_testing"
downloads_dir = "public/downloads"
os.makedirs(sample_dir, exist_ok=True)
os.makedirs(downloads_dir, exist_ok=True)

# 1. Main Benchmark: Assam_12JUN2023_LISS4.tif
cloudy_img_path = "public/images/satellite/satellite-cloudy.jpg"
im_cloudy = Image.open(cloudy_img_path).convert("RGB")
w, h = im_cloudy.size # 1376, 768
arr_cloudy = np.array(im_cloudy) # (768, 1376, 3)

# Georeferencing in UTM Zone 46N (Assam Brahmaputra basin)
# Upper-Left coordinates: Easting = 345000 m, Northing = 2915000 m, Pixel size = 5.0 m
transform = from_origin(345000.0, 2915000.0, 5.0, 5.0)
crs = rasterio.crs.CRS.from_epsg(32646)

# Output destinations for Assam_12JUN2023_LISS4.tif
destinations = [
    os.path.join(sample_dir, "Assam_12JUN2023_LISS4.tif"),
    os.path.join(downloads_dir, "Assam_12JUN2023_LISS4.tif"),
    "Assam_12JUN2023_LISS4.tif"
]

for dst in destinations:
    with rasterio.open(
        dst,
        'w',
        driver='GTiff',
        height=h,
        width=w,
        count=3,
        dtype='uint8',
        crs=crs,
        transform=transform,
        compress='deflate'
    ) as out_raster:
        # Band 1: Green, Band 2: Red, Band 3: NIR
        out_raster.write(arr_cloudy[:, :, 0], 1)
        out_raster.write(arr_cloudy[:, :, 1], 2)
        out_raster.write(arr_cloudy[:, :, 2], 3)
        out_raster.set_band_description(1, "Band 2 - Green (520-590 nm)")
        out_raster.set_band_description(2, "Band 3 - Red (620-680 nm)")
        out_raster.set_band_description(3, "Band 4 - Near Infrared (770-860 nm)")
    print(f"Generated: {dst} ({w}x{h}, 3 bands, EPSG:32646, 5m GSD)")

# 2. Also generate companion files: Temporal Prior & SAR Radar
temporal_img_path = "public/images/satellite/satellite-temporal-demo.jpg"
if os.path.exists(temporal_img_path):
    im_temp = Image.open(temporal_img_path).convert("RGB")
    arr_temp = np.array(im_temp)
    temp_dst = os.path.join(sample_dir, "LISS4_20231101_ASSAM_REF.tif")
    with rasterio.open(
        temp_dst,
        'w',
        driver='GTiff',
        height=im_temp.size[1],
        width=im_temp.size[0],
        count=3,
        dtype='uint8',
        crs=crs,
        transform=transform,
        compress='deflate'
    ) as out_raster:
        out_raster.write(arr_temp[:, :, 0], 1)
        out_raster.write(arr_temp[:, :, 1], 2)
        out_raster.write(arr_temp[:, :, 2], 3)
    print(f"Generated: {temp_dst}")

sar_img_path = "public/images/satellite/satellite-sar-demo.jpg"
if os.path.exists(sar_img_path):
    im_sar = Image.open(sar_img_path).convert("RGB")
    arr_sar = np.array(im_sar)
    sar_dst = os.path.join(sample_dir, "S1A_IW_GRDH_20230615_ASSAM.tif")
    with rasterio.open(
        sar_dst,
        'w',
        driver='GTiff',
        height=im_sar.size[1],
        width=im_sar.size[0],
        count=3,
        dtype='uint8',
        crs=crs,
        transform=transform,
        compress='deflate'
    ) as out_raster:
        out_raster.write(arr_sar[:, :, 0], 1)
        out_raster.write(arr_sar[:, :, 1], 2)
        out_raster.write(arr_sar[:, :, 2], 3)
    print(f"Generated: {sar_dst}")

print("All sample test GeoTIFFs created successfully!")

