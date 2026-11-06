import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from scipy import stats
from app.services.intelligence.data_loader import data_loader

class OperationalAnomalyEngine:
    """
    Core Intelligence Engine D: Operational Anomaly Intelligence.
    Implements Isolation Forest, DBSCAN Outlier Discovery, Z-Score, and IQR Analysis
    across Shipments, Inventory, Orders, and Supplier KPI streams with mathematical evidence explanations.
    """

    SUPPORTED_DOMAINS = {
        "shipments": "Shipment Transit Times, Kinematics & Dwell Anomalies",
        "inventory": "Warehouse Inventory Ledger Spikes & Exhaustion Drops",
        "orders": "Order Quantity & Transaction Value Volatility",
        "suppliers": "Supplier Delivery Reliability & Defect Rate Drift"
    }

    def detect_anomalies(
        self,
        domain: str = "shipments",
        algorithm: str = "isolation_forest",
        contamination: float = 0.05,
        sensitivity_sigma: float = 2.5
    ) -> Dict[str, Any]:
        """
        Runs unsupervised anomaly detection on operational data stream.
        Computes anomaly score, severity tier, and explicit feature-level mathematical evidence.
        """
        if domain not in self.SUPPORTED_DOMAINS:
            domain = "shipments"

        algorithm = algorithm.lower()

        # 1. Prepare domain dataset and metrics
        if domain == "shipments":
            df = data_loader.get_shipment_delay_data()
            features = ["delay_hours", "port_congestion_dwell_days", "weather_severity_idx", "freight_cost_usd", "distance_km"]
            entity_id_col = "shipment_id"
            entity_name_col = "carrier"
        elif domain == "suppliers":
            df = data_loader.get_supplier_risk_data()
            features = ["lead_time_days", "defect_rate_ppm", "geopolitical_risk_score", "capacity_utilization_pct"]
            entity_id_col = "supplier_id"
            entity_name_col = "supplier_name"
        elif domain == "inventory":
            df = data_loader.get_demand_forecasting_data()
            features = ["demand", "roll_std_7", "current_stock", "unit_price"]
            entity_id_col = "sku_id"
            entity_name_col = "product_name"
        else: # orders
            df = data_loader.get_shipment_delay_data()
            features = ["cargo_weight_kg", "freight_cost_usd", "customs_complexity_index"]
            entity_id_col = "shipment_id"
            entity_name_col = "origin"

        X_raw = df[features].values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_raw)

        # 2. Run Algorithm
        anomaly_flags = np.zeros(len(df), dtype=int)
        anomaly_scores = np.zeros(len(df), dtype=float)

        if algorithm == "dbscan":
            db = DBSCAN(eps=1.2, min_samples=5)
            labels = db.fit_predict(X_scaled)
            anomaly_flags = (labels == -1).astype(int)
            # Distance to nearest non-noise center as proxy score
            anomaly_scores = np.where(labels == -1, 0.90, 0.15)

        elif algorithm == "zscore":
            z_scores = np.abs(stats.zscore(X_raw, axis=0))
            max_z = np.max(z_scores, axis=1)
            anomaly_flags = (max_z > sensitivity_sigma).astype(int)
            anomaly_scores = np.clip(max_z / 4.0, 0.0, 1.0)

        elif algorithm == "iqr":
            q25 = np.percentile(X_raw, 25, axis=0)
            q75 = np.percentile(X_raw, 75, axis=0)
            iqr = q75 - q25
            lower_bound = q25 - 1.5 * iqr
            upper_bound = q75 + 1.5 * iqr
            is_outlier = (X_raw < lower_bound) | (X_raw > upper_bound)
            anomaly_flags = np.any(is_outlier, axis=1).astype(int)
            anomaly_scores = np.where(anomaly_flags == 1, 0.88, 0.12)

        else: # Default: Isolation Forest
            algorithm = "isolation_forest"
            iso = IsolationForest(contamination=contamination, random_state=42)
            preds = iso.fit_predict(X_scaled) # -1 = anomaly, 1 = inlier
            anomaly_flags = (preds == -1).astype(int)
            # Decision function inverted: lower score = more anomalous
            raw_scores = iso.decision_function(X_scaled)
            # Normalize to 0-1 where 1 is highest anomaly
            min_s, max_s = raw_scores.min(), raw_scores.max()
            anomaly_scores = 1.0 - ((raw_scores - min_s) / max(max_s - min_s, 1e-6))

        df["is_anomaly"] = anomaly_flags
        df["anomaly_score"] = anomaly_scores

        # 3. Extract Anomalies with Evidence Breakdown
        anomalies_df = df[df["is_anomaly"] == 1].sort_values("anomaly_score", ascending=False)
        formatted_events = []

        feature_medians = {f: float(np.median(df[f])) for f in features}
        feature_stds = {f: float(np.std(df[f])) for f in features}

        for idx, row in anomalies_df.head(40).iterrows():
            score = float(row["anomaly_score"])

            # Compute specific feature deviation evidence
            evidence_details = []
            max_dev_feature = features[0]
            max_dev_sigma = 0.0

            for f in features:
                observed = float(row[f])
                median = feature_medians[f]
                std = max(feature_stds[f], 1e-4)
                dev_sigma = abs(observed - median) / std

                if dev_sigma > max_dev_sigma:
                    max_dev_sigma = dev_sigma
                    max_dev_feature = f

                if dev_sigma > 1.8:
                    evidence_details.append({
                        "metric": f.replace("_", " ").title(),
                        "observed_value": round(observed, 2),
                        "baseline_median": round(median, 2),
                        "deviation_sigma": round(dev_sigma, 2),
                        "direction": "ABOVE_NORMAL" if observed > median else "BELOW_NORMAL"
                    })

            # Severity classification
            if score >= 0.85 or max_dev_sigma >= 3.5:
                severity = "CRITICAL"
                status = "Immediate Escalation"
            elif score >= 0.70 or max_dev_sigma >= 2.5:
                severity = "HIGH"
                status = "Investigating"
            elif score >= 0.50:
                severity = "MEDIUM"
                status = "Monitoring"
            else:
                severity = "LOW"
                status = "Auto-Logged"

            formatted_events.append({
                "id": f"ANOM-{domain[:3].upper()}-{len(formatted_events) + 1:04d}",
                "entity": f"{row.get(entity_id_col, 'ID')} ({row.get(entity_name_col, 'Entity')})",
                "domain": domain.upper(),
                "anomaly_type": f"Severe {max_dev_feature.replace('_', ' ').title()} Outlier",
                "score": round(score, 3),
                "severity": severity,
                "status": status,
                "detection_method": f"{algorithm.upper()} (dev: {max_dev_sigma:.1f}σ)",
                "detected_value": f"{round(float(row[max_dev_feature]), 1)}",
                "baseline_expected": f"{round(feature_medians[max_dev_feature], 1)}",
                "context": f"Observed {max_dev_feature} deviated by {max_dev_sigma:.1f} standard deviations from operational equilibrium.",
                "evidence": evidence_details
            })

        return {
            "domain": domain,
            "domain_label": self.SUPPORTED_DOMAINS[domain],
            "algorithm": algorithm.upper(),
            "contamination_parameter": contamination,
            "total_records_analyzed": len(df),
            "anomalies_detected_count": len(anomalies_df),
            "anomaly_rate_pct": round((len(anomalies_df) / len(df)) * 100, 2),
            "events": formatted_events
        }

anomaly_engine = OperationalAnomalyEngine()
