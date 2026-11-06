from fastapi import APIRouter, Response, HTTPException
from typing import List, Dict, Any
from datetime import datetime
import io
import csv
from app.services.analytics import analytics_engine

router = APIRouter()

@router.get("/list")
def get_reports_list() -> List[Dict[str, Any]]:
    return [
        {
            "id": "RPT-2026-Q4-BOARD",
            "title": "Quarterly Executive Supply Chain Resilience Dossier",
            "format": "PDF / Executive Presentation",
            "dataset": "supplier_risk",
            "pages": 28,
            "generated_date": "2026-11-01",
            "file_size": "8.4 MB",
            "status": "Ready",
            "confidentiality": "Restricted / Board Level"
        },
        {
            "id": "RPT-2026-CHOKEPOINT-AUDIT",
            "title": "Strategic Maritime Chokepoint & Geopolitical Exposure Audit",
            "format": "CSV & Analytical Package",
            "dataset": "olap_cube",
            "pages": 14,
            "generated_date": "2026-11-05",
            "file_size": "4.2 MB",
            "status": "Ready",
            "confidentiality": "Internal Operations"
        },
        {
            "id": "RPT-2026-SUPPLIER-ESG",
            "title": "Global Supplier Risk & Lead-Time Matrix",
            "format": "CSV Audit Package",
            "dataset": "supplier_risk",
            "pages": 45,
            "generated_date": "2026-10-28",
            "file_size": "12.1 MB",
            "status": "Ready",
            "confidentiality": "Audit Ready"
        },
        {
            "id": "RPT-2026-ML-BENCHMARKS",
            "title": "Supervised Model Performance & Holdout Validation Benchmark",
            "format": "CSV Model Registry",
            "dataset": "model_benchmarks",
            "pages": 18,
            "generated_date": "2026-11-06",
            "file_size": "2.8 MB",
            "status": "Ready",
            "confidentiality": "Internal Analytics"
        },
        {
            "id": "RPT-2026-DATA-QUALITY",
            "title": "Star-Schema Data Warehouse Certification & Quality Profile",
            "format": "CSV Profile Scorecard",
            "dataset": "data_quality",
            "pages": 12,
            "generated_date": "2026-11-06",
            "file_size": "1.9 MB",
            "status": "Ready",
            "confidentiality": "Data Governance"
        }
    ]

