from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    command_center,
    network,
    warehouse,
    etl,
    mining,
    predictive,
    supplier_risk,
    inventory,
    association_rules,
    anomalies,
    geospatial,
    olap,
    scenarios,
    decisions,
    reports
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(command_center.router, prefix="/command-center", tags=["Command Center"])
api_router.include_router(network.router, prefix="/network", tags=["Network Telemetry"])
api_router.include_router(warehouse.router, prefix="/warehouse", tags=["Warehouse Intelligence"])
api_router.include_router(etl.router, prefix="/etl", tags=["ETL & Data Quality"])
api_router.include_router(mining.router, prefix="/mining", tags=["Mining Laboratory"])
api_router.include_router(predictive.router, prefix="/predictive", tags=["Predictive Intelligence"])
api_router.include_router(supplier_risk.router, prefix="/supplier-risk", tags=["Supplier Risk"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory Intelligence"])
api_router.include_router(association_rules.router, prefix="/association-rules", tags=["Association Discovery"])
api_router.include_router(anomalies.router, prefix="/anomalies", tags=["Anomaly Detection"])
api_router.include_router(geospatial.router, prefix="/geospatial", tags=["Geospatial Intelligence"])
api_router.include_router(olap.router, prefix="/olap", tags=["OLAP Analytics"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["Scenario Simulator"])
api_router.include_router(decisions.router, prefix="/decisions", tags=["Decision Playbooks"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Dossiers"])
