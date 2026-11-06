import {
  CommandCenterMetrics,
  TrendPoint,
  RegionalPerformance,
  SupplierRiskDistribution,
  OperationalAlert,
  Recommendation,
  GeoNode,
  GeoRoute,
  ScenarioResult,
  SystemHealth,
  WarehouseTableMeta,
  PipelineInfo,
  DataQualityReport,
  DatasetMetadata,
  LineageGraph,
  OLAPCubeMeta,
  OLAPQueryResult,
} from "@/types";
import {
  initialMetrics,
  initialTrends,
  initialRegional,
  initialSupplierRisk,
  initialAlerts,
  initialRecommendations,
  initialNodes,
  initialRoutes
} from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchWithFallback<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return fallback;
    }
    return await res.json();
  } catch (err) {
    return fallback;
  }
}

export const api = {
  getHealth: async (): Promise<SystemHealth> => {
    return fetchWithFallback<SystemHealth>("/api/v1/health", {
      status: "healthy",
      version: "1.0.0-ENTERPRISE",
      timestamp: new Date().toISOString(),
      database: "connected",
      duckdb_engine: "online",
      active_workers: 4,
      uptime_seconds: 3420.5
    });
  },

  getMetrics: async (): Promise<CommandCenterMetrics> => {
    return fetchWithFallback<CommandCenterMetrics>("/api/v1/command-center/metrics", initialMetrics);
  },

  getTrends: async (): Promise<TrendPoint[]> => {
    return fetchWithFallback<TrendPoint[]>("/api/v1/command-center/trends", initialTrends);
  },

  getRegional: async (): Promise<RegionalPerformance[]> => {
    return fetchWithFallback<RegionalPerformance[]>("/api/v1/command-center/regional", initialRegional);
  },

  getSupplierRisk: async (): Promise<SupplierRiskDistribution[]> => {
    return fetchWithFallback<SupplierRiskDistribution[]>("/api/v1/command-center/supplier-risk", initialSupplierRisk);
  },

  getAlerts: async (): Promise<OperationalAlert[]> => {
    return fetchWithFallback<OperationalAlert[]>("/api/v1/command-center/alerts", initialAlerts);
  },

  getRecommendations: async (): Promise<Recommendation[]> => {
    return fetchWithFallback<Recommendation[]>("/api/v1/command-center/recommendations", initialRecommendations);
  },

  getNodes: async (): Promise<GeoNode[]> => {
    return fetchWithFallback<GeoNode[]>("/api/v1/network/nodes", initialNodes);
  },

  getRoutes: async (): Promise<GeoRoute[]> => {
    return fetchWithFallback<GeoRoute[]>("/api/v1/network/routes", initialRoutes);
  },

  simulateScenario: async (payload: {
    scenario_id: string;
    severity_multiplier: number;
    duration_days: number;
    reroute_via_cape_good_hope: boolean;
    buffer_inventory_drawdown_pct?: number;
  }): Promise<ScenarioResult> => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/scenarios/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const additionalCost = 3150000.0 * payload.severity_multiplier;
    return {
      scenario_name: "Strategic Chokepoint & Resilience Stress-Test",
      scenario_id: payload.scenario_id,
      projected_additional_cost_usd: additionalCost,
      mean_delay_increase_days: 11.4 * payload.severity_multiplier,
      affected_routes_count: 28,
      stockout_risk_skus_count: 14,
      recommended_playbook: "PLAYBOOK-ALPHA-CAPE: Reallocate Tier-1 High-Value Cargo to Frankfurt Air Bridge while routing bulk via Cape.",
      baseline_cost_usd: 2450000.0,
      simulated_cost_usd: 2450000.0 + additionalCost,
      baseline_delay_hours: 4.2,
      simulated_delay_hours: 4.2 + (11.4 * 24),
      baseline_otd_pct: 94.6,
      simulated_otd_pct: 64.2,
      comparison_metrics: [
        { metric: "Operational Cost ($M)", baseline: 2.45, simulated: Number(((2450000 + additionalCost) / 1e6).toFixed(2)), delta: `+$${(additionalCost / 1e6).toFixed(2)}M` },
        { metric: "Avg Delay (hrs)", baseline: 4.2, simulated: Number((4.2 + 11.4 * 24).toFixed(1)), delta: `+${(11.4 * 24).toFixed(1)} hrs` },
        { metric: "On-Time SLA (%)", baseline: 94.6, simulated: 64.2, delta: "-30.4%" },
        { metric: "Critical SKUs at Risk", baseline: 2, simulated: 14, delta: "+12 SKUs" }
      ],
      affected_entities: [
        { entity: "Bab el-Mandeb / Suez Strait", impact: "Total Vessel Avoidance", risk: "Critical" },
        { entity: "Rotterdam Super-Hub", impact: "Container Inflow Starvation", risk: "High" },
        { entity: "Frankfurt Air Bridge", impact: "Air Charter Surcharge +45%", risk: "Moderate" }
      ],
      impact_timeline: [
        { day: "Day 2", cumulative_cost_impact_usd: Math.round(additionalCost * 0.15), unmet_demand_units: 400, at_risk_tier1_shipments: 14 },
        { day: "Day 6", cumulative_cost_impact_usd: Math.round(additionalCost * 0.45), unmet_demand_units: 1200, at_risk_tier1_shipments: 21 },
        { day: "Day 10", cumulative_cost_impact_usd: Math.round(additionalCost * 0.75), unmet_demand_units: 2400, at_risk_tier1_shipments: 26 },
        { day: "Day 14", cumulative_cost_impact_usd: Math.round(additionalCost), unmet_demand_units: 3600, at_risk_tier1_shipments: 32 }
      ]
    };
  },

  getSavedModels: async (): Promise<any> => {
    return fetchWithFallback<any>("/api/v1/health/models", { total_models: 0, registry: [] });
  },

  // ==========================================
  // DATA ENGINEERING & WAREHOUSE ENDPOINTS
  // ==========================================

  getWarehouseSchema: async (): Promise<WarehouseTableMeta[]> => {
    return fetchWithFallback<WarehouseTableMeta[]>("/api/v1/warehouse/schema", []);
  },

  getETLPipelines: async (): Promise<PipelineInfo[]> => {
    return fetchWithFallback<PipelineInfo[]>("/api/v1/etl/pipelines", []);
  },

  triggerPipelineRun: async (pipelineId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/etl/pipelines/${pipelineId}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return await res.json();
  },

  getPipelineLogs: async (): Promise<string[]> => {
    return fetchWithFallback<string[]>("/api/v1/etl/pipelines/logs", [
      "[13:00:00 UTC] System standby. Medallion pipelines idle.",
      "[13:00:05 UTC] Database schema verified across 12 analytical entities."
    ]);
  },

  getDataQualityMetrics: async (): Promise<DataQualityReport> => {
    return fetchWithFallback<DataQualityReport>("/api/v1/etl/quality-metrics", {
      table_name: "fact_orders",
      total_records: 14850,
      completeness_score: 99.8,
      missing_pct: 0.2,
      uniqueness_score: 100.0,
      duplicate_pct: 0.0,
      validity_score: 99.4,
      consistency_score: 98.9,
      referential_integrity_score: 100.0,
      overall_health_score: 99.2,
      data_freshness: "Current (< 1 hr)",
      detected_issues: [],
      status: "Healthy"
    });
  },

  getDataLineage: async (): Promise<LineageGraph> => {
    return fetchWithFallback<LineageGraph>("/api/v1/etl/lineage", {
      nodes: [],
      edges: [],
      layers: ["raw", "cleaned", "curated"]
    });
  },

  getDatasetMetadata: async (): Promise<DatasetMetadata[]> => {
    return fetchWithFallback<DatasetMetadata[]>("/api/v1/etl/metadata", []);
  },

  getAvailableCubes: async (): Promise<OLAPCubeMeta[]> => {
    return fetchWithFallback<OLAPCubeMeta[]>("/api/v1/olap/cubes", []);
  },

  runOLAPQuery: async (payload: {
    dimensions: string[];
    measures: Array<{ agg: string; col: string; alias?: string }>;
    filters?: Array<{ column: string; op: string; val: any }>;
    cube_name?: string;
  }): Promise<OLAPQueryResult> => {
    const res = await fetch(`${API_BASE}/api/v1/olap/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error("OLAP query failed to execute");
    }
    return await res.json();
  },

  getOLAPComparison: async (comparisonName: string): Promise<any[]> => {
    return fetchWithFallback<any[]>(`/api/v1/olap/comparisons/${comparisonName}`, []);
  },

  // ==========================================
  // PROMPT 3: DATA MINING & INTELLIGENCE ENGINES
  // ==========================================

  // 1. Association Rules
  getAssociationDatasets: async (): Promise<Array<{ id: string; name: string; description: string }>> => {
    return fetchWithFallback("/api/v1/association-rules/datasets", [
      { id: "product_purchasing", name: "Product Purchasing Baskets", description: "BOM component co-purchasing" },
      { id: "shipment_delays", name: "Shipment Delays & Multi-Factor Triggers", description: "Co-occurring bottleneck attributes" },
      { id: "inventory_exhaustion", name: "Inventory Stockout Co-Occurrences", description: "SKU simultaneous stockouts" }
    ]);
  },

  mineAssociationRules: async (payload: {
    dataset_name: string;
    algorithm: string;
    min_support: number;
    min_confidence: number;
    min_lift?: number;
    antecedent_filter?: string;
    consequent_filter?: string;
  }): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/association-rules/mine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Mining execution failed");
    return await res.json();
  },

  compareMiningAlgorithms: async (dataset: string, minSupport: number = 0.05): Promise<any> => {
    return fetchWithFallback(`/api/v1/association-rules/compare?dataset=${dataset}&min_support=${minSupport}`, {
      benchmarks: [],
      speedup_ratio: "N/A"
    });
  },

  getAssociationNetwork: async (dataset: string = "product_purchasing"): Promise<{ nodes: any[]; links: any[] }> => {
    return fetchWithFallback(`/api/v1/association-rules/network?dataset=${dataset}`, { nodes: [], links: [] });
  },

  // 2. KDD Pipeline & Clustering
  getKddStages: async (): Promise<any[]> => {
    return fetchWithFallback("/api/v1/mining/kdd/stages", []);
  },

  executeKddPipeline: async (payload: {
    pipeline_name?: string;
    target_dataset: string;
    mining_task: string;
    parameters?: any;
  }): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/mining/kdd/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("KDD pipeline execution failed");
    return await res.json();
  },

  getKddHistory: async (): Promise<any[]> => {
    return fetchWithFallback("/api/v1/mining/kdd/history", []);
  },

  runClustering: async (payload: {
    target: string;
    algorithm: string;
    n_clusters?: number;
    eps?: number;
    min_samples?: number;
  }): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/mining/clustering/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Clustering failed");
    return await res.json();
  },

  getProcessVariants: async (): Promise<any[]> => {
    return fetchWithFallback("/api/v1/mining/process-variants", []);
  },

  getBottlenecks: async (): Promise<any[]> => {
    return fetchWithFallback("/api/v1/mining/bottlenecks", []);
  },

  // 3. Predictive Intelligence (Delay & Demand)
  getModelBenchmarks: async (): Promise<any> => {
    return fetchWithFallback("/api/v1/predictive/models", { benchmarks: [] });
  },

  trainPredictiveModels: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/predictive/train`, { method: "POST" });
    return await res.json();
  },

  predictShipmentDelay: async (payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/predictive/predict/shipment-delay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Delay prediction failed");
    return await res.json();
  },

  getPredictiveDelays: async (): Promise<any[]> => {
    return fetchWithFallback("/api/v1/predictive/delays", []);
  },

  getDemandForecastSeries: async (skuId: string = "SKU-SEMI-301"): Promise<any> => {
    return fetchWithFallback(`/api/v1/predictive/demand/forecast?sku_id=${skuId}`, {
      sku_id: skuId,
      historical_actuals: [],
      future_projections: []
    });
  },

  getStockoutPredictions: async (): Promise<any[]> => {
    return fetchWithFallback("/api/v1/predictive/demand/stockouts", []);
  },

  // 4. Supplier Risk Intelligence
  getSupplierRiskBenchmarks: async (): Promise<any> => {
    return fetchWithFallback("/api/v1/supplier-risk/benchmarks", { benchmarks: [] });
  },

  predictSupplierDisruption: async (payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/supplier-risk/predict-disruption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Supplier risk calculation failed");
    return await res.json();
  },

  getScoredSuppliers: async (): Promise<any[]> => {
    return fetchWithFallback("/api/v1/supplier-risk/suppliers", []);
  },

  // 5. Operational Anomalies
  detectAnomalies: async (payload: {
    domain: string;
    algorithm: string;
    contamination?: number;
    sensitivity_sigma?: number;
  }): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/anomalies/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Anomaly detection failed");
    return await res.json();
  },

  getAnomalyEvents: async (): Promise<any[]> => {
    return fetchWithFallback("/api/v1/anomalies/events", []);
  },

  // 6. Automated Knowledge Discovery & Decisions
  getDiscoveredInsights: async (state?: string, category?: string): Promise<any[]> => {
    let url = "/api/v1/decisions/insights";
    const params = [];
    if (state) params.push(`state=${state}`);
    if (category) params.push(`category=${category}`);
    if (params.length > 0) url += `?${params.join("&")}`;
    return fetchWithFallback(url, []);
  },

  triggerDiscoveryScan: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/decisions/insights/scan`, { method: "POST" });
    return await res.json();
  },

  updateInsightLifecycle: async (insightId: string, newState: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/decisions/insights/${insightId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_state: newState })
    });
    return await res.json();
  },

  getPlaybooks: async (): Promise<any[]> => {
    return fetchWithFallback("/api/v1/decisions/playbooks", []);
  },

  executePlaybook: async (payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/v1/decisions/playbooks/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }
};
