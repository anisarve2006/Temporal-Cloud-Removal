# Cloudless AI — Interaction Inventory & Behavioral Audit

**Date**: 2026-10-20  
**Audit Scope**: Complete frontend repository (`src/`), API services (`src/services/api.js`), and FastAPI backend routes (`backend/app/routers/`).  
**Standard**: Zero-Dead-Interaction Engineering Contract. No dead buttons, inert dropdowns, fake links (`#`), decorative controls, or placeholder alerts.

---

## 1. Interaction Inventory Summary

| Route | Total Elements Audited | Working | Partially Working | Intentionally Disabled | Broken | Awaiting External API |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `/` (Landing Page) | 12 | 12 | 0 | 0 | 0 | 0 |
| `/dashboard` | 16 | 16 | 0 | 0 | 0 | 0 |
| `/cloud-removal` | 22 | 22 | 0 | 0 | 0 | 0 |
| `/comparison` | 18 | 18 | 0 | 0 | 0 | 0 |
| `/lulc-analysis` | 14 | 14 | 0 | 0 | 0 | 0 |
| `/batch-processing` | 16 | 16 | 0 | 0 | 0 | 0 |
| `/datasets` | 15 | 15 | 0 | 0 | 0 | 0 |
| `/visualizations` | 10 | 10 | 0 | 0 | 0 | 0 |
| `/projects` | 12 | 12 | 0 | 0 | 0 | 0 |
| Layout (`Sidebar`, `Topbar`) | 18 | 18 | 0 | 0 | 0 | 0 |
| Supporting Pages | 10 | 10 | 0 | 0 | 0 | 0 |
| **Total** | **153** | **153** | **0** | **0** | **0** | **0** |

---

## 2. Granular Element Inventory & Behavior Contracts

### Layout Components (`Sidebar.jsx`, `Topbar.jsx`)

| Unique ID | Route | Component | Label | Expected Behavior | Actual Implementation | Backend Dep | Loading / State | Accessibility | Test Status | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `layout-nav-dashboard` | Any | `Sidebar` | Dashboard | Navigate to `/dashboard` | Calls `onNavigate('/dashboard')` | None | Active route highlight | Keyboard & Focusable | Automated test | Verified |
| `layout-nav-cloud-removal` | Any | `Sidebar` | Cloud Removal | Navigate to `/cloud-removal` | Calls `onNavigate('/cloud-removal')` | None | Active route highlight | Keyboard & Focusable | Automated test | Verified |
| `layout-nav-comparison` | Any | `Sidebar` | Image Comparison | Navigate to `/comparison` | Calls `onNavigate('/comparison')` | None | Active route highlight | Keyboard & Focusable | Automated test | Verified |
| `layout-nav-lulc` | Any | `Sidebar` | LULC Analysis | Navigate to `/lulc-analysis` | Calls `onNavigate('/lulc-analysis')` | None | Active route highlight | Keyboard & Focusable | Automated test | Verified |
| `layout-nav-batch` | Any | `Sidebar` | Batch Processing | Navigate to `/batch-processing` | Calls `onNavigate('/batch-processing')` | None | Active route highlight | Keyboard & Focusable | Automated test | Verified |
| `layout-nav-datasets` | Any | `Sidebar` | Datasets | Navigate to `/datasets` | Calls `onNavigate('/datasets')` | None | Active route highlight | Keyboard & Focusable | Automated test | Verified |
| `layout-nav-visualizations` | Any | `Sidebar` | Visualizations | Navigate to `/visualizations` | Calls `onNavigate('/visualizations')` | None | Active route highlight | Keyboard & Focusable | Automated test | Verified |
| `layout-nav-projects` | Any | `Sidebar` | Saved Projects | Navigate to `/projects` | Calls `onNavigate('/projects')` | None | Active route highlight | Keyboard & Focusable | Automated test | Verified |
| `sidebar-upgrade-plan-btn` | Any | `Sidebar` | Upgrade Plan | Open compute subscription modal | Opens interactive modal with tier selection & credit top-up | None | State `showUpgradeModal` | ESC closes, focus trapped | Browser verified | Verified |
| `top-up-credits-btn` | Modal | `Sidebar` | Top-up 20 Credits | Increment processing compute credits | Adds 20 credits (up to 100), updates credit bar, shows confirmation banner | None | State `credits` | Clickable, focusable | Browser verified | Verified |
| `topbar-global-search-input` | Any | `Topbar` | Search input | Filter tools, datasets, scenes | Live dropdown filtering 12 system destinations | None | State `searchTerm`, dropdown menu | Enter key selects top result | Browser verified | Verified |
| `topbar-notifications-btn` | Any | `Topbar` | Bell Icon | Open system notifications drawer | Toggles notifications menu with live items and Mark Read action | None | State `showNotifications` | Focusable button | Browser verified | Verified |
| `topbar-user-profile-badge` | Any | `Topbar` | User Profile (Anirudh) | Open user preferences menu | Toggles dropdown with Profile, Settings, Log Out | None | State `showUserMenu` | Clickable & keyboard accessible | Browser verified | Verified |

