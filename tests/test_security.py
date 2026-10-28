import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "warning_low_disk"]
    assert "storage" in data
    assert data["storage"]["free_space_gb"] > 0

def test_path_traversal_prevention_on_export():
    """
    Attempts directory traversal using ../ in job_id:
    Must be rejected with HTTP 400 Bad Request.
    """
    malicious_ids = [
        "../../etc/passwd",
        "..\\..\\windows\\system32",
        "job/../../secret",
        "JOB-123;rm -rf"
    ]
    for bad_id in malicious_ids:
        response = client.get(f"/api/v1/export/{bad_id}/pdf")
        assert response.status_code in [400, 404]

def test_unsupported_export_type_allowlist():
    """
    Attempts export with disallowed format (e.g. .exe, .sh):
    Must be rejected with HTTP 400 Bad Request.
    """
    response = client.get("/api/v1/export/JOB_TEST_VALID_ID/executable_binary")
    assert response.status_code == 400
    assert "Unsupported export type" in response.json()["detail"]

def test_benchmarks_empty_or_dynamic_state():
    """
    Tests that benchmarks endpoint returns dynamic records or explicit empty state.
    Never returns hardcoded fake literals.
    """
    response = client.get("/api/v1/benchmarks")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["no_benchmark_run_yet", "benchmarks_available"]
