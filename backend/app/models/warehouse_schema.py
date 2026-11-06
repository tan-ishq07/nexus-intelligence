from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Text, ForeignKey, Index
from sqlalchemy.sql import func
from app.core.database import Base

# ==========================================
# 1. DIMENSION TABLES (Star / Snowflake)
# ==========================================

class DimDate(Base):
    __tablename__ = "dim_date"

    date_key = Column(Integer, primary_key=True) # e.g. 20261106
    full_date = Column(Date, nullable=False, unique=True, index=True)
    day_of_week = Column(Integer, nullable=False) # 1-7
    day_name = Column(String(16), nullable=False) # Monday, etc.
    day_of_month = Column(Integer, nullable=False)
    day_of_year = Column(Integer, nullable=False)
    week_of_year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False) # 1-12
    month_name = Column(String(16), nullable=False)
    quarter = Column(Integer, nullable=False) # 1-4
    year = Column(Integer, nullable=False)
    is_weekend = Column(Boolean, default=False)
    is_holiday = Column(Boolean, default=False)

class DimProduct(Base):
    __tablename__ = "dim_product"

    product_key = Column(Integer, primary_key=True, autoincrement=True) # Surrogate Key
    product_id = Column(String(64), index=True, nullable=False) # Natural Key
    product_name = Column(String(255), nullable=False)
    category = Column(String(128), index=True)
    subcategory = Column(String(128))
    unit_cost_usd = Column(Float, default=0.0)
    unit_price_usd = Column(Float, default=0.0)
    weight_kg = Column(Float, default=0.0)
    volume_cu_m = Column(Float, default=0.0)
    temp_regime = Column(String(64), default="Ambient")
    hazard_class = Column(String(64), default="Non-Hazardous")
    # SCD Type 2 tracking
    valid_from = Column(DateTime(timezone=True), server_default=func.now())
    valid_to = Column(DateTime(timezone=True), nullable=True)
    is_current = Column(Boolean, default=True, index=True)

class DimSupplier(Base):
    __tablename__ = "dim_supplier"

    supplier_key = Column(Integer, primary_key=True, autoincrement=True) # Surrogate Key
    supplier_id = Column(String(64), index=True, nullable=False) # Natural Key
    supplier_name = Column(String(255), nullable=False)
    tier = Column(String(32), default="Tier 1", index=True)
    category = Column(String(128))
    country = Column(String(128), index=True)
    city = Column(String(128))
    financial_rating = Column(Float, default=85.0)
    risk_score = Column(Float, default=25.0)
    esg_rating = Column(Float, default=80.0)
    delivery_reliability_pct = Column(Float, default=95.0)
    # SCD Type 2 tracking
    valid_from = Column(DateTime(timezone=True), server_default=func.now())
    valid_to = Column(DateTime(timezone=True), nullable=True)
    is_current = Column(Boolean, default=True, index=True)

class DimCustomer(Base):
    __tablename__ = "dim_customer"

    customer_key = Column(Integer, primary_key=True, autoincrement=True) # Surrogate Key
    customer_id = Column(String(64), index=True, nullable=False) # Natural Key
    customer_name = Column(String(255), nullable=False)
    segment = Column(String(64), default="Commercial", index=True) # Enterprise, Commercial, Retail
    country = Column(String(128), default="Brazil")
    state = Column(String(64))
    city = Column(String(128))
    credit_limit_usd = Column(Float, default=100000.0)

class DimWarehouse(Base):
    __tablename__ = "dim_warehouse"

    warehouse_key = Column(Integer, primary_key=True, autoincrement=True) # Surrogate Key
    warehouse_id = Column(String(64), index=True, nullable=False) # Natural Key
    warehouse_name = Column(String(255), nullable=False)
    facility_type = Column(String(64), default="Super-Hub")
    city = Column(String(128), nullable=False)
    country = Column(String(128), nullable=False)
    region = Column(String(64), index=True) # EMEA, APAC, North America, LATAM
    capacity_sqft = Column(Integer, default=500000)
    utilization_pct = Column(Float, default=80.0)
    temperature_controlled = Column(Boolean, default=True)

