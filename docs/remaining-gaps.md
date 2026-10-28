# Cloudless AI — Remaining Gaps & Future Roadmap

**Document Status**: Production Engineering Audit  
**Date**: 2026-10-20  

This document explicitly details features and workflows that have functional UI contracts and local simulations/fallbacks in place, but require additional cloud credentials, external third-party services, physical hardware, or product policy decisions for full enterprise deployment.

---

## 1. External Credentials & Third-Party APIs

| Component / Workflow | External Dependency | Current Status | Remediation Required for Full Cloud Deployment |
| :--- | :--- | :--- | :--- |
| **ISRO Bhuvan / Bhoonidhi Live Ingestion** | ISRO Bhoonidhi Open Data Token / OAuth2 | Simulated via curated local LISS-IV archive (`Assam_12JUN2023.tif`) | Obtain institutional Bhoonidhi API key and register automated STAC harvesting client. |
| **Copernicus Data Space Ecosystem (CDSE)** | ESA CDSE OData / Copernicus Sentinel-1 API | Packaged sample Sentinel-1 SAR GRD pairs (`sar_vv_vh.tif`) | Add `CDSE_CLIENT_ID` and `CDSE_CLIENT_SECRET` in environment variables for automated temporal SAR tile fetching. |
| **Multi-User Authentication** | Supabase Auth / AWS Cognito / ISRO SSO | Mocked local user (`Anirudh`, Geospatial Enterprise Tier) | Integrate JWT authentication middleware on FastAPI backend and pass Bearer tokens from Topbar. |
| **Cloud Object Storage (S3/GCS/MinIO)** | AWS S3 / Google Cloud Storage bucket | Local disk storage under `backend/storage/uploads` and `backend/storage/outputs` | Configure S3 bucket with presigned URLs for large raster uploads (> 500 MB) to bypass direct worker streaming. |

---

## 2. Hardware Acceleration & Inference Engine

| Feature | Current Implementation | Production Requirement |
| :--- | :--- | :--- |
| **Inference Acceleration** | CPU Inference via PyTorch 2.10.0+cpu (1-3 seconds per 256x256 patch) | NVIDIA CUDA GPU (e.g., A10G / T4 / RTX 4090) with TensorRT optimization for sub-second 2048x2048 scene inference. |
| **Worker Queue Concurrency** | Single-worker background thread with `WORKER_SEMAPHORE = 1` to prevent CPU contention | Distributed Celery / Redis / RabbitMQ worker pool with GPU task partitioning. |
| **Memory Limits for Large Scenes** | Validated up to 100 MB GeoTIFFs (1024x1024 pixels) | Windowed tile-based sliding window inference (with 32px overlap smoothing) for full LISS-IV scenes (12,000 x 12,000 pixels). |

---

## 3. Product & Governance Decisions

1. **Credit Metering & Payment Gateway**:
   - Currently, clicking "Upgrade Plan" in the sidebar opens a fully functional modal allowing plan tier switching and top-up of credits in local memory.
   - For commercial billing, integration with Stripe or Razorpay is needed to bind credit top-ups to real monetary transactions.

2. **Long-Term Scene Retention Policy**:
   - Historical job records and outputs currently persist indefinitely in SQLite (`cloudless.db`) and `backend/storage/outputs`.
   - A retention policy (e.g., auto-archiving raw GeoTIFFs after 30 days while retaining JSON manifests and metrics) should be configured for production storage management.
