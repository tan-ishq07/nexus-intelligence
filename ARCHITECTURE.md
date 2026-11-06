# NEXUS INTELLIGENCE: Architectural Specification & Implementation Blueprint

> **Tagline:** From fragmented supply chain data to predictive business decisions.  
> **Platform Version:** 1.0.0-ENTERPRISE  
> **Classification:** Commercial Tier-1 Supply Chain Risk Intelligence & Operations Platform

---

## 1. System Architecture Overview

NEXUS INTELLIGENCE is engineered with strict separation of concerns, high-density situational awareness, and modular analytical services.

```
                           ┌────────────────────────────────────────┐
                           │      NEXUS INTELLIGENCE UI (Next.js)   │
                           │  App Router • Tailwind • shadcn/ui     │
                           │  Framer Motion • Recharts • TanStack   │
                           └──────────────────┬─────────────────────┘
                                              │ HTTP / JSON REST
                                              ▼
                           ┌────────────────────────────────────────┐
                           │      FastAPI Gateway (Port 8000)       │
                           │  Pydantic Validation • CORS • Auth/JWT │
                           └──────────────┬──────────────────┬──────┘
                                          │                  │
               ┌──────────────────────────┴────┐    ┌────────┴─────────────────────────┐
               ▼                               ▼    ▼                                  ▼
    ┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
    │  OLTP & Persistence  │        │ Analytical Engine    │        │ ML & Inference Engine│
    │  PostgreSQL/SQLAlchemy│       │ DuckDB In-Memory     │        │ Scikit-learn / Stats │
    │  Star Schema DDL     │        │ Columnar Multi-Cubes │        │ Risk & Delay Models  │
    └──────────────────────┘        └──────────────────────┘        └──────────────────────┘
```

---

## 2. Medallion ETL Ingestion Architecture

```
┌─────────────────────────────────┐
│     BRONZE LAYER (Raw Data)     │
│  • Olist Brazilian E-Commerce   │
│  • M5 Walmart Demand Series     │
│  • Multimodal Logistics JSON    │
│  • Supplier & Facility Records  │
└────────────────┬────────────────┘
                 │
                 ▼  [Validation • Imputation • Outlier IQR • Date Parsing • Dedup]
┌─────────────────────────────────┐
│    SILVER LAYER (Cleaned Data)  │
│  • Schema-validated Parquets    │
│  • Missing value imputation     │
│  • Normalized codes & locations │
│  • Entity Resolution & SCD2     │
└────────────────┬────────────────┘
                 │
                 ▼  [Surrogate Keys • Dimension Joins • Data Quality Certification]
┌─────────────────────────────────┐
│   GOLD LAYER (Curated Star)     │
│  • 5 Fact Tables                │
│  • 7 Conformed Dimensions       │
│  • DuckDB Columnar Views        │
└─────────────────────────────────┘
```

---

## 3. Dimensional Data Warehouse (Star / Snowflake Schema)

### Fact Tables
1. **`fact_orders`**: Commercial purchase transactions derived from Olist e-commerce order logs.
   - Keys: `order_key` (PK), `order_id` (NK), `date_key` (FK), `customer_key` (FK), `product_key` (FK), `warehouse_key` (FK).
   - Measures: `order_quantity`, `unit_price_usd`, `freight_value_usd`, `discount_amount_usd`, `total_amount_usd`.
2. **`fact_shipments`**: Multimodal logistics consignments (Maritime, Air, Rail, Road).
   - Keys: `shipment_key` (PK), `shipment_id` (NK), `departure_date_key` (FK), `delivery_date_key` (FK), `origin_location_key` (FK), `destination_location_key` (FK), `transport_key` (FK), `supplier_key` (FK).
   - Measures: `cargo_value_usd`, `freight_cost_usd`, `transit_time_days`, `delay_hours`, `on_time_flag`.
3. **`fact_inventory`**: Daily warehouse stock snapshots and depletion velocities.
   - Keys: `inventory_snapshot_key` (PK), `date_key` (FK), `warehouse_key` (FK), `product_key` (FK).
   - Measures: `stock_on_hand`, `safety_stock`, `reorder_point`, `days_of_supply`, `inventory_valuation_usd`, `stockout_flag`.
