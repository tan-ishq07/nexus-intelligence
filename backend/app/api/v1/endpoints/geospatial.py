from fastapi import APIRouter, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.intelligence.geospatial_engine import geospatial_engine

router = APIRouter()

class RerouteSimulationRequest(BaseModel):
    origin_port: str = Field(default="Shenzhen, CN")
    destination_port: str = Field(default="Rotterdam, NL")
    chokepoint_avoided: str = Field(default="CP-SUEZ")
    vessel_teu: int = Field(default=15000)

@router.get("/chokepoints")
def get_strategic_chokepoints() -> List[Dict[str, Any]]:
    """Returns strategic maritime chokepoints with live threat indices and diversion rates."""
    return geospatial_engine.get_chokepoints_status()

@router.post("/simulate-reroute")
def simulate_reroute(req: RerouteSimulationRequest) -> Dict[str, Any]:
    """
    Simulates operational impact, transit delay, fuel burn, and CO2 emissions
    for diverting around high-risk maritime chokepoints.
    """
    return geospatial_engine.simulate_reroute(
        origin_port=req.origin_port,
        destination_port=req.destination_port,
        chokepoint_avoided=req.chokepoint_avoided,
        vessel_teu=req.vessel_teu
    )
