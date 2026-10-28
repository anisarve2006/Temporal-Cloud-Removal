import shutil
import torch
from fastapi import APIRouter
from typing import Dict, Any
from ..config import STORAGE_DIR

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=Dict[str, Any])
def health_check():
    """
    Returns service health, torch device status, GPU memory, and storage disk space.
    """
    cuda_available = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_available else "CPU (Standard Inference Engine)"
    
    # GPU statistics
    gpu_stats = {
        "cuda_available": cuda_available,
        "device": device_name,
    }
    if cuda_available:
        gpu_stats["allocated_gb"] = round(torch.cuda.memory_allocated(0) / (1024 ** 3), 3)
        gpu_stats["reserved_gb"] = round(torch.cuda.memory_reserved(0) / (1024 ** 3), 3)
        gpu_stats["total_device_memory_gb"] = round(torch.cuda.get_device_properties(0).total_memory / (1024 ** 3), 2)

    # Disk space check
    disk = shutil.disk_usage(STORAGE_DIR)
    free_gb = round(disk.free / (1024 ** 3), 2)
    total_gb = round(disk.total / (1024 ** 3), 2)
    percent_used = round(((disk.total - disk.free) / disk.total) * 100, 1)

    return {
        "status": "healthy" if free_gb > 1.0 else "warning_low_disk",
        "service": "Cloudless AI Geospatial Processing Backend",
        "version": "2.1.0-prod",
        "torch_version": torch.__version__,
        "gpu": gpu_stats,
        "storage": {
            "storage_path": str(STORAGE_DIR),
            "free_space_gb": free_gb,
            "total_space_gb": total_gb,
            "disk_used_percent": percent_used
        },
        "geospatial_engine": "Rasterio 1.5.2 + GDAL"
    }
