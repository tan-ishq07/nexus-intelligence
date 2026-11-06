from fastapi import APIRouter, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.intelligence.kdd_pipeline import kdd_runner
from app.services.intelligence.clustering_engine import clustering_engine

router = APIRouter()

class KddExecutionRequest(BaseModel):
    pipeline_name: str = Field(default="Enterprise-KDD-Production", description="Pipeline identifier")
    target_dataset: str = Field(default="product_purchasing", description="Dataset identifier")
    mining_task: str = Field(default="Association_FPGrowth", description="Mining task to execute")
    parameters: Optional[Dict[str, Any]] = Field(default=None, description="Dynamic parameters")

class ClusteringRequest(BaseModel):
    target: str = Field(default="suppliers", description="Segmentation target: suppliers, warehouses, products")
    algorithm: str = Field(default="kmeans", description="Clustering algorithm: kmeans, hierarchical, dbscan, gmm")
    n_clusters: int = Field(default=4, ge=2, le=10, description="Number of clusters (for kmeans, hierarchical, gmm)")
    eps: float = Field(default=0.8, ge=0.1, le=5.0, description="Epsilon parameter for DBSCAN")
    min_samples: int = Field(default=4, ge=2, le=20, description="Min samples parameter for DBSCAN")

# ==========================================
# 1. KDD PIPELINE ENDPOINTS
# ==========================================

@router.get("/kdd/stages")
def get_kdd_stages() -> List[Dict[str, Any]]:
    """Returns the 7 stages of Knowledge Discovery in Databases (KDD)."""
    return kdd_runner.get_stages_info()

@router.post("/kdd/run")
def execute_kdd_pipeline(req: KddExecutionRequest) -> Dict[str, Any]:
    """
    Executes the 7-stage KDD pipeline: Data Selection, Cleaning, Integration,
    Transformation, Mining, Evaluation, and Presentation.
    """
    return kdd_runner.execute_kdd_pipeline(
        pipeline_name=req.pipeline_name,
        target_dataset=req.target_dataset,
        mining_task=req.mining_task,
        parameters=req.parameters
    )

@router.get("/kdd/history")
def get_kdd_history(limit: int = Query(default=10, ge=1, le=50)) -> List[Dict[str, Any]]:
    """Returns execution history and performance logs of past KDD pipeline runs."""
    return kdd_runner.get_run_history(limit=limit)

# ==========================================
# 2. CLUSTERING & SEGMENTATION ENDPOINTS
# ==========================================

@router.get("/clustering/targets")
def get_clustering_targets() -> Dict[str, str]:
    """Returns supported segmentation targets."""
    return clustering_engine.SEGMENTATION_TARGETS

@router.post("/clustering/run")
def run_clustering(req: ClusteringRequest) -> Dict[str, Any]:
    """
    Runs K-Means, Hierarchical, DBSCAN, or GMM Clustering with PCA 2D projections,
    Silhouette validation, and business interpretation.
    """
    return clustering_engine.run_clustering(
        target=req.target,
        algorithm=req.algorithm,
        n_clusters=req.n_clusters,
        eps=req.eps,
        min_samples=req.min_samples
    )

# ==========================================
# 3. PROCESS VARIANTS & BOTTLENECK ANALYSIS
# ==========================================

@router.get("/process-variants")
def get_process_variants() -> List[Dict[str, Any]]:
    return [
        {
            "variant_id": "VAR-01",
            "name": "Standard Direct Air Express",
            "case_count": 8420,
            "percentage": 56.7,
            "avg_lead_time_days": 3.8,
            "standard_steps": ["Purchase Order Raised", "Supplier Dispatch", "Air Waybill Lodged", "Destination Customs Cleared", "Dock Ingestion"],
            "deviation_rate_pct": 1.4,
            "bottleneck_stage": "Destination Customs Cleared"
        },
        {
            "variant_id": "VAR-02",
            "name": "Intermodal Maritime + Rail Shuttle",
            "case_count": 4810,
            "percentage": 32.4,
            "avg_lead_time_days": 21.4,
            "standard_steps": ["Container Stuffed", "Berth Loading", "Ocean Transit", "Gantry Crane Offload", "Rail Ramp Intermodal", "Final Warehouse Delivery"],
            "deviation_rate_pct": 14.8,
            "bottleneck_stage": "Gantry Crane Offload (Dwell Time)"
        },
        {
            "variant_id": "VAR-03",
            "name": "Rerouted Cape of Good Hope Contingency",
            "case_count": 1620,
            "percentage": 10.9,
            "avg_lead_time_days": 34.2,
            "standard_steps": ["Container Stuffed", "Singapore Bunkering", "Cape Route Bypassing Suez", "Rotterdam Outer Anchorage", "Customs Inspection", "Warehouse Unloading"],
            "deviation_rate_pct": 28.5,
            "bottleneck_stage": "Cape Route Bypassing Suez"
        }
    ]

@router.get("/bottlenecks")
def get_bottlenecks() -> List[Dict[str, Any]]:
    return [
        {
            "location": "Rotterdam Container Terminal Delta",
            "process_step": "Customs Release & Gate Out",
            "average_delay_hours": 38.4,
            "affected_volume_teu": 420,
            "financial_friction_usd": 185000,
            "root_cause": "EU Deforestation Regulation (EUDR) documentation mismatch"
        },
        {
            "location": "Long Beach Pier 400",
            "process_step": "Chassis In-Gate Allocation",
            "average_delay_hours": 24.2,
            "affected_volume_teu": 610,
            "financial_friction_usd": 142000,
            "root_cause": "Chassis pool imbalance during vessel bunching"
        }
    ]
