export interface SystemHealth {
  status: string;
  version: string;
  timestamp: string;
  database: string;
  duckdb_engine: string;
  active_workers: number;
  uptime_seconds: number;
}

export interface CommandCenterMetrics {
  total_shipments: number;
  active_suppliers: number;
  global_warehouses: number;
  inventory_value_usd: number;
  on_time_delivery_pct: number;
  avg_shipment_delay_hours: number;
  high_risk_suppliers_count: number;
  predicted_stockouts_count: number;
  total_in_transit_value_usd: number;
  carbon_intensity_index: number;
  resilience_score: number;
}

export interface TrendPoint {
  date: string;
  actual_demand: number;
  forecast_demand: number;
  confidence_lower: number;
  confidence_upper: number;
}

export interface RegionalPerformance {
  region: string;
  on_time_pct: number;
  active_shipments: number;
  risk_level: string;
  avg_delay_hours: number;
}

export interface SupplierRiskDistribution {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface OperationalAlert {
  id: number;
  alert_code: string;
  title: string;
  summary: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  category: string;
  entity_type: string;
  entity_id: string;
  detected_at: string;
  status: string;
  recommended_action?: string;
  impact_usd: number;
}

export interface Recommendation {
  id: string;
  title: string;
  category: string;
  priority: string;
  estimated_savings_usd: number;
  mitigation_window_hours: number;
  rationale: string;
  action_type: string;
}

export interface GeoNode {
  id: string;
  name: string;
  type: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  status: string;
  risk_score: number;
  riskScore?: number;
  tier?: string;
  capacity_pct?: number;
}

export interface GeoRoute {
  id: string;
  origin_name: string;
  dest_name: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  carrier: string;
  mode: string;
  status: string;
  active_shipments: number;
  total_value_usd: number;
  chokepoint_exposure?: string;
  originPort?: string;
  destPort?: string;
  origin?: [number, number];
  destination?: [number, number];
  risk?: string;
}

export interface ScenarioResult {
  scenario_name: string;
  scenario_id?: string;
  projected_additional_cost_usd: number;
  mean_delay_increase_days: number;
  affected_routes_count: number;
  stockout_risk_skus_count: number;
  recommended_playbook: string;
  impact_timeline: Array<{
    day: string;
    cumulative_cost_impact_usd: number;
    unmet_demand_units: number;
    at_risk_tier1_shipments: number;
  }>;
  baseline_cost_usd?: number;
  simulated_cost_usd?: number;
  baseline_delay_hours?: number;
  simulated_delay_hours?: number;
  baseline_otd_pct?: number;
  simulated_otd_pct?: number;
  comparison_metrics?: Array<{
    metric: string;
    baseline: number;
    simulated: number;
    delta: string;
  }>;
  affected_entities?: Array<{
    entity: string;
    impact: string;
    risk: string;
  }>;
}

// ==========================================
// DATA ENGINEERING & WAREHOUSE TYPES
// ==========================================

export interface WarehouseTableMeta {
  table_name: string;
  type: string; // Fact Table, Dimension, Dimension (SCD Type 2)
  row_count: number;
  surrogate_key: string;
  natural_key: string;
  grain?: string;
  foreign_keys?: string[];
  measures?: string[];
  attributes?: string[];
}

export interface PipelineInfo {
  pipeline_id: string;
  name: string;
  source: string;
  target: string;
  records_per_minute: number;
  latency_ms: number;
  data_quality_score: number;
  status: string;
  last_sync: string;
  schema_drift_detected: boolean;
}

export interface DataQualityReport {
  table_name: string;
  total_records: number;
  completeness_score: number;
  missing_pct: number;
  uniqueness_score: number;
  duplicate_pct: number;
  validity_score: number;
  consistency_score: number;
  referential_integrity_score: number;
  overall_health_score: number;
  data_freshness: string;
  detected_issues: Array<{
    column: string;
    type: string;
    message: string;
    severity: string;
  }>;
  status: string;
}

export interface DatasetMetadata {
  dataset_name: string;
  file_name: string;
  layer: string;
  records: number;
  format: string;
  origin: string;
  license: string;
  integration_target: string;
}

export interface LineageGraph {
  nodes: Array<{
    id: string;
    label: string;
    layer: string;
    type: string;
    format: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    operation: string;
  }>;
  layers: string[];
}

export interface OLAPCubeMeta {
  cube_name: string;
  title: string;
  dimensions: string[];
  measures: string[];
  engine: string;
}

export interface OLAPQueryResult {
  query_sql: string;
  execution_time_ms: number;
  row_count: number;
  dimensions: string[];
  data: Array<Record<string, any>>;
}
