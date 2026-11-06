from fastapi import APIRouter
from app.schemas.entities import ScenarioSimulationRequest, ScenarioSimulationResponse
from app.services.analytics import analytics_engine

router = APIRouter()

@router.get("/catalog")
def get_scenario_catalog():
    return [
        {
            "id": "supplier_failure",
            "name": "Supplier Failure / Insolvency Cascade",
            "description": "Critical Tier-1 semiconductor or assembly fab sudden insolvency or force majeure shutdown.",
            "default_duration_days": 14,
            "typical_severity": 1.8
        },
        {
            "id": "warehouse_shutdown",
            "name": "Global Warehouse Hub Shutdown",
            "description": "Rotterdam or Chicago super-hub catastrophic outage with intermodal feeder starvation.",
            "default_duration_days": 10,
            "typical_severity": 1.6
        },
        {
            "id": "demand_spike_30",
            "name": "+30% Global Demand Spike Surge",
            "description": "Unforecasted retail spike and tier-1 SKU stockout acceleration stress test.",
            "default_duration_days": 21,
            "typical_severity": 1.4
        },
        {
            "id": "transport_cost_surge",
            "name": "Transportation & Fuel Cost Surge (+140%)",
            "description": "Maritime bunker fuel and spot air-cargo charter surge across major oceanic lanes.",
            "default_duration_days": 30,
            "typical_severity": 2.0
        },
        {
            "id": "delay_surge",
            "name": "Delivery Delay & Port Congestion Surge",
            "description": "Multi-berth dwell surge at Long Beach, Ningbo, and Hamburg terminals.",
            "default_duration_days": 14,
            "typical_severity": 1.5
        },
        {
            "id": "suez_chokepoint_block",
            "name": "Suez / Bab el-Mandeb Chokepoint Blockade",
            "description": "Circumnavigation of Africa via Cape of Good Hope with transit delay & fuel penalty.",
            "default_duration_days": 14,
            "typical_severity": 1.5
        }
    ]

@router.post("/simulate", response_model=ScenarioSimulationResponse)
def run_scenario_simulation(req: ScenarioSimulationRequest):
    result = analytics_engine.simulate_what_if(
        scenario_id=req.scenario_id,
        severity_multiplier=req.severity_multiplier,
        duration_days=req.duration_days,
        reroute_cape=req.reroute_via_cape_good_hope,
        buffer_drawdown_pct=req.buffer_inventory_drawdown_pct
    )
    return ScenarioSimulationResponse(**result)
