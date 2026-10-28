# Cloudless AI — Comprehensive Test Plan & Verification Strategy

**Date**: 2026-10-20  
**Test Frameworks**: Pytest (Python backend pipeline & API), Vitest/React DOM Testing, Browser Automation Verification.

---

## 1. Test Architecture Overview

The Cloudless AI verification architecture guarantees end-to-end reliability across scientific machine learning pipelines, geospatial raster operations, and user interactions.

```
       +-----------------------------------------------------------+
       |                  Browser & E2E Testing                    |
       |  - Zero Dead Buttons Audit                                |
       |  - Navigation & Modal Dialog Transitions                  |
       |  - Drag-and-Drop Ingestion & File Downloads               |
       +-----------------------------+-----------------------------+
                                     |
       +-----------------------------v-----------------------------+
       |               Frontend Unit & Component Tests             |
       |  - Search palette filtering                               |
       |  - Stepper wizard transitions (Steps 1-5)                 |
       |  - State persistence in localStorage                      |
       |  - Real CSV / JSON Blob export generators                 |
       +-----------------------------+-----------------------------+
                                     |
       +-----------------------------v-----------------------------+
       |                 Backend API Integration Tests             |
       |  - POST /api/v1/jobs (Asynchronous worker queue)          |
       |  - GET /api/v1/jobs/{job_id}/results                      |
       |  - GET /api/v1/export/{job_id}/{export_type} (Binary tifs)|
       |  - Strict path traversal prevention & regex validation    |
       +-----------------------------+-----------------------------+
                                     |
       +-----------------------------v-----------------------------+
       |             Scientific Pipeline & Physics Fidelity         |
       |  - UnCRtainTS heteroscedastic uncertainty loss            |
       |  - Conformal calibration & isotonic quantile regression    |
       |  - Clear-pixel identity assertion                         |
       |  - GDAL/Rasterio CRS and transform validation             |
       +-----------------------------------------------------------+
```

---

## 2. Test Suites & Coverage Matrix

### Suite A: Backend Pipeline & Security (18 Pytest Tests)

1. `test_heteroscedastic_nll_loss`:
   - Verifies Gaussian negative log-likelihood loss for uncertainty prediction.
   - Asserts zero loss propagation on cloud-free pixels (clear pixel preservation).
2. `test_conformal_calibration_intervals`:
   - Validates that confidence intervals achieve nominal 90% and 95% empirical coverage.
3. `test_multi_modal_fusion_network`:
   - Asserts tensor output dimensions `(B, 3, H, W)` and value bounds `[0.0, 1.0]`.
4. `test_quality_aware_model_d`:
   - Verifies two-headed network outputting mean `mu` and log-variance `s`.
5. `test_cloud_detector_synthetic_and_real`:
   - Validates Otsu + morphological dilation cloud and shadow detection.
6. `test_reconstruction_evaluator`:
   - Verifies masked PSNR, SSIM, SAM, and MAE_cloud computations.
7. `test_job_worker_lifecycle`:
   - Verifies queued -> running -> completed state transitions.
8. `test_export_security_path_traversal`:
   - Enforces strict regex validation to reject `../` traversal attacks.
9. `test_export_allowlist_enforcement`:
   - Rejects unsupported export types with HTTP 400.
10. `test_validator_valid_image_scene`:
    - Asserts band counts, raster dimensions, and geospatial transforms.

### Suite B: Frontend Interaction & Behavioral Verification

| Component | Test Case | Target Assertion |
| :--- | :--- | :--- |
| `Sidebar` | Plan Upgrade Modal | Clicking "Upgrade Plan" opens modal; ESC closes modal; clicking "Top-up 20 Credits" increments credit balance. |
| `Topbar` | Global Search Palette | Typing query filters 12 indexed routes; pressing Enter navigates to matched route; clicking X clears input. |
| `Topbar` | Notifications Drawer | Clicking bell opens drawer; "Mark read" clears red indicator; "Clear" empties list. |
| `DashboardPage` | Sample Ingestion | Clicking "Sample Image" updates scene name to Brahmaputra Basin and displays confirmation toast. |
| `DashboardPage` | File Upload Validation | Files > 100MB rejected with error toast; valid `.tif` accepted and validated. |
| `DashboardPage` | Table Row Actions | Clicking "Preview" navigates to comparison; "Download" triggers export; "More" toggles popup. |
| `CloudRemovalPage` | 5-Step Stepper | Clicking steps 1 to 5 synchronizes active step state and visual indicators. |
| `CloudRemovalPage` | Download Results Card | Clicking any of the 5 result rows dispatches the appropriate binary or JSON download. |
| `ComparisonPage` | Share URL | Clicking Share copies current window URL to clipboard and renders confirmation toast. |
| `ComparisonPage` | Reset View | Clicking Reset View restores ROI to null, slider to 50%, and resets scale. |
| `BatchProcessingPage` | Batch Queue Ingestion | Drag-and-drop or browsing adds scenes to the queue with initial status "Queued". |
| `BatchProcessingPage` | Export Metadata (CSV) | Triggers download of formatted CSV containing queue job records. |
| `DatasetsPage` | Dataset Ingestion Modal | Submitting new dataset form appends to catalog and persists across views. |
| `ProjectsPage` | Project Creation Modal | Validates name requirement, creates workspace, and persists to `localStorage`. |
| `SupportingPages` | Settings Persistence | Updating CRS and clicking "Save Changes" persists to `localStorage` and shows banner. |

---

## 3. Automated Test Execution Commands

```bash
# 1. Run Frontend Unit & Component Interaction Tests (13 tests via Vitest & React Testing Library)
npm test

# 2. Run Python Backend Test Suite (18 tests via Pytest)
python -m pytest tests -q

# 3. Validate Production Bundle Compilation
npm run build

# 4. Verify Backend Health and Storage
python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8001/api/v1/health').read().decode())"
```

---

## 4. Acceptance Criteria & Completion Gate

- **Zero alerts**: No native `alert()`, `confirm()`, or `prompt()` calls in production source code.
- **Zero fake fallbacks**: When backend is offline or an error occurs, actionable error messages with a Retry button are displayed instead of fake progress simulations.
- **Real file outputs**: Every export action produces a valid downloadable artifact (GeoTIFF, PNG, JSON, CSV, or Text Report) with correct MIME type.
- **Accessibility**: Keyboard navigable, visible focus rings, aria labels on icon controls, and dialog focus trap with Escape key dismissal.