4. **`fact_supplier_performance`**: Monthly supplier delivery and quality audits.
   - Keys: `perf_key` (PK), `date_key` (FK), `supplier_key` (FK), `product_key` (FK).
   - Measures: `total_orders_placed`, `orders_fulfilled_on_time`, `defect_rate_pct`, `lead_time_days`, `compliance_score`.
5. **`fact_demand_forecasts`**: Daily product demand time-series and M5 stochastic forecast bands.
   - Keys: `forecast_key` (PK), `date_key` (FK), `product_key` (FK), `warehouse_key` (FK).
   - Measures: `actual_demand`, `forecast_demand`, `confidence_lower_95`, `confidence_upper_95`, `mape_pct`.

### Dimension Tables & Slowly Changing Dimensions (SCD Type 2)
1. **`dim_date`**: Conformed temporal dimension (`date_key`, `full_date`, `day_of_week`, `day_name`, `month_name`, `quarter`, `year`, `is_weekend`).
2. **`dim_product` (SCD Type 2)**: Core parts catalog (`product_key` PK, `product_id` NK, `product_name`, `category`, `subcategory`, `unit_cost_usd`, `valid_from`, `valid_to`, `is_current`).
3. **`dim_supplier` (SCD Type 2)**: Strategic supplier registry (`supplier_key` PK, `supplier_id` NK, `supplier_name`, `tier`, `category`, `financial_rating`, `risk_score`, `esg_rating`, `valid_from`, `valid_to`, `is_current`).
4. **`dim_customer`**: Customer segmentation (`customer_key` PK, `customer_id` NK, `segment`, `city`, `state`, `credit_limit_usd`).
5. **`dim_warehouse`**: Facility registry (`warehouse_key` PK, `warehouse_id` NK, `facility_type`, `city`, `country`, `region`, `capacity_sqft`, `utilization_pct`).
6. **`dim_location` (Snowflake)**: Normalized geospatial geography (`location_key` PK, `location_id` NK, `city`, `country`, `region`, `latitude`, `longitude`, `port_code`).
7. **`dim_transport`**: Transport modes and carriers (`transport_key` PK, `transport_id` NK, `mode`, `carrier_name`, `service_tier`, `co2_emission_factor`).

---

## 4. DuckDB OLAP Analytical Engine

The platform integrates DuckDB as an in-memory analytical coprocessor:
- **Dynamic Slicing & Dicing**: Whitelisted dimension and measure selection with sub-25ms response latency.
- **Roll-Up & Drill-Down**: Interactive hierarchical traversal across temporal, geographic, and product hierarchies.
- **Pre-Built Comparative Analytics**:
  1. Monthly vs Quarterly Shipment Performance
  2. Supplier Performance by Geographical Region
  3. Product Demand by Warehouse Facility
  4. Logistics Cost by Transportation Mode
  5. Revenue by Product Category and Region

---

## 5. Data Quality Engine & Lineage Tracking

- **Audit Metrics**: Automated computation of Completeness (%), Uniqueness (%), Validity (%), Consistency (%), and Referential Integrity (%).
- **Directed Lineage Graph**: Continuous tracking from Bronze raw files (`.csv`, `.json`), through Silver transformation stages, into Gold curated star schema tables.
- **Quarantine Log**: Real-time identification and staging of anomalies and temporal violations.

---

## 6. Interactive 3D Earth Globe Engine (Three.js WebGL)

The platform provides a GPU-accelerated **Interactive 3D Earth Control Tower** implemented using Three.js WebGL.

### 6.1 Coordinate Transformations & Spherical Math
Geographic coordinates $(\text{lat}, \text{lng})$ in degrees are transformed to Cartesian coordinates $(X, Y, Z)$ on a sphere of radius $R$:
$$\phi = (90 - \text{lat}) \cdot \frac{\pi}{180}, \quad \theta = (\text{lng} + 180) \cdot \frac{\pi}{180}$$
$$X = -R \cdot \sin(\phi) \cdot \cos(\theta)$$
$$Y = R \cdot \cos(\phi)$$
$$Z = R \cdot \sin(\phi) \cdot \sin(\theta)$$

