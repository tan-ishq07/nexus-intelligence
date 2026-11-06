import json
from datetime import datetime
from typing import Dict, Any, List

class LineageTracker:
    def __init__(self):
        self.pipeline_executions: List[Dict[str, Any]] = []
        self._init_default_lineage_graph()

    def _init_default_lineage_graph(self):
        self.lineage_nodes = [
            {"id": "SRC_OLIST_CSV", "label": "olist_orders_sample.csv", "layer": "raw", "type": "Source File", "format": "CSV"},
            {"id": "SRC_M5_CSV", "label": "m5_demand_sample.csv", "layer": "raw", "type": "Source File", "format": "CSV"},
            {"id": "SRC_SHIP_JSON", "label": "supply_chain_shipments.json", "layer": "raw", "type": "Source File", "format": "JSON"},
            {"id": "SRC_SUP_CSV", "label": "suppliers_registry.csv", "layer": "raw", "type": "Source File", "format": "CSV"},
            {"id": "SRC_WH_CSV", "label": "warehouses_registry.csv", "layer": "raw", "type": "Source File", "format": "CSV"},

            {"id": "STG_ORDERS", "label": "stg_orders_cleaned", "layer": "cleaned", "type": "Transformation", "format": "Parquet"},
            {"id": "STG_DEMAND", "label": "stg_demand_cleaned", "layer": "cleaned", "type": "Transformation", "format": "Parquet"},
            {"id": "STG_SHIPMENTS", "label": "stg_shipments_cleaned", "layer": "cleaned", "type": "Transformation", "format": "Parquet"},

            {"id": "DIM_PROD", "label": "dim_product", "layer": "curated", "type": "Dimension Table", "format": "Star Schema"},
            {"id": "DIM_SUPP", "label": "dim_supplier", "layer": "curated", "type": "Dimension Table", "format": "Star Schema"},
            {"id": "DIM_CUST", "label": "dim_customer", "layer": "curated", "type": "Dimension Table", "format": "Star Schema"},
            {"id": "DIM_WH", "label": "dim_warehouse", "layer": "curated", "type": "Dimension Table", "format": "Star Schema"},
            {"id": "DIM_DATE", "label": "dim_date", "layer": "curated", "type": "Dimension Table", "format": "Star Schema"},

            {"id": "FACT_ORD", "label": "fact_orders", "layer": "curated", "type": "Fact Table", "format": "Star Schema"},
            {"id": "FACT_SHIP", "label": "fact_shipments", "layer": "curated", "type": "Fact Table", "format": "Star Schema"},
            {"id": "FACT_INV", "label": "fact_inventory", "layer": "curated", "type": "Fact Table", "format": "Star Schema"},
            {"id": "FACT_FORECAST", "label": "fact_demand_forecasts", "layer": "curated", "type": "Fact Table", "format": "Star Schema"},
        ]

        self.lineage_edges = [
            {"source": "SRC_OLIST_CSV", "target": "STG_ORDERS", "operation": "Schema Cast & Imputation"},
            {"source": "SRC_M5_CSV", "target": "STG_DEMAND", "operation": "Calendar Join & Reshaping"},
            {"source": "SRC_SHIP_JSON", "target": "STG_SHIPMENTS", "operation": "Flatten & Geocoding"},

            {"source": "STG_ORDERS", "target": "DIM_CUST", "operation": "Entity Resolution (SCD2)"},
            {"source": "SRC_SUP_CSV", "target": "DIM_SUPP", "operation": "Surrogate Key Assignment"},
            {"source": "SRC_WH_CSV", "target": "DIM_WH", "operation": "Capacity Normalization"},

            {"source": "STG_ORDERS", "target": "FACT_ORD", "operation": "Foreign Key Mapping"},
            {"source": "STG_SHIPMENTS", "target": "FACT_SHIP", "operation": "Corridor Metric Aggregation"},
            {"source": "STG_DEMAND", "target": "FACT_FORECAST", "operation": "95% Confidence Band Estimation"}
        ]

    def log_execution(self, pipeline_id: str, status: str, duration_ms: float, rows_in: int, rows_out: int, errors: List[str] = None):
        execution = {
            "execution_id": f"RUN-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
            "pipeline_id": pipeline_id,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "status": status,
            "duration_ms": duration_ms,
            "rows_read": rows_in,
            "rows_written": rows_out,
            "failed_records": len(errors) if errors else 0,
            "error_details": errors or []
        }
        self.pipeline_executions.insert(0, execution)
        if len(self.pipeline_executions) > 100:
            self.pipeline_executions.pop()
        return execution

    def get_lineage(self) -> Dict[str, Any]:
        return {
            "nodes": self.lineage_nodes,
            "edges": self.lineage_edges,
            "layers": ["raw", "cleaned", "curated"]
        }

    def get_executions(self, limit: int = 20) -> List[Dict[str, Any]]:
        return self.pipeline_executions[:limit]

lineage_tracker = LineageTracker()