class DimLocation(Base):
    __tablename__ = "dim_location"

    location_key = Column(Integer, primary_key=True, autoincrement=True) # Surrogate Key
    location_id = Column(String(64), index=True, nullable=False)
    city = Column(String(128))
    state_province = Column(String(128))
    country = Column(String(128), index=True)
    region = Column(String(64), index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    geopolitical_risk_zone = Column(String(64), default="Low Risk")
    port_code = Column(String(32), nullable=True)

class DimTransport(Base):
    __tablename__ = "dim_transport"

    transport_key = Column(Integer, primary_key=True, autoincrement=True) # Surrogate Key
    transport_id = Column(String(64), index=True, nullable=False)
    mode = Column(String(64), index=True) # Maritime, Air, Rail, Road
    carrier_name = Column(String(128), index=True)
    service_tier = Column(String(64), default="Standard")
    co2_emission_factor_g_per_ton_km = Column(Float, default=15.0)

# ==========================================
# 2. FACT TABLES (Star Schema)
# ==========================================

class FactOrders(Base):
    __tablename__ = "fact_orders"

    order_key = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(64), index=True, nullable=False)
    date_key = Column(Integer, ForeignKey("dim_date.date_key"), index=True)
    customer_key = Column(Integer, ForeignKey("dim_customer.customer_key"), index=True)
    product_key = Column(Integer, ForeignKey("dim_product.product_key"), index=True)
    warehouse_key = Column(Integer, ForeignKey("dim_warehouse.warehouse_key"), index=True)
    order_quantity = Column(Integer, default=1)
    unit_price_usd = Column(Float, default=0.0)
    freight_value_usd = Column(Float, default=0.0)
    discount_amount_usd = Column(Float, default=0.0)
    total_amount_usd = Column(Float, default=0.0)
    order_status = Column(String(32), default="delivered", index=True)

class FactInventory(Base):
    __tablename__ = "fact_inventory"

    inventory_snapshot_key = Column(Integer, primary_key=True, autoincrement=True)
    date_key = Column(Integer, ForeignKey("dim_date.date_key"), index=True)
    warehouse_key = Column(Integer, ForeignKey("dim_warehouse.warehouse_key"), index=True)
    product_key = Column(Integer, ForeignKey("dim_product.product_key"), index=True)
    stock_on_hand = Column(Integer, default=0)
    safety_stock = Column(Integer, default=0)
    reorder_point = Column(Integer, default=0)
    days_of_supply = Column(Float, default=30.0)
    inventory_valuation_usd = Column(Float, default=0.0)
    stockout_flag = Column(Boolean, default=False, index=True)

class FactShipments(Base):
    __tablename__ = "fact_shipments"

    shipment_key = Column(Integer, primary_key=True, autoincrement=True)
    shipment_id = Column(String(64), index=True, nullable=False)
    departure_date_key = Column(Integer, ForeignKey("dim_date.date_key"), index=True)
    delivery_date_key = Column(Integer, ForeignKey("dim_date.date_key"), index=True, nullable=True)
    origin_location_key = Column(Integer, ForeignKey("dim_location.location_key"), index=True)
    destination_location_key = Column(Integer, ForeignKey("dim_location.location_key"), index=True)
    transport_key = Column(Integer, ForeignKey("dim_transport.transport_key"), index=True)
    supplier_key = Column(Integer, ForeignKey("dim_supplier.supplier_key"), index=True)
    cargo_value_usd = Column(Float, default=0.0)
    freight_cost_usd = Column(Float, default=0.0)
    transit_time_days = Column(Float, default=0.0)
    delay_hours = Column(Float, default=0.0)
    on_time_flag = Column(Boolean, default=True, index=True)
    status = Column(String(32), default="Delivered", index=True)

class FactSupplierPerformance(Base):
    __tablename__ = "fact_supplier_performance"

    perf_key = Column(Integer, primary_key=True, autoincrement=True)
    date_key = Column(Integer, ForeignKey("dim_date.date_key"), index=True)
    supplier_key = Column(Integer, ForeignKey("dim_supplier.supplier_key"), index=True)
    product_key = Column(Integer, ForeignKey("dim_product.product_key"), index=True)
    total_orders_placed = Column(Integer, default=10)
    orders_fulfilled_on_time = Column(Integer, default=9)
    defect_rate_pct = Column(Float, default=0.8)
    lead_time_days = Column(Float, default=21.0)
    lead_time_variance_days = Column(Float, default=1.8)
    compliance_score = Column(Float, default=96.5)

class FactDemandForecasts(Base):
    __tablename__ = "fact_demand_forecasts"

    forecast_key = Column(Integer, primary_key=True, autoincrement=True)
    date_key = Column(Integer, ForeignKey("dim_date.date_key"), index=True)
    product_key = Column(Integer, ForeignKey("dim_product.product_key"), index=True)
    warehouse_key = Column(Integer, ForeignKey("dim_warehouse.warehouse_key"), index=True)
    actual_demand = Column(Float, default=0.0)
    forecast_demand = Column(Float, default=0.0)
    confidence_lower_95 = Column(Float, default=0.0)
    confidence_upper_95 = Column(Float, default=0.0)
    forecast_bias = Column(Float, default=0.0)
    mape_pct = Column(Float, default=4.5)
