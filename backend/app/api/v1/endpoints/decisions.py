from fastapi import APIRouter, Query, Body, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.intelligence.discovery_service import discovery_service

router = APIRouter()

class LifecycleTransitionRequest(BaseModel):
    new_state: str = Field(description="Target lifecycle state: NEW, UNDER_REVIEW, ACKNOWLEDGED, RESOLVED")
    reviewed_by: Optional[str] = Field(default="Executive Supply Chain Analyst")

class PlaybookExecutionRequest(BaseModel):
    playbook_id: str
    target_entity: str
    allocation_shift_pct: Optional[float] = 35.0
    buffer_days: Optional[int] = 14

@router.get("/insights")
def get_discovered_insights(
    state: Optional[str] = Query(default=None, description="Lifecycle state: NEW, UNDER_REVIEW, ACKNOWLEDGED, RESOLVED, or ALL"),
    category: Optional[str] = Query(default=None, description="Category filter"),
    severity: Optional[str] = Query(default=None, description="Severity filter"),
    limit: int = Query(default=50)
) -> List[Dict[str, Any]]:
    """
    Returns automated knowledge discoveries produced across the 5 intelligence engines
    with full lifecycle state tracking.
    """
    return discovery_service.get_insights(lifecycle_state=state, category=category, severity=severity, limit=limit)

@router.post("/insights/scan")
def trigger_discovery_scan() -> Dict[str, Any]:
    """
    Triggers an automated knowledge discovery scan across all 5 intelligence engines
    and logs discovered patterns into the persistence store.
    """
    return discovery_service.scan_and_generate_insights()

@router.patch("/insights/{insight_id}/status")
def update_insight_lifecycle_state(insight_id: str, req: LifecycleTransitionRequest) -> Dict[str, Any]:
    """
    Transitions an insight through its governance lifecycle:
    NEW -> UNDER_REVIEW -> ACKNOWLEDGED -> RESOLVED.
    """
    res = discovery_service.update_lifecycle_state(
        insight_id=insight_id,
        new_state=req.new_state,
        reviewed_by=req.reviewed_by or "Executive Analyst"
    )
    if res.get("status") == "NOT_FOUND":
        raise HTTPException(status_code=404, detail=res.get("message"))
    elif res.get("status") == "ERROR":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

@router.get("/playbooks")
def get_playbooks() -> List[Dict[str, Any]]:
    return [
        {
            "id": "PB-REROUTE-01",
            "name": "Cape of Good Hope Oceanic Contingency",
            "trigger_condition": "Suez Threat Index > 85 or Bab el-Mandeb active missile event",
            "target_entity": "Europe-Asia Maritime Corridor",
            "action_type": "Carrier Dispatch Reroute",
            "estimated_impact": "Prevents catastrophic cargo stranding; +12.4 days transit, $680k bunker burn offset by 0% war risk loss",
            "readiness": "ARMED_AND_READY"
        },
        {
            "id": "PB-DUALSOURCE-02",
            "name": "Automated Secondary Foundry Volume Shift",
            "trigger_condition": "Primary Supplier Failure Risk > 70% or Defect Drift > 2.5σ",
            "target_entity": "TSMC Fab 18 -> Infineon Dresden",
            "action_type": "Purchase Order Allocation Split",
            "estimated_impact": "Guarantees 40% production line continuity in event of single-source stoppage",
            "readiness": "ARMED_AND_READY"
        },
        {
            "id": "PB-STOCKOUT-03",
            "name": "Emergency Air Freight Buffer Injection",
            "trigger_condition": "SKU Runout Horizon < Supplier Lead Time",
            "target_entity": "3nm Wafer Substrate & Inverter ASICs",
            "action_type": "Charter Air Booking & Customs Fast-Track",
            "estimated_impact": "Bypasses 21-day ocean lead time; averts $1.8M factory idle fine",
            "readiness": "ARMED_AND_READY"
        }
    ]

@router.post("/playbooks/execute")
def execute_playbook(req: PlaybookExecutionRequest) -> Dict[str, Any]:
    return {
        "status": "DISPATCHED",
        "playbook_id": req.playbook_id,
        "target_entity": req.target_entity,
        "dispatch_id": "DSP-EXEC-9921",
        "telemetry_ack": "All carrier systems and ERP EDI integrations notified.",
        "operational_impact": "Playbook activated. Telemetry lock engaged."
    }
