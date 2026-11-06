import urllib.request
import json
import sys

endpoints = [
    ('1. Health', 'http://localhost:8000/api/v1/health'),
    ('2. Models Registry', 'http://localhost:8000/api/v1/models'),
    ('3. Command Center Metrics', 'http://localhost:8000/api/v1/command-center/metrics'),
    ('4. Network Nodes', 'http://localhost:8000/api/v1/network/nodes'),
    ('5. Network Routes', 'http://localhost:8000/api/v1/network/routes'),
    ('6. Warehouse Schema', 'http://localhost:8000/api/v1/warehouse/schema'),
    ('7. ETL Pipelines', 'http://localhost:8000/api/v1/etl/pipelines'),
    ('8. Supplier Risk Benchmarks', 'http://localhost:8000/api/v1/supplier-risk/benchmarks'),
    ('9. Inventory Stockouts', 'http://localhost:8000/api/v1/inventory/stockouts'),
    ('10. Geospatial Chokepoints', 'http://localhost:8000/api/v1/geospatial/chokepoints'),
    ('11. Scenario Catalog', 'http://localhost:8000/api/v1/scenarios/catalog'),
    ('12. Decision Insights', 'http://localhost:8000/api/v1/decisions/insights'),
    ('13. Reports List', 'http://localhost:8000/api/v1/reports/list'),
    ('14. Reports CSV Export', 'http://localhost:8000/api/v1/reports/export/csv/supplier_risk'),
    ('15. Frontend Root /', 'http://localhost:3000/'),
    ('16. Frontend Network /network', 'http://localhost:3000/network'),
    ('17. Frontend Scenarios /scenarios', 'http://localhost:3000/scenarios'),
    ('18. Frontend Reports /reports', 'http://localhost:3000/reports'),
    ('19. Frontend Settings /settings', 'http://localhost:3000/settings')
]

print("=======================================================")
print("NEXUS END-TO-END 19-STEP PLATFORM VERIFICATION AUDIT")
print("=======================================================")
all_ok = True
for name, url in endpoints:
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            code = resp.getcode()
            print(f"[PASSED] {code} - {name} -> {url}")
    except Exception as e:
        print(f"[FAILED] {name} -> {url} ({e})")
        all_ok = False

if all_ok:
    print("\nRESULT: 19/19 SURFACES VERIFIED 100% OPERATIONAL (ZERO FAILURES)!")
    print("=======================================================\n")
    sys.exit(0)
else:
    print("\nSOME SURFACES FAILED AUDIT\n")
    sys.exit(1)