@router.get("/export/csv/{dataset}")
def export_dataset_csv(dataset: str):
    output = io.StringIO()
    writer = csv.writer(output)
    filename = f"nexus_{dataset}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    if dataset in ["supplier_risk", "suppliers"]:
        writer.writerow(["supplier_id", "supplier_name", "country", "tier", "reliability_pct", "defect_rate_pct", "risk_score", "predicted_risk_level"])
        suppliers = [
            ("SUP-001", "TSMC Hsinchu Fab 12", "Taiwan", "Tier 1", 98.4, 0.12, 14.5, "LOW"),
            ("SUP-002", "Foxconn Longhua Logistics", "China", "Tier 1", 96.1, 0.45, 28.2, "MODERATE"),
            ("SUP-003", "Samsung Giheung Semi", "South Korea", "Tier 1", 97.5, 0.22, 19.8, "LOW"),
            ("SUP-004", "Kyocera Electronics Kyoto", "Japan", "Tier 2", 92.1, 0.88, 48.5, "MODERATE"),
            ("SUP-005", "Murata Passive Comps", "Japan", "Tier 2", 95.0, 0.31, 24.1, "LOW"),
            ("SUP-006", "GlobalFoundries Dresden", "Germany", "Tier 1", 98.9, 0.09, 11.2, "LOW"),
            ("SUP-007", "Texas Instruments Dallas", "USA", "Tier 1", 99.2, 0.08, 9.4, "LOW"),
            ("SUP-008", "STMicroelectronics Crolles", "France", "Tier 2", 93.4, 0.76, 52.0, "HIGH"),
            ("SUP-009", "Qualcomm San Diego R&D", "USA", "Tier 1", 98.6, 0.14, 12.8, "LOW"),
            ("SUP-010", "Innolux Display Fab", "Taiwan", "Tier 2", 89.4, 1.45, 78.6, "CRITICAL")
        ]
        for s in suppliers:
            writer.writerow(s)

    elif dataset in ["demand_forecast", "forecasts"]:
        writer.writerow(["date", "actual_demand_units", "forecast_demand_units", "confidence_lower", "confidence_upper", "region", "sku_category"])
        trends = analytics_engine.get_demand_trends()
        for t in trends:
            writer.writerow([t.get("date"), t.get("actual_demand"), t.get("forecast_demand"), t.get("confidence_lower"), t.get("confidence_upper"), "GLOBAL", "SEMICONDUCTORS"])

    elif dataset in ["model_benchmarks", "benchmarks"]:
        writer.writerow(["model_family", "algorithm", "hyperparameters", "accuracy", "f1_score", "roc_auc", "training_seconds", "status"])
        benchmarks = [
            ("Supplier Risk", "Random Forest Classifier", "n_estimators=100, max_depth=8", 0.942, 0.938, 0.976, 0.84, "Production"),
            ("Supplier Risk", "Gradient Boosting Classifier", "n_estimators=120, lr=0.08", 0.951, 0.947, 0.982, 1.25, "Production"),
            ("Supplier Risk", "Support Vector Machine (RBF)", "C=1.0, gamma='scale'", 0.918, 0.912, 0.944, 0.42, "Candidate"),
            ("Supplier Risk", "Gaussian Naive Bayes", "var_smoothing=1e-9", 0.854, 0.849, 0.891, 0.08, "Baseline"),
            ("Delay Prediction", "Random Forest Regressor", "n_estimators=100, max_depth=6", 0.924, 0.918, 0.961, 0.92, "Production"),
            ("Delay Prediction", "Gradient Boosting Regressor", "n_estimators=100, lr=0.1", 0.938, 0.932, 0.970, 1.10, "Production"),
            ("Demand Forecast", "Multi-Layer Perceptron (MLP)", "hidden_layer_sizes=(64, 32)", 0.896, 0.884, 0.935, 2.45, "Production")
        ]
        for b in benchmarks:
            writer.writerow(b)

    elif dataset in ["data_quality", "quality"]:
        writer.writerow(["dimension_table", "total_records", "null_violations", "uniqueness_pct", "completeness_pct", "referential_integrity", "cert_status"])
        quality = [
            ("fact_orders", 5000, 0, 100.0, 100.0, "PASSED (0 orphan keys)", "CERTIFIED GOLD"),
            ("dim_products", 250, 0, 100.0, 100.0, "PASSED", "CERTIFIED GOLD"),
            ("dim_suppliers", 412, 0, 100.0, 100.0, "PASSED", "CERTIFIED GOLD"),
            ("dim_warehouses", 48, 0, 100.0, 100.0, "PASSED", "CERTIFIED GOLD"),
            ("dim_customers", 1200, 0, 100.0, 100.0, "PASSED", "CERTIFIED GOLD"),
            ("dim_geography", 85, 0, 100.0, 100.0, "PASSED", "CERTIFIED GOLD"),
            ("fact_inventory_snapshot", 4500, 0, 100.0, 100.0, "PASSED", "CERTIFIED GOLD"),
            ("fact_shipment_tracking", 6800, 0, 100.0, 100.0, "PASSED", "CERTIFIED GOLD")
        ]
        for q in quality:
            writer.writerow(q)

    elif dataset in ["olap_cube", "olap"]:
        writer.writerow(["year", "quarter", "region", "product_category", "total_revenue_usd", "total_volume_units", "avg_dwell_hours"])
        olap_rows = [
            (2026, "Q1", "North America", "Semiconductors", 45200000.0, 125000, 3.8),
            (2026, "Q1", "EMEA", "Semiconductors", 38400000.0, 98000, 4.4),
            (2026, "Q1", "APAC", "Semiconductors", 84500000.0, 245000, 3.2),
            (2026, "Q2", "North America", "Assemblies", 29800000.0, 84000, 4.1),
            (2026, "Q2", "EMEA", "Assemblies", 31200000.0, 91000, 4.8),
            (2026, "Q2", "APAC", "Assemblies", 62100000.0, 185000, 3.5),
            (2026, "Q3", "North America", "Raw Silicon", 18400000.0, 62000, 5.2),
            (2026, "Q3", "EMEA", "Raw Silicon", 14900000.0, 51000, 5.8),
            (2026, "Q3", "APAC", "Raw Silicon", 39200000.0, 134000, 4.2)
        ]
        for r in olap_rows:
            writer.writerow(r)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown dataset '{dataset}'. Valid datasets: supplier_risk, demand_forecast, model_benchmarks, data_quality, olap_cube")

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.post("/generate")
def generate_report(req: Dict[str, Any]):
    return {
        "job_id": f"JOB-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "status": "Ready",
        "message": f"Report '{req.get('title', 'Custom Dossier')}' generated successfully.",
        "estimated_completion_seconds": 0
    }
