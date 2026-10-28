Cloudless AI - Sample Test Datasets for Frontend Testing
========================================================================

These sample datasets are ready to be uploaded directly into the Cloud Removal Workspace 
(http://127.0.0.1:5173/cloud-removal) using 'Browse Local GeoTIFF' or drag-and-drop.

Files Included in this Directory:
---------------------------------
1. Assam_Brahmaputra_Floodplain.tif (.jpg)
   - Geography: Central Assam Brahmaputra river channel & alluvial sandbars
   - Cloud Cover: 80.98% opaque cumulus cloud
   - Bands: 3 Bands (Green, Red, NIR) • CRS: EPSG:32646 (UTM Zone 46N) • GSD: 5.0 m

2. Tezpur_Hills_Dense_Forest.tif (.jpg)
   - Geography: Northern Himalayan foothill forest and mountain slopes
   - Cloud Cover: 58.40% orographic ridge clouds
   - Bands: 3 Bands (Green, Red, NIR) • CRS: EPSG:32646 • GSD: 5.0 m

3. Guwahati_Urban_Wetlands.tif (.jpg)
   - Geography: Urban settlement, transport corridors & wetland fringe
   - Cloud Cover: 42.15% cloud & shadow mix
   - Bands: 3 Bands (Green, Red, NIR) • CRS: EPSG:32646 • GSD: 5.0 m

4. Nagaon_Agricultural_Paddy.tif (.jpg)
   - Geography: Intensive agricultural floodplain & paddy parcels
   - Cloud Cover: 64.70% popcorn cumulus clouds
   - Bands: 3 Bands (Green, Red, NIR) • CRS: EPSG:32646 • GSD: 5.0 m

5. Kaziranga_Riparian_Buffer.tif (.jpg)
   - Geography: Riparian wetlands, wildlife reserve & oxbow water bodies
   - Cloud Cover: 71.30% river basin monsoon cloud
   - Bands: 3 Bands (Green, Red, NIR) • CRS: EPSG:32646 • GSD: 5.0 m

How to Test on Frontend:
------------------------
1. Go to http://127.0.0.1:5173/cloud-removal
2. Click 'Browse Local GeoTIFF' or 'Upload & Validate Custom Scene'.
3. Select any of the .tif or .jpg files above.
4. Pre-flight verification (validator.py) will check CRS (EPSG:32646), 5m GSD, and 3 Bands.
5. All 10 multi-modal imagery types will render immediately in DAG generation order!