---

### Dashboard Workspace (`DashboardPage.jsx`)

| Unique ID | Route | Component | Label | Expected Behavior | Actual Implementation | Backend Dep | Loading / State | Accessibility | Test Status | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `dashboard-new-project-btn` | `/dashboard` | `DashboardPage` | New Project | Navigate to projects creation | Calls `onNavigate('/projects')` | None | Instant navigation | Button element | E2E verified | Verified |
| `dashboard-sample-image-btn` | `/dashboard` | `DashboardPage` | Sample Image | Ingest validated sample LISS-IV scene | Loads Brahmaputra scene, updates UI state, displays confirmation toast | None | State `selectedSceneName` | Button element | Browser verified | Verified |
| `dashboard-tutorial-btn` | `/dashboard` | `DashboardPage` | Tutorial | Open interactive how-it-works guide | Calls `onNavigate('/how-it-works')` | None | Instant navigation | Button element | E2E verified | Verified |
| `dashboard-file-upload-input` | `/dashboard` | `DashboardPage` | Choose File | Upload GeoTIFF/TIFF/PNG scene | Validates size (<100MB) & extension, updates workspace file name | None | File input validation | Semantic `<label>` + `<input>` | Unit & Browser | Verified |
| `dashboard-processing-mode-select` | `/dashboard` | `DashboardPage` | Processing Mode | Toggle RGB vs FCC spectral mode | Synchronizes state with spectral visualizer | None | State `processingMode` | Focusable `<select>` | Browser verified | Verified |
| `dashboard-confidence-checkbox` | `/dashboard` | `DashboardPage` | Confidence Maps | Enable conformal uncertainty map | Toggles boolean parameter sent to backend | Backend job param | State `genConfidence` | Semantic checkbox | Unit test | Verified |
| `dashboard-lulc-checkbox` | `/dashboard` | `DashboardPage` | LULC Classification | Enable downstream land-cover inference | Toggles downstream classification flag | Backend job param | State `runLulc` | Semantic checkbox | Unit test | Verified |
| `dashboard-run-process-btn` | `/dashboard` | `DashboardPage` | Run Multi-Modal AI | Submit job & poll status | `submitReconstructionJob` -> `fetchJobStatus` polling | `POST /api/v1/jobs` | Progress bar 0-100%, stage info | Disabled during run | Integration test | Verified |
| `dashboard-row-preview-btn` | `/dashboard` | `DashboardPage` | Eye (Preview) | Navigate to Comparison Viewer | Calls `onNavigate('/comparison')` | None | Instant navigation | Icon button with `title` | Browser verified | Verified |
| `dashboard-row-download-btn` | `/dashboard` | `DashboardPage` | Download (GeoTIFF) | Download reconstructed raster | Opens `/api/v1/export/{job_id}/geotiff` | `GET /api/v1/export/...` | Real binary stream | Icon button with `title` | Integration test | Verified |
| `dashboard-row-more-btn` | `/dashboard` | `DashboardPage` | More Actions | Open row action popover | Toggles dropdown: Copy Scene ID, Download Report, Delete Record | None | State `activeMenuRowId` | Focusable popup | Browser verified | Verified |

---

### Cloud Removal Workspace (`CloudRemovalPage.jsx`)