### 6.2 3D Parabolic Geodesic Great-Circle Arcs
Logistics routes between points $P_1$ and $P_2$ are elevated above the Earth's surface using quadratic bezier curves:
$$\text{Mid} = \frac{P_1 + P_2}{2}, \quad \text{Elevation} = \min(35, \|P_1 - P_2\| \cdot 0.28)$$
$$P_{\text{elevated}} = \frac{\text{Mid}}{\|\text{Mid}\|} \cdot (R + \text{Elevation})$$

### 6.3 9 Worldwide Intelligence Layers
1. **Supplier Network**: 3D pins and ground rings with risk-proportional coloration.
2. **Warehouse Network**: 3D hexagonal towers scaled by facility capacity and utilization.
3. **Active Shipments**: White cargo packet particles animating continuously along 3D curves.
4. **Logistics Routes**: Great-Circle curves with status coloring (cyan nominal, amber delayed, red critical).
5. **Supplier Risk Heatmap**: Pulsing volumetric danger discs scaled by holdout risk probability.
6. **Demand Heatmap**: Concentric amber waves highlighting high-velocity retail demand centers.
7. **Inventory Risk Heatmap**: Purple alert beacons at facilities facing stockout exhaustion within 7 days.
8. **Disruption Hotspots**: Pulsing threat rings at Suez, Bab el-Mandeb, Panama, and Taiwan Strait.
9. **Regional Performance**: Multi-region elliptical bounds with live SLA compliance metrics.

### 6.4 Raycasting & Interactivity
- Direct 3D Raycasting (`THREE.Raycaster`) detects pointer hits on pins, towers, and routes.
- Contextual Telemetry Side Panel displays carrier, transit dwell, delay forecast, and satellite telemetry lock.
- Auto-orbit toggle, geographical entity search, and regional theater filters.

---

## 7. Machine Learning & Mining Engine

- **KDD 7-Stage Pipeline**: Selection &rarr; Preprocessing &rarr; Transformation &rarr; Data Mining &rarr; Evaluation &rarr; Persistence &rarr; Presentation.
- **Pattern Mining**: FP-Growth & Apriori implementations (`mlxtend`) generating frequent itemsets, association rules (Support, Confidence, Lift, Conviction), and component co-occurrence topology.
- **Supervised Risk Classification**: 5 models evaluated on 20% stratified holdout split (Decision Tree, Naive Bayes, SVM, Random Forest, Gradient Boosting).
- **Delay Regression & TreeSHAP**: Gradient Boosting and Random Forest regressors with exact TreeSHAP feature attributions.
- **Demand Forecasting**: Multi-Layer Perceptron (MLP) neural network and gradient boosting predicting 14-day horizons and stockout runouts.
- **Anomaly Detection**: Isolation Forest and DBSCAN identifying operational outliers with standard deviation ($\sigma$) distances.
- **Artifact Persistence**: 16 serialized `.joblib` model artifacts maintained in `backend/app/models/saved_models/`.

---

## 8. What-If Scenario Simulator

The Simulator stress-tests operations across 6 crisis archetypes:
1. `supplier_failure`: Strategic Supplier Force Majeure / Insolvency Cascade
2. `warehouse_shutdown`: Central Distribution Hub Catastrophic Outage
3. `demand_spike_30`: +30% Global Unforecasted Demand Surge
4. `transport_cost_surge`: Bunker Fuel & Spot Rate Surge (+140%)
5. `delay_surge`: Multi-Port Terminal Berth Congestion & Dwell Surge
6. `suez_chokepoint_block`: Suez / Bab el-Mandeb Maritime Interruption

- **Stochastic Modeling**: Monte Carlo scaling factoring severity multiplier, duration days, and safety stock drawdown %.
- **Before-vs-After Analytics**: Side-by-side comparative Recharts visualizations comparing baseline nominal metrics against crisis projections.
- **Prescriptive Protocols**: Actionable mitigation playbooks with cost recovery estimates.

---

## 9. Security, Hardening & Multi-Cloud Topology

- **Containerization**: Hardened multi-stage Dockerfiles for Next.js (`output: 'standalone'`) and FastAPI.
- **Orchestration**: `docker-compose.yml` with PostgreSQL 16, healthcheck probes, and isolated bridge networks.
- **Schema Validation**: Pydantic v2 strict typing across all REST endpoints.
- **Cloud Readiness**: Vercel-ready frontend, Render/Railway/Fly.io-ready FastAPI backend.

