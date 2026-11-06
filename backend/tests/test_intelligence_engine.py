import os
from fastapi.testclient import TestClient
from app.main import app
from app.services.intelligence.pattern_engine import pattern_engine
from app.services.intelligence.clustering_engine import clustering_engine
from app.services.intelligence.supplier_engine import supplier_engine
from app.services.intelligence.demand_engine import predictive_engine
from app.services.intelligence.anomaly_engine import anomaly_engine
from app.services.intelligence.kdd_pipeline import kdd_runner
from app.services.intelligence.discovery_service import discovery_service

client = TestClient(app)

def test_association_rule_mining_fpgrowth_and_apriori():
    """Validates FP-Growth and Apriori on warehouse transactional itemsets."""
    res_fp = pattern_engine.mine_association_rules(
        dataset_name="product_purchasing",
        algorithm="fpgrowth",
        min_support=0.04,
        min_confidence=0.30
    )
    assert res_fp["rules_count"] > 0
    assert res_fp["frequent_itemsets_count"] > 0
    assert "network_graph" in res_fp
    assert len(res_fp["network_graph"]["nodes"]) > 0

    # Test rule metrics
    first_rule = res_fp["rules"][0]
    assert first_rule["support"] >= 0.04
    assert first_rule["confidence"] >= 0.30
    assert first_rule["lift"] >= 1.0
    assert "conviction" in first_rule

    # Parity with Apriori
    res_ap = pattern_engine.mine_association_rules(
        dataset_name="product_purchasing",
        algorithm="apriori",
        min_support=0.04,
        min_confidence=0.30
    )
    assert res_ap["frequent_itemsets_count"] == res_fp["frequent_itemsets_count"]

def test_clustering_engine_kmeans_and_pca():
    """Validates K-Means clustering, PCA 2D coordinates, and Silhouette score."""
    res = clustering_engine.run_clustering(target="suppliers", algorithm="kmeans", n_clusters=4)
    assert res["clusters_count"] == 4
    assert res["total_entities"] > 0
    assert len(res["scatter_points"]) > 0
    assert len(res["cluster_profiles"]) == 4
    assert isinstance(res["silhouette_score"], float)

    # Validate point coordinate structure
    pt = res["scatter_points"][0]
    assert "x" in pt and "y" in pt
    assert "cluster" in pt

def test_supplier_risk_benchmarks_and_persistence():
    """Validates 5-classifier benchmark suite and model artifact persistence."""
    bench = supplier_engine.train_and_benchmark_models()
    assert bench["feature_count"] == 10
    assert len(bench["benchmarks"]) == 5

    # Check metrics are within valid ranges [0, 100]
    for b in bench["benchmarks"]:
        assert 50.0 <= b["accuracy"] <= 100.0
        assert 0.0 <= b["roc_auc"] <= 1.0
        assert "confusion_matrix" in b

    # Check persistence
    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "models", "saved_models")
    assert os.path.exists(os.path.join(model_dir, "supplier_gradientboosting_v1.joblib"))

def test_delay_prediction_and_shap_explainability():
    """Validates shipment delay forecasting and SHAP feature attribution."""
    pred = predictive_engine.predict_shipment_delay({
        "distance_km": 11000.0,
        "planned_transit_days": 24.0,
        "freight_cost_usd": 5400.0,
        "cargo_weight_kg": 15000.0,
        "weather_severity_idx": 88.0,
        "port_congestion_dwell_days": 6.2,
        "chokepoint_geopolitical_risk": 82.0,
        "carrier_reliability_score": 75.0,
        "customs_complexity_index": 4,
        "intermodal_transfers": 2,
        "is_peak_season": 1
    })
    assert 0.0 <= pred["delay_probability_pct"] <= 100.0
    assert pred["predicted_delay_hours"] >= 0.0
    assert len(pred["shap_attribution"]) > 0
    assert "Port" in pred["primary_driver"] or "Weather" in pred["primary_driver"] or "Chokepoint" in pred["primary_driver"]

def test_sku_stockout_horizon_prediction():
    """Validates demand forecasting, runout horizons, and stockout probability."""
    horizons = predictive_engine.predict_sku_stockout_horizons()
    assert len(horizons) > 0
    for h in horizons:
        assert h["runout_horizon_days"] > 0
        assert 0.0 <= h["stockout_probability_pct"] <= 100.0
        assert h["recommended_reorder_qty"] > 0

