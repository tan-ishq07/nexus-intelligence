from fastapi import APIRouter, Query
from typing import List, Dict, Any
from app.services.intelligence.demand_engine import predictive_engine

router = APIRouter()

@router.get("/stockout-predictions")
@router.get("/stockouts")
def get_stockout_predictions() -> List[Dict[str, Any]]:
    """
    Computes stockout horizon (days until zero inventory), stockout risk probability,
    and automated safety stock replenishment requirements.
    """
    return predictive_engine.predict_sku_stockout_horizons()

@router.get("/demand-forecasts")
def get_demand_forecasts(sku_id: str = Query(default="SKU-SEMI-301")) -> Dict[str, Any]:
    """
    Returns multi-model demand forecast time series (Neural Net, Gradient Boosting, Baseline).
    """
    return predictive_engine.get_demand_forecast_series(sku_id=sku_id)

@router.get("/items")
def get_inventory_items() -> List[Dict[str, Any]]:
    """Returns inventory catalog items with stockout risk indicators."""
    horizons = predictive_engine.predict_sku_stockout_horizons()
    items = []
    for h in horizons:
        items.append({
            "id": h["sku_id"],
            "sku": h["sku_id"],
            "name": h["product_name"],
            "category": "High-Value Components",
            "warehouse_code": "WH-GLOBAL",
            "quantity_on_hand": h["current_stock_units"],
            "safety_stock_threshold": h["recommended_reorder_qty"],
            "reorder_point": int(h["daily_demand_forecast"] * h["lead_time_days"] * 1.2),
            "unit_cost_usd": 450.0,
            "status": "Critical Low" if h["risk_status"] == "CRITICAL_EXHAUSTION" else "Warning" if "RISK" in h["risk_status"] else "Optimal",
            "days_of_supply": h["runout_horizon_days"],
            "stockout_probability_pct": h["stockout_probability_pct"]
        })
    return items
