from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.entities import Supplier, Warehouse, Shipment
from app.schemas.entities import GeoNode, GeoRoute

router = APIRouter()

@router.get("/nodes", response_model=List[GeoNode])
def get_network_nodes(db: Session = Depends(get_db)):
    nodes: List[GeoNode] = []
    
    # Warehouses
    whs = db.query(Warehouse).all()
    for w in whs:
        nodes.append(GeoNode(
            id=w.facility_code,
            name=w.name,
            type="Warehouse Hub",
            country=w.country,
            city=w.city,
            lat=w.latitude,
            lng=w.longitude,
            status=w.operational_status,
            risk_score=20.0 if w.operational_status == "Optimal" else 65.0,
            capacity_pct=w.utilization_pct
        ))

    # Suppliers
    sups = db.query(Supplier).all()
    for s in sups:
        nodes.append(GeoNode(
            id=s.code,
            name=s.name,
            type="Supplier Site",
            country=s.country,
            city=s.city or "",
            lat=s.latitude,
            lng=s.longitude,
            status=s.status,
            risk_score=s.risk_score,
            tier=s.tier
        ))

    # Major Global Strategic Chokepoint Ports
    chokepoints = [
        {"id": "PORT-SUEZ", "name": "Suez Canal Maritime Gateway", "country": "Egypt", "city": "Port Said", "lat": 31.2653, "lng": 32.3019, "status": "Heightened Risk", "risk_score": 84.0},
        {"id": "PORT-PANAMA", "name": "Panama Canal Miraflores Locks", "country": "Panama", "city": "Balboa", "lat": 8.9824, "lng": -79.5199, "status": "Draft Restrictions", "risk_score": 62.0},
        {"id": "PORT-MALACCA", "name": "Strait of Malacca Traffic Node", "country": "Singapore", "city": "Singapore", "lat": 1.29027, "lng": 103.851959, "status": "Optimal Flow", "risk_score": 18.0},
        {"id": "PORT-BAB-MANDEB", "name": "Bab el-Mandeb Strategic Strait", "country": "Djibouti", "city": "Djibouti", "lat": 12.5833, "lng": 43.3333, "status": "Critical Threat", "risk_score": 92.0}
    ]
    for cp in chokepoints:
        nodes.append(GeoNode(
            id=cp["id"],
            name=cp["name"],
            type="Strategic Chokepoint",
            country=cp["country"],
            city=cp["city"],
            lat=cp["lat"],
            lng=cp["lng"],
            status=cp["status"],
            risk_score=cp["risk_score"]
        ))

    return nodes

@router.get("/routes", response_model=List[GeoRoute])
def get_network_routes(db: Session = Depends(get_db)):
    shipments = db.query(Shipment).all()
    routes: List[GeoRoute] = []
    
    for s in shipments:
        routes.append(GeoRoute(
            id=f"RT-{s.tracking_number}",
            origin_name=s.origin_facility,
            dest_name=s.destination_facility,
            origin_lat=s.origin_lat,
            origin_lng=s.origin_lng,
            dest_lat=s.dest_lat,
            dest_lng=s.dest_lng,
            carrier=s.carrier or "Global Carrier",
            mode=s.mode,
            status=s.status,
            active_shipments=14 if s.mode == "Maritime" else 4,
            total_value_usd=s.cargo_value_usd,
            chokepoint_exposure="Bab el-Mandeb / Red Sea" if s.risk_level == "Critical" else None
        ))
    
    return routes

@router.get("/hotspots")
def get_risk_hotspots():
    return [
        {
            "name": "Red Sea Maritime Passage",
            "lat": 18.25,
            "lng": 40.12,
            "radius_km": 600,
            "risk_index": 92.5,
            "alert_type": "Maritime Security / Geopolitical Interception",
            "impacted_vessels": 48
        },
        {
            "name": "Taiwan Strait Air & Sea Corridor",
            "lat": 24.0,
            "lng": 119.5,
            "radius_km": 400,
            "risk_index": 68.0,
            "alert_type": "Military Exclusion Drill Warning",
            "impacted_vessels": 34
        },
        {
            "name": "Panama Gatun Lake Low Water Basin",
            "lat": 9.15,
            "lng": -79.85,
            "radius_km": 250,
            "risk_index": 64.0,
            "alert_type": "Daily Transit Slot Auction Surge",
            "impacted_vessels": 21
        }
    ]
