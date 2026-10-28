import time
import shutil
from pathlib import Path
from ..config import UPLOADS_DIR, OUTPUTS_DIR, STORAGE_DIR

def enforce_storage_cleanup_policy(max_age_days: int = 7, max_disk_usage_pct: float = 85.0):
    """
    Enforces storage cleanup policy:
    1. Removes temporary uploaded scenes older than max_age_days
    2. If disk usage exceeds max_disk_usage_pct, prunes oldest outputs first
    """
    now = time.time()
    max_age_sec = max_age_days * 86400

    # 1. Prune stale uploads
    if UPLOADS_DIR.exists():
        for item in UPLOADS_DIR.iterdir():
            try:
                if item.is_file() and (now - item.stat().st_mtime) > max_age_sec:
                    item.unlink(missing_ok=True)
            except Exception:
                pass

    # 2. Check disk usage
    disk = shutil.disk_usage(STORAGE_DIR)
    used_pct = ((disk.total - disk.free) / disk.total) * 100.0

    if used_pct > max_disk_usage_pct and OUTPUTS_DIR.exists():
        # Sort output directories by creation time ascending
        output_dirs = sorted([d for d in OUTPUTS_DIR.iterdir() if d.is_dir()], key=lambda d: d.stat().st_mtime)
        for d in output_dirs:
            shutil.rmtree(d, ignore_errors=True)
            disk = shutil.disk_usage(STORAGE_DIR)
            used_pct = ((disk.total - disk.free) / disk.total) * 100.0
            if used_pct <= (max_disk_usage_pct - 5.0):
                break
