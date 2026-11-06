import numpy as np
from typing import Dict, Any, List

class GeospatialLogisticsEngine:
    """
    Core Intelligence Engine E: Geospatial Logistics Intelligence.
    Surveillance of global strategic chokepoints, oceanic weather corridors,
    and automated trade-off simulation for contingency rerouting.
    """

    CHOKEPOINTS = [
        {
            "id": "CP-SUEZ",
            "name": "Suez Canal & Bab el-Mandeb",
            "coordinates": {"lat": 27.8, "lng": 34.2},
            "status": "CRITICAL_AVOIDANCE",
            "threat_type": "Asymmetric Maritime Drone & Missile Threat",
            "risk_index": 94.2,
            "average_transit_time_normal_days": 0.8,
            "reroute_alternative": "Cape of Good Hope Circumnavigation",
            "reroute_extra_days": 12.4,
            "bunker_cost_delta_usd": 680000,
            "vessels_diverted_pct": 82.5,
            "daily_teu_capacity_affected": 240000
        },
        {
            "id": "CP-PANAMA",
            "name": "Panama Canal Locks",
            "coordinates": {"lat": 9.1, "lng": -79.7},
            "status": "CAPACITY_CONSTRAINED",
            "threat_type": "Freshwater Lake Gatun Drought Draft Restrictions",
            "risk_index": 68.5,
            "average_transit_time_normal_days": 1.1,
            "reroute_alternative": "US West Coast Land-Bridge (Rail Intermodal)",
            "reroute_extra_days": 4.5,
            "bunker_cost_delta_usd": 240000,
            "vessels_diverted_pct": 28.0,
            "daily_teu_capacity_affected": 95000
        },
        {
            "id": "CP-MALACCA",
            "name": "Strait of Malacca & Singapore",
            "coordinates": {"lat": 2.2, "lng": 102.1},
            "status": "HIGH_DENSITY_SURVEILLANCE",
            "threat_type": "Ultra-Dense Navigation & Shallow Draft Shoals",
            "risk_index": 42.0,
            "average_transit_time_normal_days": 1.4,
            "reroute_alternative": "Sunda Strait / Lombok Strait",
            "reroute_extra_days": 3.2,
            "bunker_cost_delta_usd": 150000,
            "vessels_diverted_pct": 8.5,
            "daily_teu_capacity_affected": 320000
        },
        {
            "id": "CP-HORMUZ",
            "name": "Strait of Hormuz",
            "coordinates": {"lat": 26.6, "lng": 56.2},
            "status": "ELEVATED_GEOPOLITICAL",
            "threat_type": "Naval Escort Protocol & War Risk Insurance Surcharge",
            "risk_index": 78.4,
            "average_transit_time_normal_days": 0.5,
            "reroute_alternative": "East-West Pipeline Overland Bypass",
            "reroute_extra_days": 2.1,
            "bunker_cost_delta_usd": 180000,
            "vessels_diverted_pct": 14.0,
            "daily_teu_capacity_affected": 180000
        }
    ]

    def get_chokepoints_status(self) -> List[Dict[str, Any]]:
        return self.CHOKEPOINTS

    def simulate_reroute(
        self,
        origin_port: str,
        destination_port: str,
        chokepoint_avoided: str = "CP-SUEZ",
        vessel_teu: int = 15000
    ) -> Dict[str, Any]:
        """
        Simulates mathematical impact of avoiding a chokepoint on transit duration,
        CO2 emissions, bunker fuel burn, and detention demurrage risk.
        """
        target_cp = next((cp for cp in self.CHOKEPOINTS if cp["id"] == chokepoint_avoided), self.CHOKEPOINTS[0])

        extra_days = target_cp["reroute_extra_days"]
        base_days = 22.0
        contingency_days = base_days + extra_days

        daily_bunker_burn_metric_tons = 120.0
        fuel_price_per_ton = 650.0 # VLSFO
        bunker_cost_delta = extra_days * daily_bunker_burn_metric_tons * fuel_price_per_ton

        co2_delta_tons = extra_days * daily_bunker_burn_metric_tons * 3.114 # IMO carbon factor

        return {
            "origin": origin_port,
            "destination": destination_port,
            "avoided_chokepoint": target_cp["name"],
            "recommended_contingency": target_cp["reroute_alternative"],
            "baseline_transit_days": base_days,
            "contingency_transit_days": round(contingency_days, 1),
            "transit_delay_delta_days": extra_days,
            "financial_fuel_delta_usd": int(bunker_cost_delta),
            "co2_emissions_delta_tons": int(co2_delta_tons),
            "insurance_war_risk_surcharge_saved_usd": 85000,
            "net_reroute_roi_recommendation": "EXECUTE_REROUTE" if target_cp["risk_index"] > 70 else "PROCEED_WITH_ESCORT"
        }

geospatial_engine = GeospatialLogisticsEngine()
