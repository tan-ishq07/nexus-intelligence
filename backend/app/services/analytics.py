import duckdb
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime, timedelta

class AnalyticsEngine:
    def __init__(self):
        self.con = duckdb.connect(database=':memory:')
        self._init_mock_duckdb_views()

    def _init_mock_duckdb_views(self):
        # Create virtual telemetry tables for instantaneous OLAP query acceleration
        dates = pd.date_range(end=datetime.today(), periods=30, freq='D')
        df_demand = pd.DataFrame({
            "record_date": dates,
            "actual_demand": [12000 + int(i * 150 + (i%5)*300) for i in range(30)],
            "forecast_demand": [11800 + int(i * 160) for i in range(30)],
            "region": ["North America" if i%3==0 else "EMEA" if i%3==1 else "APAC" for i in range(30)],
            "category": ["Semiconductors" if i%2==0 else "Advanced Assemblies" for i in range(30)]
        })
        self.con.register("demand_telemetry", df_demand)

    def get_demand_trends(self) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                strftime(record_date, '%b %d') as date,
                AVG(actual_demand) as actual_demand,
                AVG(forecast_demand) as forecast_demand,
                AVG(forecast_demand) * 0.92 as confidence_lower,
                AVG(forecast_demand) * 1.08 as confidence_upper
            FROM demand_telemetry
            GROUP BY record_date
            ORDER BY record_date ASC
            LIMIT 14
        """
        result = self.con.execute(query).df()
        return result.to_dict(orient="records")

    def simulate_what_if(
        self,
        scenario_id: str,
        severity_multiplier: float = 1.5,
        duration_days: int = 14,
        reroute_cape: bool = True,
        buffer_drawdown_pct: float = 25.0
    ) -> Dict[str, Any]:
        scenarios_meta = {
            "supplier_failure": {
                "name": "Strategic Tier-1 Supplier Failure / Insolvency Cascade",
                "base_cost": 2100000.0,
                "base_delay_days": 16.5,
                "routes": 18,
                "skus": 24,
                "playbook": "PLAYBOOK-SUP-FAILOVER: Trigger emergency dual-source allotment to qualified Tier-2 partners in Mexico and Vietnam (+18% premium, eliminates line stoppage).",
                "affected": [
                    {"entity": "TSMC Fab 14 (Hsinchu)", "impact": "Production Halted", "risk": "Critical"},
                    {"entity": "Innolux Display Sub-Assembly", "impact": "Secondary Starvation", "risk": "High"},
                    {"entity": "Murata Capacitor Feed", "impact": "Buffer Depletion", "risk": "Moderate"}
                ]
            },
            "warehouse_shutdown": {
                "name": "Central Distribution Hub Catastrophic Shutdown (Rotterdam / Chicago)",
                "base_cost": 1850000.0,
                "base_delay_days": 8.0,
                "routes": 34,
                "skus": 42,
                "playbook": "PLAYBOOK-HUB-DIVERT: Dynamically route cross-dock shipments to Antwerp and Leipzig logistics hubs with 24/7 accelerated clearance.",
                "affected": [
                    {"entity": "Rotterdam Gateway DC", "impact": "Operations 0% Capacity", "risk": "Critical"},
                    {"entity": "Rhine Inland Barge Link", "impact": "Staged Dwell Time +96h", "risk": "High"},
                    {"entity": "Hamburg Secondary Buffer", "impact": "Capacity Surge to 94%", "risk": "Moderate"}
                ]
            },
            "demand_spike_30": {
                "name": "+30% Global Unforecasted Demand Surge / Black Swan Peak",
                "base_cost": 1320000.0,
                "base_delay_days": 5.5,
                "routes": 22,
                "skus": 19,
                "playbook": "PLAYBOOK-DEMAND-DYNAMIC: Deploy dynamic safety stock reallocation, engage high-speed air charter for high-margin SKUs, and throttle non-contract spot orders.",
                "affected": [
                    {"entity": "North America Retail Hub", "impact": "Stockout Rate Projected 18%", "risk": "High"},
                    {"entity": "EMEA Fulfillment Mesh", "impact": "Order Backlog Spike +35%", "risk": "Moderate"},
                    {"entity": "APAC Fab Pipeline", "impact": "Overtime Capacity 100%", "risk": "Low"}
                ]
            },
            "transport_cost_surge": {
                "name": "Global Maritime Bunker Fuel & Spot Container Rate Surge (+140%)",
                "base_cost": 2850000.0,
                "base_delay_days": 3.2,
                "routes": 48,
                "skus": 12,
                "playbook": "PLAYBOOK-LOGISTICS-HEDGE: Lock index-linked contract tiers, consolidate partial-container loads (LCL to FCL), and shift coastal freight to intermodal rail.",
                "affected": [
                    {"entity": "Trans-Pacific Ocean Lanes", "impact": "TEU Rate +165%", "risk": "High"},
                    {"entity": "Asia-Europe Maritime Route", "impact": "Bunker Surcharge +80%", "risk": "High"},
                    {"entity": "US Inland Rail Spine", "impact": "Fuel Adjustment Factor +12%", "risk": "Moderate"}
                ]
            },
            "delay_surge": {
                "name": "Global Multi-Port Congestion & Intermodal Terminal Dwell Surge",
                "base_cost": 1650000.0,
                "base_delay_days": 13.8,
                "routes": 36,
                "skus": 28,
                "playbook": "PLAYBOOK-CONGESTION-BYPASS: Divert container calls to secondary un-congested berths (Tacoma / Oakland) and initiate pre-cleared inland drayage convoys.",
                "affected": [
                    {"entity": "Port of Long Beach", "impact": "Anchor Dwell 9.2 Days", "risk": "Critical"},
                    {"entity": "Port of Ningbo-Zhoushan", "impact": "Quay Berth Delay 5.4 Days", "risk": "High"},
                    {"entity": "Chicago BNSF Intermodal Railhead", "impact": "Container Chassis Deficit", "risk": "Moderate"}
                ]
            },
            "suez_chokepoint_block": {
                "name": "Red Sea / Suez Maritime Interruption & Bab el-Mandeb Closure",
                "base_cost": 2450000.0,
                "base_delay_days": 12.4,
                "routes": 28,
                "skus": 16,
                "playbook": "PLAYBOOK-ALPHA-CAPE: Reallocate high-value electronics to Frankfurt Air Bridge; circumnavigate bulk maritime consignments via Cape of Good Hope (+11.8 days).",
                "affected": [
                    {"entity": "Suez Canal Transit Corridor", "impact": "Transit 100% Blocked", "risk": "Critical"},
                    {"entity": "Bab el-Mandeb Narrows", "impact": "Active Threat Zone", "risk": "Critical"},
                    {"entity": "Cape of Good Hope Routing", "impact": "Transit Time +12.4 Days, Fuel +$380k/vessel", "risk": "High"}
                ]
            }
        }

        cfg = scenarios_meta.get(scenario_id, scenarios_meta["suez_chokepoint_block"])

        # Stochastic scaling based on severity multiplier and duration
        cost_scale = severity_multiplier * (duration_days / 14.0)
        mitigation_discount = 0.82 if reroute_cape else 1.0
        additional_cost = round(cfg["base_cost"] * cost_scale * mitigation_discount, 2)
        mean_delay = round(cfg["base_delay_days"] * severity_multiplier * (0.85 if reroute_cape else 1.25), 1)

        # Baseline vs Simulated
        baseline_cost = 2450000.0
        simulated_cost = round(baseline_cost + additional_cost, 2)
        baseline_delay_hrs = 4.2
        simulated_delay_hrs = round(baseline_delay_hrs + (mean_delay * 24.0), 1)
        baseline_otd = 94.6
        simulated_otd = max(38.0, round(baseline_otd - (severity_multiplier * 11.5) + (buffer_drawdown_pct * 0.15), 1))

        # Day-by-day milestone timeline
        timeline = []
        step_days = max(1, duration_days // 5)
        for d in range(step_days, duration_days + 1, step_days):
            progress_ratio = d / float(duration_days)
            timeline.append({
                "day": f"Day {d}",
                "cumulative_cost_impact_usd": round(additional_cost * progress_ratio, 2),
                "unmet_demand_units": int(2200 * progress_ratio * severity_multiplier),
                "at_risk_tier1_shipments": int(10 + (d * 1.8 * severity_multiplier))
            })

        comparison_metrics = [
            {"metric": "Total Operational Cost ($M)", "baseline": round(baseline_cost / 1e6, 2), "simulated": round(simulated_cost / 1e6, 2), "delta": f"+${round(additional_cost/1e6, 2)}M"},
            {"metric": "Average Shipment Delay (hrs)", "baseline": baseline_delay_hrs, "simulated": simulated_delay_hrs, "delta": f"+{round(simulated_delay_hrs - baseline_delay_hrs, 1)} hrs"},
            {"metric": "On-Time Delivery SLA (%)", "baseline": baseline_otd, "simulated": simulated_otd, "delta": f"-{round(baseline_otd - simulated_otd, 1)}%"},
            {"metric": "Safety Stock Exhaustion (SKUs)", "baseline": 2, "simulated": int(cfg["skus"] * severity_multiplier * 0.7), "delta": f"+{int(cfg['skus'] * severity_multiplier * 0.7) - 2} SKUs"},
            {"metric": "Disrupted Logistics Corridors", "baseline": 0, "simulated": cfg["routes"], "delta": f"+{cfg['routes']} Lanes"}
        ]

        return {
            "scenario_name": cfg["name"],
            "scenario_id": scenario_id,
            "projected_additional_cost_usd": additional_cost,
            "mean_delay_increase_days": mean_delay,
            "affected_routes_count": cfg["routes"],
            "stockout_risk_skus_count": int(cfg["skus"] * severity_multiplier * 0.7),
            "recommended_playbook": cfg["playbook"],
            "impact_timeline": timeline,
            "baseline_cost_usd": baseline_cost,
            "simulated_cost_usd": simulated_cost,
            "baseline_delay_hours": baseline_delay_hrs,
            "simulated_delay_hours": simulated_delay_hrs,
            "baseline_otd_pct": baseline_otd,
            "simulated_otd_pct": simulated_otd,
            "comparison_metrics": comparison_metrics,
            "affected_entities": cfg["affected"]
        }

analytics_engine = AnalyticsEngine()
