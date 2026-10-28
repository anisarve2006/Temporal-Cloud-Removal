# Cloudless AI — Execution & Deployment Guide

This document provides step-by-step instructions to set up, configure, test, and run the **Cloudless AI** satellite cloud removal, uncertainty quantification, and geospatial benchmarking platform.

---

## 1. System Architecture Overview

Cloudless AI consists of two synchronized sub-systems:
* **Geospatial & Deep Learning Backend (FastAPI)**:
  * Runs on `http://127.0.0.1:8001`
  * Multi-modal model architectures: Baseline A (temporal radiometric matching), Baseline B (mask-aware residual U-Net), Model C (DB-CR cross-modality attention), Model D (UnCRtainTS heteroscedastic uncertainty head & selective fallback), U-TILISE (multi-date seq-to-seq), and Model E (diffusion bridge).
  * SQLite persistent queue & benchmark registry (`backend/storage/cloudless.db`).
  * Conformal prediction and isotonic uncertainty calibration.
* **Geospatial Dashboard Frontend (React + Vite)**:
  * Runs on `http://127.0.0.1:5173`
  * Interactive swipe comparisons, false-color composite inspection, uncertainty heatmaps, and land-use / land-cover (LULC) analysis.
  * Proxies API traffic from `/api` directly to `http://127.0.0.1:8001`.

---

## 2. Prerequisites

* **Operating System**: Windows 10/11, Ubuntu 22.04+, or macOS
* **Python**: Python 3.10 – 3.12 (Python 3.12 recommended)
* **Node.js**: Node.js v18.0+ and `npm`

---

## 3. Installation & Setup

### Step A: Clone / Navigate to Project Root
```bash
cd "f:\Temporal Cloud Removal"
```

### Step B: Backend Python Setup
1. *(Recommended)* Create and activate a virtual environment:
   ```powershell
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   ```bash
   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

> [!NOTE]
> **Windows GDAL & Rasterio Installation**:
> Pre-compiled wheels for Windows are available if compiling from source fails:
> ```powershell
> pip install --find-links=https://girder.github.io/large_image_wheels GDAL rasterio
> ```
> Or install via Conda:
> ```bash
> conda install -c conda-forge gdal rasterio
> ```

### Step C: Frontend Node Setup
Install frontend packages:
```bash
npm install
```

---

## 4. Running the Application

You will need two terminal windows: one for the backend and one for the frontend.

### Terminal 1: Launch Backend Server
```powershell
python backend/run.py
```
* **API Base URL**: `http://127.0.0.1:8001`
* **Interactive Swagger UI**: `http://127.0.0.1:8001/docs`
* **Alternative Port Configuration**: You can override the default port via environment variable:
  ```powershell
  $env:BACKEND_PORT="8001"; python backend/run.py
  ```

### Terminal 2: Launch Frontend Dashboard
```powershell
npm run dev
```
* **Frontend Web Application**: `http://127.0.0.1:5173/dashboard`
* Open your browser and navigate to `http://127.0.0.1:5173`.

---

## 5. Running Pipelines & Scripts

### Run Honest Benchmark Evaluation Suite
Evaluates Baseline A, Baseline B, Model C, and Model D over 20 spatially isolated test scenes with synthetic cloud overlays and records honest metrics directly into SQLite:
```powershell
python scripts/run_honest_evaluations.py
```

### Run Model Training Pipeline
Trains Baseline B, Model C, and Model D with compound loss and UnCRtainTS heteroscedastic loss, recording checkpoint SHA-256 hashes in `backend/storage/checkpoints/manifest.json`:
```powershell
python -m backend.training.train
```

### Prepare Public Demonstration Assets
Generates and formats demonstration optical, SAR, temporal, and mask assets in `public/images/satellite/`:
```powershell
python scripts/prepare_assets.py
```

---

## 6. Running the Automated Test Suite

