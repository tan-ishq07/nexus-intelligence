# NEXUS INTELLIGENCE: Data Catalog & Ingestion Specifications

## 1. Overview & Provenance

The NEXUS INTELLIGENCE ingestion framework integrates structured operational data from e-commerce, global manufacturing, maritime shipping, and retail forecasting. 

### Data Sources & Provenance

| Source Identifier | Domain | Origin & Format | License / Attribution | Integration Role |
|---|---|---|---|---|
| `olist_orders_sample.csv` | Orders & Payments | Olist Brazilian E-Commerce Public Dataset (CSV) | CC BY-NC-SA 4.0 (Olist & Kaggle) | Real-world customer orders, payments, order statuses, and delivery times |
| `olist_customers_sample.csv` | Customer Demographics | Olist Brazilian E-Commerce Public Dataset (CSV) | CC BY-NC-SA 4.0 | Customer locations, geographic coordinates, and segmentation |
| `m5_demand_sample.csv` | Daily Retail Demand | M5 Forecasting Competition (Walmart / Kaggle) | Public Competition License | Daily product unit demand time-series and pricing fluctuations |
| `supply_chain_shipments.json` | Multimodal Logistics | Global Supply Chain Logistics Telemetry (JSON) | Curated Enterprise Benchmark | Real-time maritime, air, and ground consignment tracking |
| `suppliers_registry.csv` | Semiconductor & Minerals | Tier-1/2/3 Strategic Supplier Database (CSV) | Curated Enterprise Benchmark | Financial health, ESG scores, geopolitical ratings |
| `warehouses_registry.csv` | Storage Network | Global Distribution Centers & Super-Hubs (CSV) | Curated Enterprise Benchmark | Facility square footage, climate control, handling throughput |
| `inventory_ledger.csv` | Stock & Safety Stock | Multi-Warehouse SKU Inventory Balances (CSV) | Curated Enterprise Benchmark | Stock on hand, reorder points, lead times |
| `disruption_events.json` | External Disruption | Global Maritime & Weather Advisories (JSON) | NOAA / Maritime Feeds Benchmark | Chokepoint closures, severe weather, labor strikes |

*Note: Datasets derived or adapted from public research corpora are enriched with synthetic cross-references using automated entity resolution to model genuine enterprise multi-tier supply networks.*

---

## 2. Ingestion Architecture: Medallion Flow

1. **Bronze Layer (`raw/`)**: Original files stored verbatim (CSV, JSON, XML).
2. **Silver Layer (`cleaned/`)**: Schema validation, missing value imputation, type casting, outlier mitigation, and surrogate key generation.
3. **Gold Layer (`curated/`)**: PostgreSQL / DuckDB star schema fact and dimension tables optimized for zero-latency OLAP queries.
