"""
Cloudless AI — Zero-Dead-Interaction Automated Verification Script
Verifies frontend routes, backend health, export endpoints, and scans for inert handlers.
"""

import urllib.request
import urllib.error
import json
import sys
from pathlib import Path

VITE_URL = "http://127.0.0.1:5173"
BACKEND_URL = "http://127.0.0.1:8001/api/v1"

def check_url(url, expected_code=200):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ZeroDeadInteractionAuditor/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            code = response.getcode()
            content = response.read()
            return code == expected_code, code, len(content)
    except urllib.error.HTTPError as e:
        return False, e.code, 0
    except Exception as e:
        return False, str(e), 0

def run_audit():
    print("=" * 65)
    print("CLOUDLESS AI — ZERO-DEAD-INTERACTION AUDIT & VERIFICATION")
    print("=" * 65)

    passed_tests = 0
    total_tests = 0

    # 1. Frontend Route Accessibility
    routes = [
        "/",
        "/dashboard",
        "/cloud-removal",
        "/comparison",
        "/lulc-analysis",
        "/batch-processing",
        "/datasets",
        "/visualizations",
        "/projects",
        "/how-it-works",
        "/documentation",
        "/use-cases",
        "/api-access",
        "/settings",
        "/profile",
    ]

    print("\n[Phase 1] Verifying Frontend Routes...")
    for route in routes:
        total_tests += 1
        url = f"{VITE_URL}{route}"
        ok, code, size = check_url(url)
        status = "PASSED" if ok else "FAILED"
        if ok:
            passed_tests += 1
        print(f"  Route {route:22} -> Code: {code} | Size: {size:6} B | [{status}]")

    # 2. Backend Health & Service Integrity
    print("\n[Phase 2] Verifying Backend Services...")
    backend_endpoints = [
        "/health",
        "/models",
        "/benchmarks",
        "/jobs",
    ]
    for ep in backend_endpoints:
        total_tests += 1
        url = f"{BACKEND_URL}{ep}"
        ok, code, size = check_url(url)
        status = "PASSED" if ok else "FAILED"
        if ok:
            passed_tests += 1
        print(f"  API   {ep:22} -> Code: {code} | Size: {size:6} B | [{status}]")

    # 3. Export Endpoints (Zero Dead Downloads)
    print("\n[Phase 3] Verifying Real Downloadable Artifact Endpoints...")
    export_types = [
        "geotiff",
        "confidence",
        "mask",
        "manifest",
        "report",
        "csv"
    ]
    for exp in export_types:
        total_tests += 1
        url = f"{BACKEND_URL}/export/sample/{exp}"
        ok, code, size = check_url(url)
        status = "PASSED" if ok and size > 0 else "FAILED"
        if ok and size > 0:
            passed_tests += 1
        print(f"  Export: {exp:18} -> Code: {code} | Payload: {size:6} B | [{status}]")

    # 4. Codebase Scan for Dead Alerts and Empty Click Handlers
    print("\n[Phase 4] Checking Codebase for Alerts & Dead Handlers...")
    total_tests += 1
    src_dir = Path("src")
    alerts_found = []
    empty_clicks = []
    
    for file in src_dir.rglob("*.jsx"):
        content = file.read_text(encoding="utf-8")
        if "alert(" in content:
            alerts_found.append(str(file))
        if 'onClick={() => {}}' in content or 'onClick={() => alert(' in content:
            empty_clicks.append(str(file))

    if len(alerts_found) == 0 and len(empty_clicks) == 0:
        print("  Zero alert() or empty click handlers found across entire src/ directory! [PASSED]")
        passed_tests += 1
    else:
        print(f"  Found {len(alerts_found)} alert files and {len(empty_clicks)} empty click files! [FAILED]")

    print("\n" + "=" * 65)
    print(f"AUDIT SUMMARY: {passed_tests} / {total_tests} Tests Passed ({(passed_tests/total_tests)*100:.1f}%)")
    print("=" * 65)

    if passed_tests == total_tests:
        print("VERIFICATION COMPLETE: Zero-Dead-Interaction Contract Satisfied.")
        sys.exit(0)
    else:
        print("VERIFICATION FAILED: Unresolved issues remain.")
        sys.exit(1)

if __name__ == "__main__":
    run_audit()