Run all 18 automated unit and integration tests (metrics, tiling identity round-trip, security, scene validation, UnCRtainTS calibration, and neural models):
```powershell
python -m pytest tests -v
```

### What the Tests Verify:
1. **`test_metrics.py`**: Hand-computed PSNR, SAM ($0^\circ$ and $90^\circ$), SAM NaN numerical clamp guards, NDVI zero-division protection, and ECE calibration.
2. **`test_tiling.py`**: 2D separable Hann window symmetry and mathematical identity round-trip reconstruction ($f(x) = x \implies \text{max diff} < 2 \times 10^{-3}$).
3. **`test_security.py`**: Health check storage/GPU inspection, directory traversal (`../`) path injection rejection on exports, export type allowlist enforcement, and dynamic benchmark reading.
4. **`test_validator.py`**: Missing file rejection, corrupt non-image file handling, and valid GeoTIFF / imagery metadata validation.
5. **`test_calibration_and_architectures.py`**: UnCRtainTS isotonic calibration, conformal prediction intervals ($1-\alpha=90\%$), DB-CR cross-modality attention forward pass, U-TILISE multi-temporal target-clear preservation, and Model E diffusion multi-sample variance uncertainty.

---

## 7. Key REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Returns service health, GPU memory allocation, and storage disk usage |
| `GET` | `/api/v1/models` | Lists registered model architectures and checkpoint statuses |
| `POST` | `/api/v1/jobs` | Submits an asynchronous cloud removal reconstruction job |
| `GET` | `/api/v1/jobs/{job_id}` | Polls job progress (stage 1/6 to 6/6 and percentage) |
| `GET` | `/api/v1/jobs/{job_id}/results` | Retrieves reconstructed GeoTIFF paths, confidence maps, and metrics |
| `GET` | `/api/v1/benchmarks` | Reads dynamic benchmark summary table directly from SQLite |
| `POST` | `/api/v1/evaluations` | Triggers on-demand evaluation run against reference scenes |
| `GET` | `/api/v1/export/{job_id}/{type}` | Securely downloads artifacts (`geotiff`, `confidence`, `mask`, `pdf`, `csv`, `manifest`) |

---

## 8. Directory Structure

```text
├── backend/
│   ├── app/
│   │   ├── config.py                 # Paths, CRS defaults, and model registry
│   │   ├── main.py                   # FastAPI application & CORS configuration
│   │   ├── db/database.py            # SQLite database schema (jobs & evaluations)
│   │   ├── pipeline/
│   │   │   ├── baselines/            # Model inference drivers (A, B, C, D)
│   │   │   ├── calibration.py        # UnCRtainTS & Conformal Prediction engine
│   │   │   ├── cloud_detector.py     # Multi-spectral & morphological cloud detector
│   │   │   ├── evaluator.py          # PSNR, masked SSIM, SAM, NDVI, ECE metrics
│   │   │   ├── lulc_engine.py        # Foundation-model-embedded LULC classifier
│   │   │   ├── preprocessor.py       # CRS reprojection, SAR dB scaling, Hann tiling
│   │   │   └── validator.py          # Raster & NoData inspection
│   │   ├── queue/job_worker.py       # Concurrency-controlled background job worker
│   │   ├── routers/                  # API endpoints (jobs, evaluations, benchmarks, etc.)
│   │   └── schemas/                  # Pydantic v2 data models
│   ├── run.py                        # Uvicorn launcher
│   ├── storage/                      # SQLite DB, uploads, outputs, and checkpoints
│   └── training/                     # Dataset, losses, models, and training loop
├── public/images/satellite/          # Satellite demo rasters & assets
├── scripts/                          # Benchmark & asset generation scripts
├── src/                              # React frontend components, pages, & services
├── tests/                            # Automated pytest test suite
├── package.json                      # Frontend dependencies
├── requirements.txt                  # Python backend dependencies
├── vite.config.js                    # Vite dev server & backend proxy configuration
└── HOW_TO_RUN.md                     # This operational guide
```
