from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.services.olap.olap_engine import olap_engine

router = APIRouter()

@router.get("/cubes")
def get_available_cubes() -> List[Dict[str, Any]]:
    return [
        {
            "cube_name": "v_olap_orders_shipments",
            "title": "Commercial Orders & Fulfillment Cube",
            "dimensions": ["year", "quarter", "month_name", "product_category", "warehouse_region", "customer_segment"],
            "measures": ["total_amount_usd", "order_quantity", "freight_value_usd", "discount_amount_usd"],
            "engine": "DuckDB Columnar In-Memory"
        },
        {
            "cube_name": "v_olap_shipments",
            "title": "Multimodal Logistics & Telemetry Cube",
            "dimensions": ["departure_quarter", "departure_month", "transport_mode", "carrier_name", "supplier_country", "supplier_tier"],
            "measures": ["cargo_value_usd", "freight_cost_usd", "transit_time_days", "delay_hours", "supplier_risk_score"],
            "engine": "DuckDB Columnar In-Memory"
        }
    ]

@router.post("/query")
def execute_olap_query(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        dimensions = payload.get("dimensions", ["warehouse_region", "product_category"])
        measures = payload.get("measures", [{"agg": "SUM", "col": "total_amount_usd", "alias": "gross_revenue"}])
        filters = payload.get("filters", None)
        view_name = payload.get("cube_name", "v_olap_orders_shipments")

        result = olap_engine.execute_dynamic_olap(
            dimensions=dimensions,
            measures=measures,
            filters=filters,
            view_name=view_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/comparisons/{comparison_name}")
def get_prebuilt_comparison(comparison_name: str):
    if comparison_name == "monthly-quarterly-shipments":
        return olap_engine.get_monthly_vs_quarterly_shipments()
    elif comparison_name == "supplier-performance-by-region":
        return olap_engine.get_supplier_performance_by_region()
    elif comparison_name == "product-demand-by-warehouse":
        return olap_engine.get_product_demand_by_warehouse()
    elif comparison_name == "logistics-cost-by-mode":
        return olap_engine.get_logistics_cost_by_mode()
    elif comparison_name == "revenue-by-product-and-region":
        return olap_engine.get_revenue_by_product_and_region()
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown OLAP comparison: '{comparison_name}'. Available: monthly-quarterly-shipments, supplier-performance-by-region, product-demand-by-warehouse, logistics-cost-by-mode, revenue-by-product-and-region"
        )
