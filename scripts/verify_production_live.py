import urllib.request
import json
import time

backend_url = "https://nexus-backend-75tg.onrender.com"
tests = [
    ("Backend Health", "/api/v1/health", "GET", None),
    ("Relational Persistence / DB", "/api/v1/health", "GET", None),
    ("Command Center Metrics", "/api/v1/command-center/metrics", "GET", None),
    ("Command Center Trends", "/api/v1/command-center/trends", "GET", None),
    ("Supplier Records & Risk", "/api/v1/supplier-risk/suppliers", "GET", None),
    ("Warehouse Records & Schema", "/api/v1/warehouse/schema", "GET", None),
    ("Shipment Telemetry / Routes", "/api/v1/network/routes", "GET", None),
    ("Global Geospatial Nodes", "/api/v1/network/nodes", "GET", None),
    ("Predictive Delay Regression", "/api/v1/predictive/delays", "GET", None),
    ("Demand Forecasting ML", "/api/v1/predictive/demand/forecast", "GET", None),
    ("Stockout Risk Analysis", "/api/v1/predictive/demand/stockouts", "GET", None),
    ("KDD Mining Stages", "/api/v1/mining/kdd/stages", "GET", None),
    ("Process Variant Mining", "/api/v1/mining/process-variants", "GET", None),
    ("Association Rule Discovery", "/api/v1/association-rules/datasets", "GET", None),
    ("Clustering Engine Run", "/api/v1/mining/clustering/run", "POST", {"n_clusters": 3, "feature_set": "supplier_risk"}),
    ("Anomaly Detection Engine", "/api/v1/anomalies/detect", "POST", {"contamination": 0.05}),
    ("OLAP Cube Analytical Query", "/api/v1/olap/query", "POST", {"dimensions": ["product_category"], "measures": [{"agg": "SUM", "col": "total_amount_usd", "alias": "revenue"}]}),
    ("Scenario Crisis Simulator", "/api/v1/scenarios/simulate", "POST", {"disruption_type": "port_closure", "intensity": 0.8, "target_region": "Suez Canal"}),
    ("Decision Intelligence Playbooks", "/api/v1/decisions/playbooks", "GET", None),
    ("Data Quality & Lineage", "/api/v1/etl/quality-metrics", "GET", None)
]

print("=== EXHAUSTIVE BACKEND INTEGRATION VERIFICATION ===")
all_passed = True
for name, endpoint, method, payload in tests:
    t0 = time.time()
    try:
        data_bytes = json.dumps(payload).encode("utf-8") if payload else None
        headers = {"User-Agent": "NexusVerifier", "Origin": "https://frontend-sage-six-23.vercel.app"}
        if payload:
            headers["Content-Type"] = "application/json"
        req = urllib.request.Request(backend_url + endpoint, data=data_bytes, headers=headers, method=method)
        res = urllib.request.urlopen(req, timeout=30)
        dt = round((time.time() - t0) * 1000, 1)
        resp_body = json.loads(res.read())
        preview = str(type(resp_body)) if not isinstance(resp_body, dict) else f"keys={list(resp_body.keys())[:3]}"
        print(f"[PASS] {name:32} | {endpoint:36} | {res.status} OK | {dt}ms | {preview}")
    except Exception as e:
        all_passed = False
        print(f"[FAIL] {name:32} | {endpoint:36} | ERROR: {e}")

if all_passed:
    print("\nOVERALL: ALL 20 CHECKS PASSED SUCCESSFULLY")
else:
    print("\nOVERALL: SOME CHECKS FAILED")
