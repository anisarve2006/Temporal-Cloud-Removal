from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class BenchmarkRun(BaseModel):
    benchmark_id: str
    run_date: str
    dataset_split: str
    models_evaluated: List[str]
    cloud_coverage_bins: Dict[str, Any]
    summary_table: List[Dict[str, Any]]
    ablations: List[Dict[str, Any]]
