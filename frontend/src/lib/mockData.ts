import {
  CommandCenterMetrics,
  TrendPoint,
  RegionalPerformance,
  SupplierRiskDistribution,
  OperationalAlert,
  Recommendation,
  GeoNode,
  GeoRoute
} from "@/types";

export const initialMetrics: CommandCenterMetrics = {
  total_shipments: 14850,
  active_suppliers: 412,
  global_warehouses: 48,
  inventory_value_usd: 248900000.0,
  on_time_delivery_pct: 94.6,
  avg_shipment_delay_hours: 4.2,
  high_risk_suppliers_count: 19,
  predicted_stockouts_count: 7,
  total_in_transit_value_usd: 84200000.0,
  carbon_intensity_index: 62.4,
  resilience_score: 88.2,
};

export const initialTrends: TrendPoint[] = [
  { date: "Oct 24", actual_demand: 11400, forecast_demand: 11200, confidence_lower: 10500, confidence_upper: 11900 },
  { date: "Oct 26", actual_demand: 12100, forecast_demand: 11900, confidence_lower: 11100, confidence_upper: 12700 },
  { date: "Oct 28", actual_demand: 11800, forecast_demand: 12300, confidence_lower: 11400, confidence_upper: 13200 },
  { date: "Oct 30", actual_demand: 12900, forecast_demand: 12600, confidence_lower: 11800, confidence_upper: 13400 },
  { date: "Nov 01", actual_demand: 13400, forecast_demand: 13100, confidence_lower: 12200, confidence_upper: 14000 },
  { date: "Nov 03", actual_demand: 13950, forecast_demand: 13700, confidence_lower: 12800, confidence_upper: 14600 },
  { date: "Nov 05", actual_demand: 14600, forecast_demand: 14200, confidence_lower: 13200, confidence_upper: 15200 },
];

export const initialRegional: RegionalPerformance[] = [
  { region: "North America", on_time_pct: 96.4, active_shipments: 4120, risk_level: "Low", avg_delay_hours: 2.1 },
  { region: "EMEA", on_time_pct: 91.8, active_shipments: 3850, risk_level: "Medium", avg_delay_hours: 5.4 },
  { region: "APAC", on_time_pct: 95.2, active_shipments: 5410, risk_level: "Low", avg_delay_hours: 3.0 },
  { region: "LATAM", on_time_pct: 88.0, active_shipments: 1470, risk_level: "High", avg_delay_hours: 8.9 },
];

export const initialSupplierRisk: SupplierRiskDistribution[] = [
  { category: "Low Risk (0-30)", count: 284, percentage: 68.9, color: "#10B981" },
  { category: "Moderate Risk (31-60)", count: 88, percentage: 21.4, color: "#38BDF8" },
  { category: "Elevated Risk (61-80)", count: 26, percentage: 6.3, color: "#F59E0B" },
  { category: "Critical Risk (81-100)", count: 14, percentage: 3.4, color: "#F43F5E" },
];

export const initialAlerts: OperationalAlert[] = [
  {
    id: 1,
    alert_code: "ALT-2026-GEO-09",
    title: "Red Sea / Bab el-Mandeb Maritime Redirection Advisory",
    summary: "Heightened drone threat index requires all westbound container vessels to circumnavigate Cape of Good Hope (+12 days, $1.2M fuel impact).",
    severity: "Critical",
    category: "Geopolitical",
    entity_type: "Maritime Corridor",
    entity_id: "CORR-ASIA-EUROPE-01",
    detected_at: "18 mins ago",
    status: "Active",
    recommended_action: "Execute Pre-emptive Air Bridge contingency for SKU-3NM-SOC-990 batches and invoke Cape buffer safety stock protocols.",
    impact_usd: 2400000.0,
  },
  {
    id: 2,
    alert_code: "ALT-2026-MET-14",
    title: "Typhoon Malakas Trajectory: Luzon Strait Port Closures",
    summary: "Category 4 tropical cyclone closing Kaohsiung and Hong Kong marine terminals for 48 hours.",
    severity: "High",
    category: "Weather",
    entity_type: "Warehouse Hub",
    entity_id: "WH-SIN-02",
    detected_at: "45 mins ago",
    status: "Active",
    recommended_action: "Hold vessel NEX-SHP-90214 at outer anchorage or divert to Subic Bay deepwater berth.",
    impact_usd: 680000.0,
  },
  {
    id: 3,
    alert_code: "ALT-2026-SUP-22",
    title: "Valemount Rare Earth Extractor Export License Suspension",
    summary: "DR Congo Ministry of Mines audit has halted heavy rare-earth concentrate dispatches out of Kolwezi.",
    severity: "Critical",
    category: "Supplier Solvency",
    entity_type: "Supplier Site",
    entity_id: "SUP-VMNT-11",
    detected_at: "2 hours ago",
    status: "Active",
    recommended_action: "Activate secondary qualified supplier Lynas Rare Earths (Australia) under emergency dual-sourcing terms.",
    impact_usd: 4500000.0,
  },
  {
    id: 4,
    alert_code: "ALT-2026-LAB-03",
    title: "Hamburg Waterfront Union 72-Hour Warning Strike",
    summary: "Gantry crane operators announcing sudden 72-hour work stoppage affecting Waltershof and Burchardkai container berths.",
    severity: "Medium",
    category: "Labor Strike",
    entity_type: "Warehouse Hub",
    entity_id: "WH-HAM-04",
    detected_at: "4 hours ago",
    status: "Active",
    recommended_action: "Shift rail shuttle manifests to Wilhelmshaven JadeWeserPort deepwater facilities.",
    impact_usd: 320000.0,
  },
];