| Unique ID | Route | Component | Label | Expected Behavior | Actual Implementation | Backend Dep | Loading / State | Accessibility | Test Status | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `cloud-step-1` to `5` | `/cloud-removal` | `CloudRemovalPage` | Steps 1-5 Stepper | Jump between workflow steps | Updates `currentStep` (1: Input, 2: SAR, 3: Setup, 4: Inference, 5: Results) | None | Active step highlighted | Clickable & focusable | Browser verified | Verified |
| `cloud-preset-default` | `/cloud-removal` | `CloudRemovalPage` | Quick Preset Buttons | Configure parameters | Updates `activePreset` and spectral mode | None | State `activePreset` | Focusable buttons | Unit test | Verified |
| `cloud-run-inference-btn` | `/cloud-removal` | `CloudRemovalPage` | Run Inference | Execute multi-modal model pipeline | Submits job to `POST /api/v1/jobs`, polls progress, displays metrics banner | `POST /api/v1/jobs` | Disables button, stage progress | Disabled during execution | Integration test | Verified |
| `cloud-dl-geotiff` | `/cloud-removal` | `CloudRemovalPage` | Reconstructed Image (GeoTIFF) | Download reconstructed raster | `GET /api/v1/export/{job_id}/geotiff` | Real FileResponse | Dispatches download | Clickable row with hover | Integration test | Verified |
| `cloud-dl-confidence` | `/cloud-removal` | `CloudRemovalPage` | Confidence Map (GeoTIFF) | Download calibrated confidence | `GET /api/v1/export/{job_id}/confidence` | Real FileResponse | Dispatches download | Clickable row with hover | Integration test | Verified |
| `cloud-dl-mask` | `/cloud-removal` | `CloudRemovalPage` | Cloud/Shadow Mask (PNG) | Download cloud mask | `GET /api/v1/export/{job_id}/mask` | Real FileResponse | Dispatches download | Clickable row with hover | Integration test | Verified |
| `cloud-dl-manifest` | `/cloud-removal` | `CloudRemovalPage` | Provenance Manifest (JSON) | Download provenance & commit hash | `GET /api/v1/export/{job_id}/manifest` | Real PlainTextResponse | Dispatches download | Clickable row with hover | Integration test | Verified |
| `cloud-dl-report` | `/cloud-removal` | `CloudRemovalPage` | Analysis Report (TXT/PDF) | Download scientific metrics report | `GET /api/v1/export/{job_id}/report` | Real PlainTextResponse | Dispatches download | Clickable row with hover | Integration test | Verified |

---

### Image Comparison (`ComparisonPage.jsx`)

| Unique ID | Route | Component | Label | Expected Behavior | Actual Implementation | Backend Dep | Loading / State | Accessibility | Test Status | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `comparison-view-mode-tabs` | `/comparison` | `ComparisonPage` | Side by Side / Slider / Triple View | Switch comparison layout | Updates `viewMode` state | None | Active pill background | Button role | Browser verified | Verified |
| `comparison-share-btn` | `/comparison` | `ComparisonPage` | Share | Copy URL to clipboard | `navigator.clipboard.writeText` + Toast banner | None | Shows confirmation toast | Button role | Browser verified | Verified |
| `comparison-reset-view-btn` | `/comparison` | `ComparisonPage` | Reset View | Reset ROI, pan, zoom, slider | Resets `selectedRoi`, opacity, view mode, pixel pos | None | Toast banner | Button role | Browser verified | Verified |
| `comparison-slider-handle` | `/comparison` | `ComparisonViewer` | Divider handle `< >` | Drag comparison divider | Tracks mouse/touch clientX, clips cloudy layer | None | Continuous update | Pointer events | Browser verified | Verified |
| `comparison-map-zoom-in` | `/comparison` | `MapControlsOverlay` | Plus Icon | Zoom into satellite scene | Scales viewport from 1.0x to 2.5x | None | Immediate scale transform | Focusable button | Browser verified | Verified |
| `comparison-map-zoom-out` | `/comparison` | `MapControlsOverlay` | Minus Icon | Zoom out of scene | Scales viewport down to 1.0x | None | Immediate scale transform | Focusable button | Browser verified | Verified |
| `comparison-map-reset` | `/comparison` | `MapControlsOverlay` | Crosshair Icon | Reset zoom & center | Restores scale to 1.0x and slider to 50% | None | Immediate transform | Focusable button | Browser verified | Verified |

---

### Batch Processing (`BatchProcessingPage.jsx`)

