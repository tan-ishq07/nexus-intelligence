from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# System Health
class HealthCheck(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0-ENTERPRISE"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    database: str = "connected"
    duckdb_engine: str = "online"
    active_workers: int = 4
    uptime_seconds: float = 3421.5

# Metric Cards & High-Level KPIs
class CommandCenterMetrics(BaseModel):
    total_shipments: int = 14850
    active_suppliers: int = 412
    global_warehouses: int = 48
    inventory_value_usd: float = 248900000.0
    on_time_delivery_pct: float = 94.6
    avg_shipment_delay_hours: float = 4.2
    high_risk_suppliers_count: int = 19
    predicted_stockouts_count: int = 7
    total_in_transit_value_usd: float = 84200000.0
    carbon_intensity_index: float = 62.4
    resilience_score: float = 88.2

class TrendPoint(BaseModel):
    date: str
    actual_demand: float
    forecast_demand: float
    confidence_lower: float
    confidence_upper: float

class RegionalPerformance(BaseModel):
    region: str
    on_time_pct: float
    active_shipments: int
    risk_level: str
    avg_delay_hours: float

class SupplierRiskItem(BaseModel):
    category: str
    count: int
    percentage: float
    color: str

class OperationalAlertDTO(BaseModel):
    id: int
    alert_code: str
    title: str
    summary: str
    severity: str # Critical, High, Medium, Low
    category: str
    entity_type: str
    entity_id: str
    detected_at: str
    status: str
    recommended_action: Optional[str] = None
    impact_usd: float

class RecommendationDTO(BaseModel):
    id: str
    title: str
    category: str
    priority: str
    estimated_savings_usd: float
    mitigation_window_hours: int
    rationale: str
    action_type: str

class GeoNode(BaseModel):
    id: str
    name: str
    type: str # Supplier, Warehouse, Port, Distribution Hub
    country: str
    city: str
    lat: float
    lng: float
    status: str
    risk_score: float
    tier: Optional[str] = None
    capacity_pct: Optional[float] = None

class GeoRoute(BaseModel):
    id: str
    origin_name: str
    dest_name: str
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    carrier: str
    mode: str # Maritime, Air, Ground, Rail
    status: str # In Transit, Delayed, High Risk
    active_shipments: int
    total_value_usd: float
    chokepoint_exposure: Optional[str] = None

class ScenarioSimulationRequest(BaseModel):
    scenario_id: str = "suez_chokepoint_block"
    severity_multiplier: float = 1.5
    duration_days: int = 14
    reroute_via_cape_good_hope: bool = True
    buffer_inventory_drawdown_pct: float = 25.0

class ScenarioSimulationResponse(BaseModel):
    scenario_name: str
    scenario_id: str = "suez_chokepoint_block"
    projected_additional_cost_usd: float
    mean_delay_increase_days: float
    affected_routes_count: int
    stockout_risk_skus_count: int
    recommended_playbook: str
    impact_timeline: List[Dict[str, Any]]
    baseline_cost_usd: float = 2450000.0
    simulated_cost_usd: float = 5600000.0
    baseline_delay_hours: float = 4.2
    simulated_delay_hours: float = 28.5
    baseline_otd_pct: float = 94.6
    simulated_otd_pct: float = 68.2
    comparison_metrics: List[Dict[str, Any]] = []
    affected_entities: List[Dict[str, Any]] = []
