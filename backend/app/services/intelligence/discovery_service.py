import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.intelligence_schema import DiscoveredInsight
from app.services.intelligence.pattern_engine import pattern_engine
from app.services.intelligence.anomaly_engine import anomaly_engine
from app.services.intelligence.supplier_engine import supplier_engine
from app.services.intelligence.demand_engine import predictive_engine
from app.services.intelligence.geospatial_engine import geospatial_engine

class AutomatedDiscoveryService:
    """
    Automated Knowledge Discovery Service (PROMPT 3 Requirement 8).
    Periodically or on-demand scans available analytical datasets to discover:
    - Newly emerging clusters
    - Strong association rules
    - Critical operational anomalies
    - Demand volatility and stockout risks
    - Supplier performance deterioration
    - Regional & chokepoint geopolitical risk concentrations
    Persists findings to `discovered_insights` with full lifecycle state management.
    """

    LIFECYCLE_STATES = ["NEW", "UNDER_REVIEW", "ACKNOWLEDGED", "RESOLVED"]

    def scan_and_generate_insights(self) -> Dict[str, Any]:
        """
        Executes a holistic intelligence scan across all 5 engines and records
        novel discoveries with mathematical evidence into the database.
        """
        db = SessionLocal()
        new_insights_count = 0

        try:
            # 1. Scan Association Rules for high-lift rules
            rules_res = pattern_engine.mine_association_rules(
                dataset_name="shipment_delays",
                algorithm="fpgrowth",
                min_support=0.04,
                min_confidence=0.60,
                min_lift=2.0
            )
            for rule in rules_res.get("rules", [])[:2]:
                ins_id = f"INS-RULE-{uuid.uuid4().hex[:6].upper()}"
                ants = ", ".join(rule["antecedents"])
                cons = ", ".join(rule["consequents"])
                title = f"Strong Disruption Multi-Factor Rule: {ants} -> {cons}"
                desc = (
                    f"Discovered significant operational dependency (Lift: {rule['lift']}x, Confidence: {rule['confidence']*100:.1f}%). "
                    f"When {ants} occurs, systemic cascading delays across {cons} surge significantly."
                )
                evidence = {
                    "support": rule["support"],
                    "confidence": rule["confidence"],
                    "lift": rule["lift"],
                    "conviction": rule["conviction"],
                    "algorithm": "FP-Growth",
                    "antecedents": rule["antecedents"],
                    "consequents": rule["consequents"]
                }
                action = f"Establish proactive buffer stock for {cons} and mandate rerouting when {ants} is triggered."
                
                db.add(DiscoveredInsight(
                    id=ins_id,
                    category="ASSOCIATION_RULE",
                    title=title,
                    description=desc,
                    severity="HIGH" if rule["lift"] > 3.0 else "MEDIUM",
                    lifecycle_state="NEW",
                    confidence_score=min(1.0, rule["confidence"]),
                    evidence_payload=json.dumps(evidence),
                    recommended_action=action
                ))
                new_insights_count += 1

            # 2. Scan Operational Anomalies
            anom_res = anomaly_engine.detect_anomalies(domain="shipments", algorithm="isolation_forest", contamination=0.06)
            for anom in anom_res.get("events", [])[:2]:
                ins_id = f"INS-ANOM-{uuid.uuid4().hex[:6].upper()}"
                title = f"{anom['severity']} Anomaly: {anom['entity']} ({anom['anomaly_type']})"
                desc = f"{anom['context']} Detection score: {anom['score']:.3f} via {anom['detection_method']}."
                evidence = {
                    "detected_value": anom["detected_value"],
                    "baseline_expected": anom["baseline_expected"],
                    "detection_method": anom["detection_method"],
                    "anomaly_score": anom["score"],
                    "evidence_breakdown": anom.get("evidence", [])
                }
                action = "Trigger automated carrier telemetry check and alert port logistics coordinator."

                db.add(DiscoveredInsight(
                    id=ins_id,
                    category="ANOMALY",
                    title=title,
                    description=desc,
                    severity=anom["severity"],
                    lifecycle_state="NEW",
                    confidence_score=anom["score"],
                    evidence_payload=json.dumps(evidence),
                    recommended_action=action
                ))
                new_insights_count += 1

            # 3. Scan Stockout Hazards from Predictive Demand
            stockouts = predictive_engine.predict_sku_stockout_horizons()
            critical_stockouts = [s for s in stockouts if s["risk_status"] == "CRITICAL_EXHAUSTION"]
            for s in critical_stockouts[:2]:
                ins_id = f"INS-DEM-{uuid.uuid4().hex[:6].upper()}"
                title = f"Imminent Stockout Risk: {s['product_name']} ({s['sku_id']})"
                desc = (
                    f"Forecasted daily demand of {s['daily_demand_forecast']} units exhausts current inventory ({s['current_stock_units']} units) "
                    f"in {s['runout_horizon_days']} days (Lead time: {s['lead_time_days']} days). Stockout probability: {s['stockout_probability_pct']}%."
                )
                evidence = {
                    "sku_id": s["sku_id"],
                    "current_stock": s["current_stock_units"],
                    "daily_forecast": s["daily_demand_forecast"],
                    "lead_time": s["lead_time_days"],
                    "runout_days": s["runout_horizon_days"],
                    "stockout_probability": s["stockout_probability_pct"],
                    "deficit": s["safety_stock_deficit"]
                }
                action = f"Issue emergency replenishment PO for {s['recommended_reorder_qty']} units and expedite via Air Freight."

                db.add(DiscoveredInsight(
                    id=ins_id,
                    category="DEMAND_SHIFT",
                    title=title,
                    description=desc,
                    severity="CRITICAL",
                    lifecycle_state="NEW",
                    confidence_score=s["stockout_probability_pct"] / 100.0,
                    evidence_payload=json.dumps(evidence),
                    recommended_action=action
                ))
                new_insights_count += 1

            # 4. Scan Supplier Performance Deterioration
            suppliers = supplier_engine.get_supplier_fleet_risks()
            critical_suppliers = [sup for sup in suppliers if sup["risk_tier"] == "CRITICAL"]
            for sup in critical_suppliers[:1]:
                ins_id = f"INS-SUP-{uuid.uuid4().hex[:6].upper()}"
                title = f"Supplier Disruption Warning: {sup['supplier_name']} ({sup['tier']})"
                desc = (
                    f"Delivery failure probability is {sup['ml_failure_probability_pct']}% based on Gradient Boosting classification. "
                    f"Reliability dropped to {sup['delivery_reliability_pct']}%, with geopolitical exposure score {sup['geopolitical_risk']}."
                )
                evidence = {
                    "supplier_id": sup["supplier_id"],
                    "ml_failure_probability_pct": sup["ml_failure_probability_pct"],
                    "delivery_reliability_pct": sup["delivery_reliability_pct"],
                    "geopolitical_risk": sup["geopolitical_risk"],
                    "single_source": sup["single_source"]
                }
                action = "Activate secondary dual-source supplier contract and shift 40% allocation."

                db.add(DiscoveredInsight(
                    id=ins_id,
                    category="SUPPLIER_RISK",
                    title=title,
                    description=desc,
                    severity="CRITICAL",
                    lifecycle_state="NEW",
                    confidence_score=sup["ml_failure_probability_pct"] / 100.0,
                    evidence_payload=json.dumps(evidence),
                    recommended_action=action
                ))
                new_insights_count += 1

            # 5. Scan Geospatial Chokepoints
            cps = geospatial_engine.get_chokepoints_status()
            avoid_cps = [cp for cp in cps if cp["status"] == "CRITICAL_AVOIDANCE"]
            for cp in avoid_cps:
                ins_id = f"INS-GEO-{uuid.uuid4().hex[:6].upper()}"
                title = f"Geospatial Chokepoint Reroute: {cp['name']}"
                desc = f"Threat Index: {cp['risk_index']}/100 ({cp['threat_type']}). {cp['vessels_diverted_pct']}% of global fleet diverted to {cp['reroute_alternative']}."
                evidence = {
                    "chokepoint": cp["name"],
                    "risk_index": cp["risk_index"],
                    "reroute_extra_days": cp["reroute_extra_days"],
                    "bunker_cost_delta_usd": cp["bunker_cost_delta_usd"]
                }
                action = f"Enact mandatory Cape of Good Hope reroute. Adjust customer ETAs by +{cp['reroute_extra_days']} days."

                db.add(DiscoveredInsight(
                    id=ins_id,
                    category="GEOSPATIAL",
                    title=title,
                    description=desc,
                    severity="HIGH",
                    lifecycle_state="NEW",
                    confidence_score=0.95,
                    evidence_payload=json.dumps(evidence),
                    recommended_action=action
                ))
                new_insights_count += 1

            db.commit()
            return {
                "status": "SUCCESS",
                "new_insights_generated": new_insights_count,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            db.rollback()
            return {"status": "ERROR", "message": str(e)}
        finally:
            db.close()

    def get_insights(
        self,
        lifecycle_state: Optional[str] = None,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        db = SessionLocal()
        try:
            # Check if table is empty; if so, run initial scan
            if db.query(DiscoveredInsight).count() == 0:
                self.scan_and_generate_insights()

            query = db.query(DiscoveredInsight)
            if lifecycle_state and lifecycle_state.upper() != "ALL":
                query = query.filter(DiscoveredInsight.lifecycle_state == lifecycle_state.upper())
            if category and category.upper() != "ALL":
                query = query.filter(DiscoveredInsight.category == category.upper())
            if severity and severity.upper() != "ALL":
                query = query.filter(DiscoveredInsight.severity == severity.upper())

            records = query.order_by(DiscoveredInsight.discovered_at.desc()).limit(limit).all()

            results = []
            for r in records:
                evidence = {}
                if r.evidence_payload:
                    try:
                        evidence = json.loads(r.evidence_payload)
                    except Exception:
                        evidence = {"raw": r.evidence_payload}

                results.append({
                    "id": r.id,
                    "category": r.category,
                    "title": r.title,
                    "description": r.description,
                    "severity": r.severity,
                    "lifecycle_state": r.lifecycle_state,
                    "confidence_score": round(float(r.confidence_score or 0.85), 3),
                    "evidence": evidence,
                    "recommended_action": r.recommended_action,
                    "discovered_at": r.discovered_at.isoformat() if r.discovered_at else None,
                    "reviewed_by": r.reviewed_by
                })
            return results
        finally:
            db.close()

    def update_lifecycle_state(
        self,
        insight_id: str,
        new_state: str,
        reviewed_by: str = "Enterprise Operator"
    ) -> Dict[str, Any]:
        if new_state.upper() not in self.LIFECYCLE_STATES:
            return {"status": "ERROR", "message": f"Invalid state. Must be one of {self.LIFECYCLE_STATES}"}

        db = SessionLocal()
        try:
            record = db.query(DiscoveredInsight).filter(DiscoveredInsight.id == insight_id).first()
            if not record:
                return {"status": "NOT_FOUND", "message": f"Insight {insight_id} not found"}

            old_state = record.lifecycle_state
            record.lifecycle_state = new_state.upper()
            record.reviewed_by = reviewed_by
            record.updated_at = datetime.utcnow()
            db.commit()

            return {
                "status": "SUCCESS",
                "insight_id": insight_id,
                "previous_state": old_state,
                "current_state": new_state.upper(),
                "reviewed_by": reviewed_by
            }
        except Exception as e:
            db.rollback()
            return {"status": "ERROR", "message": str(e)}
        finally:
            db.close()

discovery_service = AutomatedDiscoveryService()
