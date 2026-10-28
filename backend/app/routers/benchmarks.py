from fastapi import APIRouter
from typing import Dict, Any, List, Optional
from ..db.database import fetch_all_evaluations

router = APIRouter(prefix="/benchmarks", tags=["Benchmarks"])

@router.get("")
def get_benchmark_comparison():
    """
    Returns comparative evaluation runs across baselines and ablation experiments.
    Strictly reads real evaluations written to SQLite database by real evaluation runs.
    If no evaluation runs exist yet, returns an explicit empty state.
    """
    evaluations = fetch_all_evaluations()

    if not evaluations:
        return {
            "status": "no_benchmark_run_yet",
            "message": "No benchmark evaluation run has been recorded yet. Execute an evaluation pipeline with /api/v1/evaluations to generate verified benchmarks from paired scenes.",
            "total_runs": 0,
            "summary_table": [],
            "ablations": []
        }

    # Extract summary table from real evaluation records
    summary_table = []
    ablations = []

    for ev in evaluations:
        # Check if record has evaluation summary
        metrics = ev.get("metrics", {})
        cloud_region = metrics.get("cloud_region", {})
        overall = metrics.get("overall", {})
        
        entry = {
            "evaluation_id": ev.get("evaluation_id"),
            "model": ev.get("model_name", ev.get("model_version", "Unknown Model")),
            "dataset_split": ev.get("dataset_split", "held_out_spatial"),
            "is_synthetic_cloud": ev.get("is_synthetic_cloud", False),
            "psnr_db": overall.get("psnr"),
            "ssim": overall.get("ssim"),
            "sam_deg": overall.get("sam_degrees"),
            "mae_cloud": cloud_region.get("mae"),
            "valid_pixels": overall.get("valid_pixels_count", 0),
            "clear_pixels_unchanged_asserted": ev.get("clear_pixels_unchanged", True),
            "checkpoint_hash": ev.get("checkpoint_hash", "n/a"),
            "timestamp": ev.get("timestamp")
        }
        
        if ev.get("is_ablation"):
            ablations.append(entry)
        else:
            summary_table.append(entry)

    return {
        "status": "benchmarks_available",
        "benchmark_id": f"BM_EVAL_COUNT_{len(evaluations)}",
        "total_runs": len(evaluations),
        "summary_table": summary_table,
        "ablations": ablations
    }
