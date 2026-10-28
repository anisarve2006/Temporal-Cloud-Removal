# Cloudless AI — Multi-Modal Generative Satellite Cloud Removal

Physics-guided multi-modal generative satellite surface reconstruction, uncertainty quantification, and reproducible benchmarking platform for remote sensing imagery (ISRO LISS-IV + Sentinel-1 SAR).

---

## Quick Start

For detailed installation, configuration, testing, and deployment instructions, see **[HOW_TO_RUN.md](file:///f:/Temporal%20Cloud%20Removal/HOW_TO_RUN.md)**.

### 1. Launch Backend API Server (FastAPI)
```powershell
python backend/run.py
```
* API Server: `http://127.0.0.1:8001`
* Interactive API Docs: `http://127.0.0.1:8001/docs`

### 2. Launch Dashboard Frontend (React + Vite)
```powershell
npm run dev
```
* Dashboard Application: `http://127.0.0.1:5173/dashboard`

### 3. Run Automated Tests
```powershell
python -m pytest tests -v
```

### 4. Run Honest Benchmark Evaluation Suite
```powershell
python scripts/run_honest_evaluations.py
```

