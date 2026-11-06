from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.entities import Supplier, Warehouse, Shipment, InventoryItem, OperationalAlert
from app.schemas.entities import (
    CommandCenterMetrics,
    TrendPoint,
    RegionalPerformance,
    SupplierRiskItem,
    OperationalAlertDTO,
    RecommendationDTO
)
from app.services.analytics import analytics_engine

router = APIRouter()

@router.get("/metrics", response_model=CommandCenterMetrics)
def get_command_center_metrics(db: Session = Depends(get_db)):
    total_shipments = db.query(Shipment).count() or 14850
    active_suppliers = db.query(Supplier).count() or 412
    global_warehouses = db.query(Warehouse).count() or 48
    
    return CommandCenterMetrics(
        total_shipments=total_shipments,
        active_suppliers=active_suppliers,
        global_warehouses=global_warehouses,
        inventory_value_usd=248900000.0,
        on_time_delivery_pct=94.6,
        avg_shipment_delay_hours=4.2,
        high_risk_suppliers_count=19,
        predicted_stockouts_count=7,
        total_in_transit_value_usd=84200000.0,
        carbon_intensity_index=62.4,
        resilience_score=88.2
    )

@router.get("/trends", response_model=List[TrendPoint])
def get_demand_trends():
    return analytics_engine.get_demand_trends()

@router.get("/regional", response_model=List[RegionalPerformance])
def get_regional_performance():
    return [
        RegionalPerformance(region="North America", on_time_pct=96.4, active_shipments=4120, risk_level="Low", avg_delay_hours=2.1),
        RegionalPerformance(region="EMEA", on_time_pct=91.8, active_shipments=3850, risk_level="Medium", avg_delay_hours=5.4),
        RegionalPerformance(region="APAC", on_time_pct=95.2, active_shipments=5410, risk_level="Low", avg_delay_hours=3.0),
        RegionalPerformance(region="LATAM", on_time_pct=88.0, active_shipments=1470, risk_level="High", avg_delay_hours=8.9),
    ]

@router.get("/supplier-risk", response_model=List[SupplierRiskItem])
def get_supplier_risk_distribution():
    return [
        SupplierRiskItem(category="Low Risk (0-30)", count=284, percentage=68.9, color="#10B981"),
        SupplierRiskItem(category="Moderate Risk (31-60)", count=88, percentage=21.4, color="#38BDF8"),
        SupplierRiskItem(category="Elevated Risk (61-80)", count=26, percentage=6.3, color="#F59E0B"),
        SupplierRiskItem(category="Critical Risk (81-100)", count=14, percentage=3.4, color="#F43F5E"),
    ]

@router.get("/alerts", response_model=List[OperationalAlertDTO])
def get_recent_alerts(db: Session = Depends(get_db)):
    alerts = db.query(OperationalAlert).order_by(OperationalAlert.id.desc()).all()
    result = []
    for a in alerts:
        result.append(OperationalAlertDTO(
            id=a.id,
            alert_code=a.alert_code,
            title=a.title,
            summary=a.summary,
            severity=a.severity,
            category=a.category,
            entity_type=a.entity_type,
            entity_id=a.entity_id or "",
            detected_at=a.detected_at.strftime("%Y-%m-%d %H:%M UTC") if a.detected_at else "Just now",
            status=a.status,
            recommended_action=a.recommended_action,
            impact_usd=a.impact_usd or 0.0
        ))
    return result

@router.get("/recommendations", response_model=List[RecommendationDTO])
def get_high_priority_recommendations():
    return [
        RecommendationDTO(
            id="REC-01",
            title="Accelerate European Safety Stock Buffer via Antwerp",
            category="Inventory Balancing",
            priority="Critical",
            estimated_savings_usd=1450000.0,
            mitigation_window_hours=36,
            rationale="Rotterdam container dwell times have peaked at 6.8 days due to crane modernization. Routing 18 TEUs to Antwerp prevents factory idling.",
            action_type="Autonomous Rebalance"
        ),
        RecommendationDTO(
            id="REC-02",
            title="Lock Long-Term Air Freight Allocation: Taipei to Chicago",
            category="Carrier Hedging",
            priority="High",
            estimated_savings_usd=820000.0,
            mitigation_window_hours=72,
            rationale="Projected spot air freight rates are forecasted to jump +24% next week due to holiday semiconductor demand ramp.",
            action_type="Contract Execution"
        ),
        RecommendationDTO(
            id="REC-03",
            title="Pre-Qualify Secondary Photolithography Optics Source",
            category="Supplier Resilience",
            priority="Medium",
            estimated_savings_usd=3400000.0,
            mitigation_window_hours=120,
            rationale="Sole supplier concentration on EUV optical assemblies exceeds safe risk threshold (88/100).",
            action_type="Dual Sourcing Workflow"
        )
    ]