def test_operational_anomaly_detection_with_evidence():
    """Validates Isolation Forest outlier discovery and mathematical evidence."""
    anoms = anomaly_engine.detect_anomalies(domain="shipments", algorithm="isolation_forest", contamination=0.05)
    assert anoms["anomalies_detected_count"] > 0
    first_anom = anoms["events"][0]
    assert first_anom["severity"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    assert "evidence" in first_anom
    assert len(first_anom["evidence"]) > 0
    assert first_anom["evidence"][0]["deviation_sigma"] > 0

def test_kdd_7_stage_pipeline_runner():
    """Validates complete 7-stage KDD execution and timing benchmarks."""
    kdd = kdd_runner.execute_kdd_pipeline(
        pipeline_name="Automated-Test-KDD",
        target_dataset="product_purchasing",
        mining_task="Association_FPGrowth"
    )
    assert kdd["status"] == "COMPLETED"
    assert len(kdd["stages"]) == 7
    for s in kdd["stages"]:
        assert s["status"] == "SUCCESS"
        assert s["duration_ms"] >= 0.0

def test_automated_discovery_insights_lifecycle():
    """Validates discovery scan, database insertion, and lifecycle transitions."""
    scan_res = discovery_service.scan_and_generate_insights()
    assert scan_res["status"] == "SUCCESS"

    insights = discovery_service.get_insights()
    assert len(insights) > 0

    first_id = insights[0]["id"]
    # Transition: NEW -> UNDER_REVIEW
    update_res = discovery_service.update_lifecycle_state(first_id, "UNDER_REVIEW")
    assert update_res["status"] == "SUCCESS"
    assert update_res["current_state"] == "UNDER_REVIEW"

    # Transition: UNDER_REVIEW -> ACKNOWLEDGED
    update_res2 = discovery_service.update_lifecycle_state(first_id, "ACKNOWLEDGED")
    assert update_res2["current_state"] == "ACKNOWLEDGED"

def test_api_endpoints_via_testclient():
    """Validates HTTP endpoints directly against FastAPI TestClient."""
    # 1. Association rules mine
    resp1 = client.post("/api/v1/association-rules/mine", json={
        "dataset_name": "product_purchasing",
        "algorithm": "fpgrowth",
        "min_support": 0.05,
        "min_confidence": 0.30
    })
    assert resp1.status_code == 200
    assert resp1.json()["rules_count"] >= 0

    # 2. Clustering run
    resp2 = client.post("/api/v1/mining/clustering/run", json={
        "target": "suppliers",
        "algorithm": "kmeans",
        "n_clusters": 4
    })
    assert resp2.status_code == 200
    assert resp2.json()["clusters_count"] == 4

    # 3. Predictive delay
    resp3 = client.post("/api/v1/predictive/predict/shipment-delay", json={
        "distance_km": 8000.0,
        "weather_severity_idx": 65.0,
        "port_congestion_dwell_days": 4.0
    })
    assert resp3.status_code == 200
    assert "delay_probability_pct" in resp3.json()

    # 4. Supplier risk benchmarks
    resp4 = client.get("/api/v1/supplier-risk/benchmarks")
    assert resp4.status_code == 200
    assert len(resp4.json()["benchmarks"]) == 5

    # 5. Anomalies detect
    resp5 = client.post("/api/v1/anomalies/detect", json={
        "domain": "shipments",
        "algorithm": "isolation_forest",
        "contamination": 0.05
    })
    assert resp5.status_code == 200
    assert resp5.json()["anomalies_detected_count"] > 0

    # 6. Discovered insights
    resp6 = client.get("/api/v1/decisions/insights")
    assert resp6.status_code == 200
    assert len(resp6.json()) > 0

if __name__ == "__main__":
    tests = [
        test_association_rule_mining_fpgrowth_and_apriori,
        test_clustering_engine_kmeans_and_pca,
        test_supplier_risk_benchmarks_and_persistence,
        test_delay_prediction_and_shap_explainability,
        test_sku_stockout_horizon_prediction,
        test_operational_anomaly_detection_with_evidence,
        test_kdd_7_stage_pipeline_runner,
        test_automated_discovery_insights_lifecycle,
        test_api_endpoints_via_testclient
    ]
    passed = 0
    print("\n=======================================================")
    print("NEXUS INTELLIGENCE ENGINE & API VERIFICATION SUITE")
    print("=======================================================")
    for t in tests:
        print(f"\n-> Executing: {t.__name__}...")
        t()
        passed += 1
        print(f"   ✓ [PASSED] {t.__name__}")
    print(f"\n=======================================================")
    print(f"RESULT: ALL {passed}/{len(tests)} TESTS PASSED (100% SUCCESS)")
    print("=======================================================\n")