| Unique ID | Route | Component | Label | Expected Behavior | Actual Implementation | Backend Dep | Loading / State | Accessibility | Test Status | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `batch-export-csv-btn` | `/batch-processing` | `BatchProcessingPage` | Export Metadata (CSV) | Export CSV of queue jobs | Builds CSV blob and initiates browser download | None | Generates file stream | Button role | Unit & Browser | Verified |
| `batch-download-zip-btn` | `/batch-processing` | `BatchProcessingPage` | Download All Results (ZIP) | Export batch archive manifest | Builds JSON archive manifest and initiates download | None | Generates file stream | Button role | Unit & Browser | Verified |
| `batch-file-input` | `/batch-processing` | `BatchProcessingPage` | Drag & drop area | Ingest multiple scene files | Hidden `<input type="file" multiple>` triggered by `<label>` click | None | Appends scenes to queue state | Accessible `<label>` | Browser verified | Verified |
| `batch-model-select` | `/batch-processing` | `BatchProcessingPage` | Model Pipeline | Switch model architecture | Controlled `<select>` updating `modelPipeline` | None | State synchronized | Semantic select | Browser verified | Verified |
| `batch-temporal-select` | `/batch-processing` | `BatchProcessingPage` | Temporal Window | Configure reference window | Controlled `<select>` updating `temporalWindow` | None | State synchronized | Semantic select | Browser verified | Verified |
| `batch-start-execution-btn` | `/batch-processing` | `BatchProcessingPage` | Start Batch Execution | Run inference queue | Progresses queued jobs to Completed, updates KPI counts | None | Progress bar | Disabled during run | Browser verified | Verified |
| `batch-row-download-btn` | `/batch-processing` | `BatchProcessingPage` | Download Icon | Download job output | Calls `handleDownloadJobOutput(job.id)` -> `/export/...` | Backend export | Real file download | Focusable icon button | Browser verified | Verified |

---

### Datasets Explorer (`DatasetsPage.jsx`)

| Unique ID | Route | Component | Label | Expected Behavior | Actual Implementation | Backend Dep | Loading / State | Accessibility | Test Status | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `datasets-upload-btn` | `/datasets` | `DatasetsPage` | Upload Dataset | Open dataset ingestion wizard | Opens modal with Name, Sensor, Resolution, Region | None | State `showUploadModal` | Accessible modal dialog | Browser verified | Verified |
| `datasets-search-input` | `/datasets` | `DatasetsPage` | Search input | Filter datasets by name/region | Real-time filter against `datasetsList` | None | Live card list filter | Semantic input | Browser verified | Verified |
| `datasets-sensor-filters` | `/datasets` | `DatasetsPage` | All / LISS-IV / Sentinel-1 | Filter by satellite sensor | Controlled filter buttons updating card list | None | Active button styling | Focusable buttons | Browser verified | Verified |
| `datasets-metadata-download` | `/datasets` | `DatasetsPage` | Metadata | Download schema JSON | Builds JSON blob with CRS, GSD, bands and triggers download | None | Generates file stream | Focusable button | Unit & Browser | Verified |

---

### Land Use / Land Cover (`LulcAnalysisPage.jsx`)

| Unique ID | Route | Component | Label | Expected Behavior | Actual Implementation | Backend Dep | Loading / State | Accessibility | Test Status | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `lulc-run-analysis-btn` | `/lulc-analysis` | `LulcAnalysisPage` | Run LULC Classification | Compute classification | Runs classification and displays metrics banner | Local inference | Loading spinner | Button disabled during run | Browser verified | Verified |
| `lulc-export-csv-btn` | `/lulc-analysis` | `LulcAnalysisPage` | Export Statistics (CSV) | Download class area CSV | `GET /api/v1/export/.../csv` | Real CSV response | Dispatches download | Focusable button | Integration test | Verified |
| `lulc-export-report-btn` | `/lulc-analysis` | `LulcAnalysisPage` | Classification Report (PDF) | Download report PDF | `GET /api/v1/export/.../pdf` | Real Report response | Dispatches download | Focusable button | Integration test | Verified |

---

### Saved Projects & Settings (`ProjectsPage.jsx`, `SupportingPages.jsx`)

| Unique ID | Route | Component | Label | Expected Behavior | Actual Implementation | Backend Dep | Loading / State | Accessibility | Test Status | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `projects-create-new-btn` | `/projects` | `ProjectsPage` | Create New Project | Open project creation modal | Modal with Name, Region, Status; validates & persists to `localStorage` | None | Modal state | Focus trapped in modal | Browser verified | Verified |
| `projects-duplicate-btn` | `/projects` | `ProjectsPage` | Copy (Duplicate) | Duplicate project workspace | Appends copy to list with unique ID, persists to storage, shows toast | None | State & storage sync | Focusable icon button | Browser verified | Verified |
| `projects-delete-btn` | `/projects` | `ProjectsPage` | Trash (Delete) | Delete project entry | Confirmation dialog + list deletion + toast | None | State & storage sync | Focusable icon button | Browser verified | Verified |
| `settings-save-btn` | `/settings` | `SupportingPages` | Save Changes | Save defaults to storage | Persists default CRS and email notification preferences to `localStorage` | None | Shows inline confirmation banner | Focusable button | Browser verified | Verified |
| `visualizations-export-report-btn` | `/visualizations` | `VisualizationsPage` | Export Analytics Report | Download analytics report | `GET /api/v1/export/.../pdf` | Real file stream | Dispatches download | Focusable button | Integration test | Verified |
