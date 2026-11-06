from fastapi import APIRouter, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.intelligence.pattern_engine import pattern_engine

router = APIRouter()

class AssociationMiningRequest(BaseModel):
    dataset_name: str = Field(default="product_purchasing", description="Target dataset")
    algorithm: str = Field(default="fpgrowth", description="Mining algorithm: apriori or fpgrowth")
    min_support: float = Field(default=0.05, ge=0.001, le=1.0, description="Minimum itemset support threshold")
    min_confidence: float = Field(default=0.30, ge=0.01, le=1.0, description="Minimum rule confidence threshold")
    min_lift: float = Field(default=1.0, ge=0.0, description="Minimum lift threshold")
    antecedent_filter: Optional[str] = Field(default=None, description="Search filter for antecedent items")
    consequent_filter: Optional[str] = Field(default=None, description="Search filter for consequent items")
    max_len: Optional[int] = Field(default=4, ge=2, le=10, description="Maximum itemset length")

@router.get("/datasets")
def get_datasets() -> List[Dict[str, str]]:
    """Lists all available transactional datasets for association mining."""
    return pattern_engine.get_available_datasets()

@router.get("/rules")
def get_association_rules(
    dataset: str = Query(default="product_purchasing"),
    algorithm: str = Query(default="fpgrowth"),
    min_support: float = Query(default=0.04),
    min_confidence: float = Query(default=0.30)
) -> List[Dict[str, Any]]:
    """Returns discovered association rules with support, confidence, lift, and conviction."""
    res = pattern_engine.mine_association_rules(
        dataset_name=dataset,
        algorithm=algorithm,
        min_support=min_support,
        min_confidence=min_confidence
    )
    return res.get("rules", [])

@router.post("/mine")
def mine_association_rules(req: AssociationMiningRequest) -> Dict[str, Any]:
    """
    Executes Apriori or FP-Growth frequent itemset mining and association rule extraction.
    Generates rule table and network graph topology.
    """
    return pattern_engine.mine_association_rules(
        dataset_name=req.dataset_name,
        algorithm=req.algorithm,
        min_support=req.min_support,
        min_confidence=req.min_confidence,
        min_lift=req.min_lift,
        antecedent_filter=req.antecedent_filter,
        consequent_filter=req.consequent_filter,
        max_len=req.max_len
    )

@router.get("/compare")
def compare_mining_algorithms(
    dataset: str = Query(default="product_purchasing"),
    min_support: float = Query(default=0.05)
) -> Dict[str, Any]:
    """
    Benchmarks Apriori vs FP-Growth runtime, memory, and itemset parity over identical data.
    """
    return pattern_engine.compare_algorithms(dataset_name=dataset, min_support=min_support)

@router.get("/network")
def get_rule_network(
    dataset: str = Query(default="product_purchasing"),
    min_support: float = Query(default=0.04)
) -> Dict[str, Any]:
    """Returns node and link topology for interactive network graph visualization."""
    res = pattern_engine.mine_association_rules(
        dataset_name=dataset,
        algorithm="fpgrowth",
        min_support=min_support,
        min_confidence=0.30
    )
    return res.get("network_graph", {"nodes": [], "links": []})
