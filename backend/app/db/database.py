import sqlite3
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from ..config import STORAGE_DIR

DB_PATH = STORAGE_DIR / "cloudless.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                job_id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                scene_name TEXT NOT NULL,
                model_id TEXT NOT NULL,
                spectral_mode TEXT NOT NULL,
                progress_stage TEXT NOT NULL,
                progress_percent INTEGER NOT NULL,
                duration_seconds REAL NOT NULL,
                metrics_json TEXT,
                results_json TEXT,
                provenance_json TEXT,
                error TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS evaluations (
                evaluation_id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                dataset_version TEXT NOT NULL,
                geographic_split TEXT NOT NULL,
                model_version TEXT NOT NULL,
                checkpoint_hash TEXT NOT NULL,
                is_synthetic_cloud INTEGER NOT NULL,
                report_json TEXT NOT NULL
            )
        """)
    conn.close()

# Auto-initialize database schema on import
init_db()

def save_job(job: Dict[str, Any]):
    conn = get_connection()
    with conn:
        conn.execute("""
            INSERT OR REPLACE INTO jobs (
                job_id, status, created_at, scene_name, model_id, spectral_mode,
                progress_stage, progress_percent, duration_seconds,
                metrics_json, results_json, provenance_json, error
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            job["job_id"],
            job["status"],
            job["created_at"],
            job["scene_name"],
            job["model_id"],
            job["spectral_mode"],
            job["progress"]["stage"],
            job["progress"]["percent"],
            job["progress"]["duration_seconds"],
            json.dumps(job.get("metrics")) if job.get("metrics") else None,
            json.dumps(job.get("results")) if job.get("results") else None,
            json.dumps(job.get("provenance")) if job.get("provenance") else None,
            job.get("error")
        ))
    conn.close()

def fetch_job(job_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM jobs WHERE job_id = ?", (job_id,)).fetchone()
    conn.close()
    if not row:
        return None
    return {
        "job_id": row["job_id"],
        "status": row["status"],
        "created_at": row["created_at"],
        "scene_name": row["scene_name"],
        "model_id": row["model_id"],
        "spectral_mode": row["spectral_mode"],
        "progress": {
            "stage": row["progress_stage"],
            "percent": row["progress_percent"],
            "duration_seconds": row["duration_seconds"]
        },
        "metrics": json.loads(row["metrics_json"]) if row["metrics_json"] else None,
        "results": json.loads(row["results_json"]) if row["results_json"] else None,
        "provenance": json.loads(row["provenance_json"]) if row["provenance_json"] else None,
        "error": row["error"]
    }

def fetch_all_jobs() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM jobs ORDER BY created_at DESC").fetchall()
    conn.close()
    jobs = []
    for row in rows:
        jobs.append({
            "job_id": row["job_id"],
            "status": row["status"],
            "created_at": row["created_at"],
            "scene_name": row["scene_name"],
            "model_id": row["model_id"],
            "spectral_mode": row["spectral_mode"],
            "progress": {
                "stage": row["progress_stage"],
                "percent": row["progress_percent"],
                "duration_seconds": row["duration_seconds"]
            },
            "metrics": json.loads(row["metrics_json"]) if row["metrics_json"] else None,
            "results": json.loads(row["results_json"]) if row["results_json"] else None,
            "provenance": json.loads(row["provenance_json"]) if row["provenance_json"] else None,
            "error": row["error"]
        })
    return jobs

def save_evaluation(eval_id: str, timestamp: str, dataset_version: str, split: str, model_version: str, checkpoint_hash: str, is_synthetic: bool, report: Dict[str, Any]):
    conn = get_connection()
    with conn:
        conn.execute("""
            INSERT OR REPLACE INTO evaluations (
                evaluation_id, timestamp, dataset_version, geographic_split,
                model_version, checkpoint_hash, is_synthetic_cloud, report_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            eval_id, timestamp, dataset_version, split, model_version, checkpoint_hash,
            1 if is_synthetic else 0, json.dumps(report)
        ))
    conn.close()

def fetch_evaluation(eval_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT report_json FROM evaluations WHERE evaluation_id = ?", (eval_id,)).fetchone()
    conn.close()
    if not row:
        return None
    return json.loads(row["report_json"])

def fetch_all_evaluations() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT report_json FROM evaluations ORDER BY timestamp DESC").fetchall()
    conn.close()
    return [json.loads(row["report_json"]) for row in rows]