export const initialRecommendations: Recommendation[] = [
  {
    id: "REC-01",
    title: "Accelerate European Safety Stock Buffer via Antwerp",
    category: "Inventory Balancing",
    priority: "Critical",
    estimated_savings_usd: 1450000.0,
    mitigation_window_hours: 36,
    rationale: "Rotterdam container dwell times have reached 6.8 days. Diverting 18 TEUs prevents automotive manufacturing line stoppage.",
    action_type: "Autonomous Rebalance",
  },
  {
    id: "REC-02",
    title: "Lock Long-Term Air Freight Allocation: Taipei to Chicago",
    category: "Carrier Hedging",
    priority: "High",
    estimated_savings_usd: 820000.0,
    mitigation_window_hours: 72,
    rationale: "Forecasted spot air rates jumping +24% due to end-of-year hardware launch cargo rush.",
    action_type: "Contract Execution",
  },
  {
    id: "REC-03",
    title: "Pre-Qualify Secondary Photolithography Optics Source",
    category: "Supplier Resilience",
    priority: "Medium",
    estimated_savings_usd: 3400000.0,
    mitigation_window_hours: 120,
    rationale: "Single-source concentration on critical EUV optics exceeds target threshold (88/100).",
    action_type: "Dual Sourcing Workflow",
  },
];

export const initialNodes: GeoNode[] = [
  { id: "WH-RTM-01", name: "Rotterdam Europort Super-Hub", type: "Warehouse Hub", country: "Netherlands", city: "Rotterdam", lat: 51.9244, lng: 4.4777, status: "Optimal", risk_score: 20.0, capacity_pct: 84.5 },
  { id: "WH-SIN-02", name: "Singapore Tuas Logistics Gateway", type: "Warehouse Hub", country: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198, status: "Constrained", risk_score: 65.0, capacity_pct: 91.2 },
  { id: "WH-LGB-03", name: "Long Beach Port Complex Terminal", type: "Warehouse Hub", country: "United States", city: "Long Beach", lat: 33.7701, lng: -118.1937, status: "Optimal", risk_score: 18.0, capacity_pct: 79.8 },
  { id: "WH-DXB-05", name: "Dubai Jebel Ali Freezone Hub", type: "Warehouse Hub", country: "United Arab Emirates", city: "Dubai", lat: 24.9857, lng: 55.0273, status: "Optimal", risk_score: 22.0, capacity_pct: 73.4 },
  { id: "SUP-TSMC-01", name: "Taiwan Semiconductor Mfg Co", type: "Supplier Site", country: "Taiwan", city: "Hsinchu", lat: 24.7820, lng: 120.9980, status: "Active", risk_score: 38.5, tier: "Tier 1" },
  { id: "SUP-ASML-02", name: "ASML Lithography Systems", type: "Supplier Site", country: "Netherlands", city: "Veldhoven", lat: 51.4050, lng: 5.4080, status: "Active", risk_score: 14.2, tier: "Tier 1" },
  { id: "PORT-SUEZ", name: "Suez Canal Maritime Gateway", type: "Strategic Chokepoint", country: "Egypt", city: "Port Said", lat: 31.2653, lng: 32.3019, status: "Heightened Risk", risk_score: 84.0 },
  { id: "PORT-BAB-MANDEB", name: "Bab el-Mandeb Strategic Strait", type: "Strategic Chokepoint", country: "Djibouti", city: "Djibouti", lat: 12.5833, lng: 43.3333, status: "Critical Threat", risk_score: 92.0 },
];

export const initialRoutes: GeoRoute[] = [
  { id: "RT-01", origin_name: "Hsinchu Wafer Fab", dest_name: "Long Beach Gateway", origin_lat: 24.7820, origin_lng: 120.9980, dest_lat: 33.7701, dest_lng: -118.1937, carrier: "Ocean Network Express", mode: "Maritime", status: "In Transit", active_shipments: 14, total_value_usd: 12500000 },
  { id: "RT-02", origin_name: "Veldhoven Cleanrooms", dest_name: "Singapore Tuas Gateway", origin_lat: 51.4050, origin_lng: 5.4080, dest_lat: 1.3521, dest_lng: 103.8198, carrier: "Lufthansa Cargo Heavy", mode: "Air", status: "In Transit", active_shipments: 4, total_value_usd: 48000000 },
  { id: "RT-03", origin_name: "Shenzhen Precision Hub", dest_name: "Rotterdam Super-Hub", origin_lat: 22.5431, origin_lng: 114.0579, dest_lat: 51.9244, dest_lng: 4.4777, carrier: "Maersk Triple-E", mode: "Maritime", status: "Delayed", active_shipments: 22, total_value_usd: 8900000, chokepoint_exposure: "Bab el-Mandeb / Red Sea" },
];
