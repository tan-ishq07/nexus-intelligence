from fastapi import APIRouter, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.intelligence.anomaly_engine import anomaly_engine

router = APIRouter()

class AnomalyDetectionRequest(BaseModel):
    domain: str = Field(default="shipments", description="Domain: shipments, inventory, suppliers, orders")
    algorithm: str = Field(default="isolation_forest", description="Algorithm: isolation_forest, dbscan, zscore, iqr")
    contamination: float = Field(default=0.05, ge=0.001, le=0.30, description="Contamination factor for Isolation Forest")
    sensitivity_sigma: float = Field(default=2.5, ge=1.0, le=5.0, description="Standard deviation threshold for Z-Score")

@router.get("/domains")
def get_supported_domains() -> Dict[str, str]:
    """Returns domains available for anomaly detection."""
    return anomaly_engine.SUPPORTED_DOMAINS

@router.get("/events")
def get_anomaly_events(
    domain: str = Query(default="shipments"),
    algorithm: str = Query(default="isolation_forest"),
    contamination: float = Query(default=0.05)
) -> List[Dict[str, Any]]:
    """Returns detected operational anomalies with mathematical evidence breakdowns."""
    res = anomaly_engine.detect_anomalies(domain=domain, algorithm=algorithm, contamination=contamination)
    return res.get("events", [])

@router.post("/detect")
def detect_anomalies(req: AnomalyDetectionRequest) -> Dict[str, Any]:
    """
    Executes unsupervised anomaly detection (Isolation Forest, DBSCAN, Z-Score, IQR)
    over operational telemetry streams with feature deviation explanations.
    """
    return anomaly_engine.detect_anomalies(
        domain=req.domain,
        algorithm=req.algorithm,
        contamination=req.contamination,
        sensitivity_sigma=req.sensitivity_sigma
    )
