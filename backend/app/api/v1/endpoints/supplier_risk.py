from fastapi import APIRouter, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.intelligence.supplier_engine import supplier_engine

router = APIRouter()

class SupplierDisruptionPredictionRequest(BaseModel):
    lead_time_days: float = Field(default=28.5, description="Average lead time in days")
    historical_on_time_rate: float = Field(default=82.0, description="On-time delivery percentage (0-100)")
    defect_rate_ppm: float = Field(default=240.0, description="Quality defect rate in PPM")
    financial_health_score: float = Field(default=62.0, description="Altman Z-Score proxy / health index (0-100)")
    geopolitical_risk_score: float = Field(default=75.0, description="Geopolitical friction score (0-100)")
    esg_compliance_score: float = Field(default=78.0, description="ESG compliance score (0-100)")
    single_source_dependency: int = Field(default=1, ge=0, le=1, description="Single source flag (1 or 0)")
    capacity_utilization_pct: float = Field(default=92.0, description="Factory capacity utilization %")
    contract_duration_months: int = Field(default=12, description="Remaining contract length")
    audit_pass_rate: float = Field(default=88.0, description="Historical audit pass rate %")
    model_name: Optional[str] = Field(default="GradientBoosting", description="Model algorithm to use")

@router.get("/benchmarks")
def get_classifier_benchmarks() -> Dict[str, Any]:
    """
    Returns authentic comparative evaluation benchmarks (Accuracy, Precision, Recall, F1, ROC-AUC)
    for 5 classifiers: Decision Tree, Naive Bayes, SVM, Random Forest, and Gradient Boosting.
    """
    return supplier_engine.train_and_benchmark_models()

@router.post("/predict-disruption")
def predict_supplier_disruption(req: SupplierDisruptionPredictionRequest) -> Dict[str, Any]:
    """
    Runs classification inference to predict supplier delivery failure risk
    with feature attributions (SHAP surrogate) and recommended operational playbooks.
    """
    features = req.model_dump()
    model_name = features.pop("model_name", "GradientBoosting")
    return supplier_engine.predict_supplier_risk(features=features, model_name=model_name)

@router.get("/suppliers")
def get_scored_suppliers() -> List[Dict[str, Any]]:
    """Returns all enterprise suppliers scored with real-time ML disruption probabilities."""
    return supplier_engine.get_supplier_fleet_risks()
