from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..schemas.job import JobCreateRequest, JobResponse, JobDetailResponse
from ..queue.job_worker import create_job, get_job, list_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("", response_model=JobResponse, status_code=202)
def submit_cloud_removal_job(request: JobCreateRequest):
    """
    Submits a cloud removal job to the processing queue.
    Returns 202 Accepted with job_id for asynchronous polling.
    """
    job_data = create_job(
        scene_name=request.scene_name,
        model_id=request.model_id,
        spectral_mode=request.spectral_mode,
        use_sar=request.use_sar,
        use_temporal=request.use_temporal,
        generate_confidence=request.generate_confidence,
        run_lulc=request.run_lulc,
        output_resolution=request.output_resolution,
    )
    return job_data

@router.get("", response_model=List[JobResponse])
def get_all_jobs():
    """
    Retrieves all jobs in the queue registry.
    """
    return list_jobs()

@router.get("/{job_id}", response_model=JobResponse)
def get_job_status(job_id: str):
    """
    Retrieves current processing status, stage, and progress percentage.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return job

@router.get("/{job_id}/results", response_model=JobDetailResponse)
def get_job_results(job_id: str):
    """
    Retrieves output files, scientific metrics, and provenance records for a completed job.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job '{job_id}' is currently '{job['status']}'. Results available upon completion."
        )
    return job
