import os
import json
import time
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.core.logging import logger
from app.models.warehouse_schema import (
    DimDate,
    DimProduct,
    DimSupplier,
    DimCustomer,
    DimWarehouse,
    DimLocation,
    DimTransport,
    FactOrders,
    FactInventory,
    FactShipments,
    FactSupplierPerformance,
    FactDemandForecasts,
)
from app.services.etl.sample_generator import generate_sample_raw_data
from app.services.etl.transformers import DataTransformer
from app.services.data_quality.quality_engine import quality_engine
from app.services.etl.lineage_tracker import lineage_tracker

class PipelineRunner:
    def __init__(self):
        self.data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
        self.raw_dir = os.path.join(self.data_dir, "raw")
        self.pipeline_logs: List[str] = []
        self.is_running = False
        self.last_run_metrics: Dict[str, Any] = {}

    def log(self, message: str):
        timestamp = datetime.utcnow().strftime("%H:%M:%S")
        entry = f"[{timestamp} UTC] {message}"
        self.pipeline_logs.append(entry)
        logger.info(entry)
        if len(self.pipeline_logs) > 500:
            self.pipeline_logs.pop(0)

    def run_full_etl_pipeline(self) -> Dict[str, Any]:
        start_time = time.time()
        self.is_running = True
        self.log("=====================================================")
        self.log("[START] STARTING NEXUS ENTERPRISE ETL MEDALLION PIPELINE")
        self.log("=====================================================")

        db: Session = SessionLocal()
        total_rows_read = 0
        total_rows_loaded = 0
        errors: List[str] = []

        try:
            # Step 1: Ensure Raw Benchmark Data exists
            self.log("[STAGE 1/4: EXTRACTION] Checking bronze layer datasets...")
            if not os.path.exists(self.raw_dir) or not os.path.exists(os.path.join(self.raw_dir, "olist_orders_sample.csv")):
                self.log("Extracting raw benchmark archives (Olist E-Commerce, M5 Demand, Global Logistics)...")
                generate_sample_raw_data(self.data_dir)

            # Step 2: Ensure Date Dimension is populated
            self.log("[STAGE 2/4: DIMENSIONAL FOUNDATION] Populating DimDate calendar...")
            if db.query(DimDate).count() == 0:
                cur_date = datetime(2026, 1, 1)
                end_date = datetime(2026, 12, 31)
                date_records = []
                while cur_date <= end_date:
                    dk = cur_date.year * 10000 + cur_date.month * 100 + cur_date.day
                    date_records.append(DimDate(
                        date_key=dk,
                        full_date=cur_date.date(),
                        day_of_week=cur_date.isoweekday(),
                        day_name=cur_date.strftime("%A"),
                        day_of_month=cur_date.day,
                        day_of_year=cur_date.timetuple().tm_yday,
                        week_of_year=cur_date.isocalendar()[1],
                        month=cur_date.month,
                        month_name=cur_date.strftime("%B"),
                        quarter=(cur_date.month - 1) // 3 + 1,
                        year=cur_date.year,
                        is_weekend=cur_date.isoweekday() in [6, 7],
                        is_holiday=False
                    ))
                    cur_date += timedelta(days=1)
                db.bulk_save_objects(date_records)
                db.commit()
                self.log(f"DimDate generated: {len(date_records)} temporal keys inserted.")

            # Step 3: Ingest Suppliers -> DimSupplier (SCD Type 2)
            sup_file = os.path.join(self.raw_dir, "suppliers_registry.csv")
            if os.path.exists(sup_file):
                df_sup = pd.read_csv(sup_file)
                total_rows_read += len(df_sup)
                df_sup, _ = DataTransformer.clean_missing_values(df_sup)
                self.log(f"Loaded {len(df_sup)} suppliers from registry. Generating SCD2 surrogate keys...")
                for _, r in df_sup.iterrows():
                    existing = db.query(DimSupplier).filter_by(supplier_id=r["supplier_id"], is_current=True).first()
                    if not existing:
                        db.add(DimSupplier(
                            supplier_id=r["supplier_id"],
                            supplier_name=r["supplier_name"],
                            tier=r["tier"],
                            category=r["category"],
                            country=r["country"],
                            city=r.get("city", ""),
                            financial_rating=float(r["financial_rating"]),
                            risk_score=float(r["risk_score"]),
                            esg_rating=float(r["esg_score"]),
                            delivery_reliability_pct=float(r["delivery_reliability_pct"]),
                            is_current=True
                        ))
                        total_rows_loaded += 1
                db.commit()

            # Step 4: Ingest Warehouses -> DimWarehouse
            wh_file = os.path.join(self.raw_dir, "warehouses_registry.csv")
            if os.path.exists(wh_file):
                df_wh = pd.read_csv(wh_file)
                total_rows_read += len(df_wh)
                self.log(f"Loaded {len(df_wh)} warehouses. Standardizing capacity metrics...")
                for _, r in df_wh.iterrows():
                    if not db.query(DimWarehouse).filter_by(warehouse_id=r["warehouse_id"]).first():
                        db.add(DimWarehouse(
                            warehouse_id=r["warehouse_id"],
                            warehouse_name=r["warehouse_name"],
                            facility_type="Regional Super-Hub",
                            city=r["city"],
                            country=r["country"],
                            region=r["region"],
                            capacity_sqft=int(r["capacity_sqft"]),
                            utilization_pct=float(r["utilization_pct"]),
                            temperature_controlled=bool(r["temperature_controlled"])
                        ))
                        total_rows_loaded += 1
                db.commit()

            # Step 5: Ingest Products -> DimProduct (SCD Type 2)
            prod_file = os.path.join(self.raw_dir, "products_catalog.csv")
            if os.path.exists(prod_file):
                df_prod = pd.read_csv(prod_file)
                total_rows_read += len(df_prod)
                self.log(f"Ingesting {len(df_prod)} product master items into DimProduct...")
                for _, r in df_prod.iterrows():
                    if not db.query(DimProduct).filter_by(product_id=r["product_id"], is_current=True).first():
                        db.add(DimProduct(
                            product_id=r["product_id"],
                            product_name=r["product_name"],
                            category=r["category"],
                            subcategory=r["subcategory"],
                            unit_cost_usd=float(r["unit_cost_usd"]),
                            unit_price_usd=float(r["unit_price_usd"]),
                            weight_kg=float(r["weight_kg"]),
                            volume_cu_m=float(r["volume_cu_m"]),
                            temp_regime=r["temp_regime"],
                            hazard_class=r["hazard_class"],
                            is_current=True
                        ))
                        total_rows_loaded += 1
                db.commit()

            # Step 6: Ingest Customers -> DimCustomer
            cust_file = os.path.join(self.raw_dir, "olist_customers_sample.csv")
            if os.path.exists(cust_file):
                df_cust = pd.read_csv(cust_file)
                total_rows_read += len(df_cust)
                self.log(f"Processing {len(df_cust)} Olist customer records...")
                for _, r in df_cust.iterrows():
                    if not db.query(DimCustomer).filter_by(customer_id=r["customer_id"]).first():
                        db.add(DimCustomer(
                            customer_id=r["customer_id"],
                            customer_name=f"Enterprise Partner {r['customer_id']}",
                            segment=r["segment"],
                            country="Brazil",
                            state=r["customer_state"],
                            city=r["customer_city"],
                            credit_limit_usd=float(r["credit_limit_usd"])
                        ))
                        total_rows_loaded += 1
                db.commit()

            # Step 7: Ingest Transport Modes & Locations
            self.log("[STAGE 3/4: FACT INTEGRATION] Resolving transport corridors and location foreign keys...")
            if db.query(DimTransport).count() == 0:
                transports = [
                    DimTransport(transport_id="TR-OCEAN-STD", mode="Maritime", carrier_name="Ocean Network Express", service_tier="Standard", co2_emission_factor_g_per_ton_km=10.2),
                    DimTransport(transport_id="TR-AIR-EXP", mode="Air", carrier_name="Lufthansa Cargo Heavy", service_tier="Expedited", co2_emission_factor_g_per_ton_km=540.0),
                    DimTransport(transport_id="TR-RAIL-INT", mode="Rail", carrier_name="DB Cargo Intermodal", service_tier="Standard", co2_emission_factor_g_per_ton_km=28.0),
                    DimTransport(transport_id="TR-ROAD-FTL", mode="Road", carrier_name="DHL Freight Linehaul", service_tier="Standard", co2_emission_factor_g_per_ton_km=62.0),
                ]
                db.bulk_save_objects(transports)
                db.commit()

            if db.query(DimLocation).count() == 0:
                locations = [
                    DimLocation(location_id="LOC-RTM", city="Rotterdam", country="Netherlands", region="EMEA", latitude=51.92, longitude=4.48, geopolitical_risk_zone="Low Risk", port_code="NLRTM"),
                    DimLocation(location_id="LOC-SIN", city="Singapore", country="Singapore", region="APAC", latitude=1.35, longitude=103.82, geopolitical_risk_zone="Low Risk", port_code="SGSIN"),
                    DimLocation(location_id="LOC-LGB", city="Long Beach", country="United States", region="North America", latitude=33.77, longitude=-118.19, geopolitical_risk_zone="Low Risk", port_code="USLGB"),
                    DimLocation(location_id="LOC-HSC", city="Hsinchu", country="Taiwan", region="APAC", latitude=24.78, longitude=120.99, geopolitical_risk_zone="Elevated Risk", port_code="TWHSC"),
                    DimLocation(location_id="LOC-KLW", city="Kolwezi", country="DR Congo", region="Africa", latitude=-10.72, longitude=25.47, geopolitical_risk_zone="High Risk", port_code="CDKLW"),
                ]
                db.bulk_save_objects(locations)
                db.commit()

            # Step 8: Load FactOrders
            orders_file = os.path.join(self.raw_dir, "olist_orders_sample.csv")
            if os.path.exists(orders_file) and db.query(FactOrders).count() == 0:
                df_orders = pd.read_csv(orders_file)
                total_rows_read += len(df_orders)
                self.log(f"Executing FactOrders transformations on {len(df_orders)} Olist orders...")

                # Map Natural Keys to Surrogate Keys
                cust_map = {c.customer_id: c.customer_key for c in db.query(DimCustomer).all()}
                prod_map = {p.product_id: p.product_key for p in db.query(DimProduct).filter_by(is_current=True).all()}
                wh_map = {w.warehouse_id: w.warehouse_key for w in db.query(DimWarehouse).all()}

                default_cust = list(cust_map.values())[0] if cust_map else 1
                default_prod = list(prod_map.values())[0] if prod_map else 1
                default_wh = list(wh_map.values())[0] if wh_map else 1

                fact_orders_list = []
                for _, r in df_orders.iterrows():
                    dk = DataTransformer.parse_date_key(r["order_purchase_timestamp"])
                    ck = cust_map.get(r["customer_id"], default_cust)
                    pk = prod_map.get(r["product_id"], default_prod)
                    wk = wh_map.get(r["warehouse_id"], default_wh)
                    qty = int(r["order_quantity"])
                    price = float(r["unit_price"])
                    freight = float(r["freight_value"])
                    discount = float(r.get("discount_amount", 0.0))
                    total = round(qty * price + freight - discount, 2)

                    fact_orders_list.append(FactOrders(
                        order_id=r["order_id"],
                        date_key=dk,
                        customer_key=ck,
                        product_key=pk,
                        warehouse_key=wk,
                        order_quantity=qty,
                        unit_price_usd=price,
                        freight_value_usd=freight,
                        discount_amount_usd=discount,
                        total_amount_usd=total,
                        order_status=r["order_status"]
                    ))
                    total_rows_loaded += 1

                db.bulk_save_objects(fact_orders_list)
                db.commit()
                self.log(f"FactOrders: {len(fact_orders_list)} commercial transactions loaded successfully.")

            # Step 9: Load FactShipments
            shipments_file = os.path.join(self.raw_dir, "supply_chain_shipments.json")
            if os.path.exists(shipments_file) and db.query(FactShipments).count() == 0:
                with open(shipments_file, "r", encoding="utf-8") as f:
                    shipments_json = json.load(f)
                total_rows_read += len(shipments_json)
                self.log(f"Loading {len(shipments_json)} multimodal shipments into FactShipments...")

                sup_map = {s.supplier_id: s.supplier_key for s in db.query(DimSupplier).all()}
                trans_map = {t.mode: t.transport_key for t in db.query(DimTransport).all()}
                locs = db.query(DimLocation).all()
                loc_keys = [l.location_key for l in locs] if locs else [1]

                shipments_list = []
                for s in shipments_json:
                    dep_dk = DataTransformer.parse_date_key(s["departure_date"])
                    del_dk = DataTransformer.parse_date_key(s["actual_delivery_date"])
                    sk = sup_map.get(s["supplier_id"], list(sup_map.values())[0] if sup_map else 1)
                    tk = trans_map.get(s["transport_mode"], list(trans_map.values())[0] if trans_map else 1)

                    shipments_list.append(FactShipments(
                        shipment_id=s["shipment_id"],
                        departure_date_key=dep_dk,
                        delivery_date_key=del_dk,
                        origin_location_key=loc_keys[0],
                        destination_location_key=loc_keys[-1],
                        transport_key=tk,
                        supplier_key=sk,
                        cargo_value_usd=float(s["cargo_value_usd"]),
                        freight_cost_usd=float(s["freight_cost_usd"]),
                        transit_time_days=float(s.get("transit_time_days", 14.0)),
                        delay_hours=float(s["delay_hours"]),
                        on_time_flag=s["delay_hours"] == 0,
                        status=s["status"]
                    ))
                    total_rows_loaded += 1

                db.bulk_save_objects(shipments_list)
                db.commit()
                self.log(f"FactShipments: {len(shipments_list)} logistics movements committed.")

            # Step 10: Load FactInventory & FactDemandForecasts
            inv_file = os.path.join(self.raw_dir, "inventory_ledger.csv")
            if os.path.exists(inv_file) and db.query(FactInventory).count() == 0:
                df_inv = pd.read_csv(inv_file)
                total_rows_read += len(df_inv)
                wh_map = {w.warehouse_id: w.warehouse_key for w in db.query(DimWarehouse).all()}
                prod_map = {p.product_id: p.product_key for p in db.query(DimProduct).filter_by(is_current=True).all()}
                today_dk = DataTransformer.parse_date_key(datetime.today())

                inv_records = []
                for _, r in df_inv.iterrows():
                    wk = wh_map.get(r["warehouse_id"], 1)
                    pk = prod_map.get(r["product_id"], 1)
                    on_hand = int(r["stock_on_hand"])
                    unit_cost = float(r["unit_cost_usd"])
                    inv_records.append(FactInventory(
                        date_key=today_dk,
                        warehouse_key=wk,
                        product_key=pk,
                        stock_on_hand=on_hand,
                        safety_stock=int(r["safety_stock"]),
                        reorder_point=int(r["reorder_point"]),
                        days_of_supply=round((on_hand / max(1, int(r["safety_stock"]))) * 14, 1),
                        inventory_valuation_usd=round(on_hand * unit_cost, 2),
                        stockout_flag=on_hand < int(r["safety_stock"])
                    ))
                    total_rows_loaded += 1
                db.bulk_save_objects(inv_records)
                db.commit()
                self.log(f"FactInventory: {len(inv_records)} warehouse inventory snapshot records written.")

            # Step 11: Audit Data Quality
            self.log("[STAGE 4/4: DATA QUALITY CERTIFICATION] Running Data Quality Engine...")
            orders_df = pd.read_sql("SELECT * FROM fact_orders", db.bind)
            dq_metrics = quality_engine.audit_dataframe(orders_df, "fact_orders", ["order_id"])
            self.log(f"Data Quality Certification: Score={dq_metrics['overall_health_score']}% (Completeness={dq_metrics['completeness_score']}%, Validity={dq_metrics['validity_score']}%)")

            duration = round(time.time() - start_time, 2)
            self.log(f"[SUCCESS] ETL PIPELINE COMPLETED SUCCESSFULLY in {duration}s. Loaded {total_rows_loaded} rows.")

            # Log to Lineage Tracker
            exec_record = lineage_tracker.log_execution(
                pipeline_id="PIPE-MEDALLION-MASTER",
                status="SUCCESS",
                duration_ms=duration * 1000,
                rows_in=total_rows_read,
                rows_out=total_rows_loaded,
                errors=[]
            )

            self.last_run_metrics = {
                "status": "COMPLETED",
                "execution_id": exec_record["execution_id"],
                "duration_seconds": duration,
                "rows_extracted": total_rows_read,
                "rows_loaded": total_rows_loaded,
                "data_quality_score": dq_metrics["overall_health_score"],
                "timestamp": datetime.utcnow().isoformat()
            }
            return self.last_run_metrics

        except Exception as e:
            duration = round(time.time() - start_time, 2)
            err_msg = f"ETL Pipeline Execution Failure: {str(e)}"
            self.log(f"[ERROR] {err_msg}")
            lineage_tracker.log_execution(
                pipeline_id="PIPE-MEDALLION-MASTER",
                status="FAILED",
                duration_ms=duration * 1000,
                rows_in=total_rows_read,
                rows_out=total_rows_loaded,
                errors=[err_msg]
            )
            self.last_run_metrics = {
                "status": "FAILED",
                "error": str(e),
                "duration_seconds": duration,
                "timestamp": datetime.utcnow().isoformat()
            }
            raise e
        finally:
            self.is_running = False
            db.close()

pipeline_runner = PipelineRunner()
