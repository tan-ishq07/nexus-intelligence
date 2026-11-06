from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(64), unique=True, index=True, nullable=False)
    tier = Column(String(32), default="Tier 1") # Tier 1, Tier 2, Tier 3
    category = Column(String(128), default="Semiconductors")
    country = Column(String(128), nullable=False)
    city = Column(String(128))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    risk_score = Column(Float, default=24.5) # 0 to 100
    financial_health = Column(Float, default=85.0) # 0 to 100
    geopolitical_risk = Column(Float, default=15.0) # 0 to 100
    esg_score = Column(Float, default=78.0) # 0 to 100
    delivery_reliability = Column(Float, default=94.2) # percentage
    active_contracts = Column(Integer, default=5)
    status = Column(String(64), default="Active") # Active, Watchlist, Suspended, Critical
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    facility_code = Column(String(64), unique=True, index=True, nullable=False)
    city = Column(String(128), nullable=False)
    country = Column(String(128), nullable=False)
    region = Column(String(64), default="North America") # EMEA, APAC, LATAM
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity_sqft = Column(Integer, default=450000)
    utilization_pct = Column(Float, default=78.5)
    temperature_controlled = Column(Boolean, default=True)
    handling_throughput_units_per_day = Column(Integer, default=32000)
    operational_status = Column(String(64), default="Optimal") # Optimal, Constrained, Bottleneck
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(64), unique=True, index=True, nullable=False)
    origin_facility = Column(String(255), nullable=False)
    destination_facility = Column(String(255), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    dest_lat = Column(Float, nullable=False)
    dest_lng = Column(Float, nullable=False)
    carrier = Column(String(128), default="Maersk Logistics")
    mode = Column(String(64), default="Maritime") # Maritime, Air, Rail, Road
    departure_date = Column(DateTime(timezone=True))
    estimated_delivery = Column(DateTime(timezone=True))
    actual_delivery = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(64), default="In Transit") # In Transit, Delivered, Delayed, Critical Alert
    delay_hours = Column(Float, default=0.0)
    cargo_value_usd = Column(Float, default=150000.0)
    risk_level = Column(String(32), default="Low") # Low, Medium, High, Critical
    customs_hold = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(128), default="Critical Electronics")
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    stock_on_hand = Column(Integer, default=1250)
    safety_stock = Column(Integer, default=500)
    reorder_point = Column(Integer, default=800)
    lead_time_days = Column(Integer, default=18)
    unit_cost_usd = Column(Float, default=420.0)
    stockout_risk_score = Column(Float, default=18.5) # 0 to 100
    velocity_tier = Column(String(16), default="Fast Moving") # Fast Moving, Moderate, Slow Moving
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OperationalAlert(Base):
    __tablename__ = "operational_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_code = Column(String(64), unique=True, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    severity = Column(String(32), default="Medium") # Critical, High, Medium, Low
    category = Column(String(64), default="Weather") # Weather, Geopolitical, Port Congestion, Supplier Solvency, Labor Strike
    entity_type = Column(String(64), default="Shipment") # Shipment, Supplier, Warehouse, Route
    entity_id = Column(String(64), default="")
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(32), default="Active") # Active, Mitigated, Ignored
    recommended_action = Column(Text, nullable=True)
    impact_usd = Column(Float, default=45000.0)
