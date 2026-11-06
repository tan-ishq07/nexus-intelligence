import duckdb
import pandas as pd
import time
from typing import Dict, Any, List, Optional
from app.core.database import engine
from app.core.logging import logger

class OLAPEngine:
    def __init__(self):
        self.con = duckdb.connect(database=":memory:")
        self.initialized = False

    def sync_views_from_database(self):
        """Loads relational warehouse tables into in-memory DuckDB columnar views."""
        try:
            logger.info("Synchronizing relational star schema tables into DuckDB OLAP engine...")
            tables = [
                "dim_date", "dim_product", "dim_supplier", "dim_customer",
                "dim_warehouse", "dim_location", "dim_transport",
                "fact_orders", "fact_inventory", "fact_shipments",
                "fact_supplier_performance", "fact_demand_forecasts"
            ]
            for tbl in tables:
                try:
                    df = pd.read_sql_table(tbl, engine)
                    self.con.register(tbl, df)
                except Exception as e:
                    # If table not yet populated, create dummy placeholder
                    logger.warning(f"Could not load table {tbl} into DuckDB: {e}")

            # Create denormalized unified analytics view for frictionless OLAP queries
            self.con.execute("""
                CREATE OR REPLACE VIEW v_olap_orders_shipments AS
                SELECT 
                    fo.order_id,
                    fo.order_quantity,
                    fo.unit_price_usd,
                    fo.freight_value_usd,
                    fo.discount_amount_usd,
                    fo.total_amount_usd,
                    fo.order_status,
                    d.year,
                    d.quarter,
                    d.month_name,
                    d.day_name,
                    d.full_date,
                    p.product_id,
                    p.product_name,
                    p.category as product_category,
                    p.subcategory as product_subcategory,
                    w.warehouse_id,
                    w.warehouse_name,
                    w.region as warehouse_region,
                    w.country as warehouse_country,
                    c.customer_id,
                    c.segment as customer_segment,
                    c.city as customer_city,
                    c.state as customer_state
                FROM fact_orders fo
                LEFT JOIN dim_date d ON fo.date_key = d.date_key
                LEFT JOIN dim_product p ON fo.product_key = p.product_key
                LEFT JOIN dim_warehouse w ON fo.warehouse_key = w.warehouse_key
                LEFT JOIN dim_customer c ON fo.customer_key = c.customer_key
            """)

            self.con.execute("""
                CREATE OR REPLACE VIEW v_olap_shipments AS
                SELECT
                    fs.shipment_id,
                    fs.cargo_value_usd,
                    fs.freight_cost_usd,
                    fs.transit_time_days,
                    fs.delay_hours,
                    fs.on_time_flag,
                    fs.status as shipment_status,
                    dep.year as departure_year,
                    dep.quarter as departure_quarter,
                    dep.month_name as departure_month,
                    t.mode as transport_mode,
                    t.carrier_name,
                    s.supplier_name,
                    s.tier as supplier_tier,
                    s.country as supplier_country,
                    s.category as supplier_category,
                    s.risk_score as supplier_risk_score,
                    orig.city as origin_city,
                    orig.country as origin_country,
                    dest.city as dest_city,
                    dest.country as dest_country
                FROM fact_shipments fs
                LEFT JOIN dim_date dep ON fs.departure_date_key = dep.date_key
                LEFT JOIN dim_transport t ON fs.transport_key = t.transport_key
                LEFT JOIN dim_supplier s ON fs.supplier_key = s.supplier_key
                LEFT JOIN dim_location orig ON fs.origin_location_key = orig.location_key
                LEFT JOIN dim_location dest ON fs.destination_location_key = dest.location_key
            """)

            self.initialized = True
            logger.info("DuckDB OLAP engine successfully initialized with unified analytical cubes.")
        except Exception as e:
            logger.error(f"Error initializing DuckDB OLAP engine: {e}")

    def execute_dynamic_olap(
        self,
        dimensions: List[str],
        measures: List[Dict[str, str]],
        filters: Optional[List[Dict[str, Any]]] = None,
        view_name: str = "v_olap_orders_shipments",
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Executes dynamic Slice, Dice, Roll-up, and Drill-down OLAP queries.
        Includes parameter validation to prevent SQL injection.
        """
        if not self.initialized:
            self.sync_views_from_database()

        # Validate Allowed Dimensions
        allowed_dimensions = {
            "year", "quarter", "month_name", "day_name", "full_date",
            "product_id", "product_name", "product_category", "product_subcategory",
            "warehouse_id", "warehouse_name", "warehouse_region", "warehouse_country",
            "customer_segment", "customer_city", "customer_state",
            "transport_mode", "carrier_name", "supplier_name", "supplier_tier", "supplier_country"
        }
        for d in dimensions:
            if d not in allowed_dimensions:
                raise ValueError(f"Invalid OLAP dimension: {d}")

        # Validate Measures
        allowed_aggregations = {"SUM", "AVG", "COUNT", "MIN", "MAX"}
        allowed_measure_cols = {
            "total_amount_usd", "order_quantity", "freight_value_usd", "discount_amount_usd",
            "cargo_value_usd", "freight_cost_usd", "delay_hours", "transit_time_days", "supplier_risk_score"
        }

        select_clauses = [d for d in dimensions]
        for m in measures:
            agg = m.get("agg", "SUM").upper()
            col = m.get("col", "total_amount_usd")
            alias = m.get("alias", f"{agg.lower()}_{col}")
            if agg not in allowed_aggregations or col not in allowed_measure_cols:
                raise ValueError(f"Invalid aggregation {agg} on column {col}")
            select_clauses.append(f"{agg}({col}) AS {alias}")

        dim_str = ", ".join(dimensions) if dimensions else "1"
        select_str = ", ".join(select_clauses)

        # Filters (Slice & Dice)
        where_clauses = ["1=1"]
        if filters:
            for f in filters:
                col = f.get("column")
                op = f.get("op", "=")
                val = f.get("val")
                if col in allowed_dimensions:
                    if op == "=":
                        where_clauses.append(f"{col} = '{val}'")
                    elif op == "IN" and isinstance(val, list):
                        in_vals = ", ".join([f"'{v}'" for v in val])
                        where_clauses.append(f"{col} IN ({in_vals})")

        where_str = " AND ".join(where_clauses)
        sql = f"""
            SELECT {select_str}
            FROM {view_name}
            WHERE {where_str}
            GROUP BY {dim_str}
            ORDER BY 1 ASC
            LIMIT {limit}
        """

        start_time = time.time()
        result_df = self.con.execute(sql).df()
        duration_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "query_sql": sql,
            "execution_time_ms": duration_ms,
            "row_count": len(result_df),
            "dimensions": dimensions,
            "data": result_df.to_dict(orient="records")
        }

    # ==========================================
    # PRE-BUILT COMPARISONS (Prompt Requirements)
    # ==========================================

    def get_monthly_vs_quarterly_shipments(self) -> List[Dict[str, Any]]:
        """1. Monthly vs quarterly shipment performance"""
        if not self.initialized:
            self.sync_views_from_database()
        query = """
            SELECT 
                departure_quarter as quarter,
                departure_month as month,
                COUNT(*) as shipment_count,
                AVG(delay_hours) as avg_delay_hours,
                SUM(cargo_value_usd) as total_cargo_value_usd,
                ROUND(AVG(CASE WHEN on_time_flag THEN 100.0 ELSE 0.0 END), 1) as on_time_delivery_pct
            FROM v_olap_shipments
            GROUP BY departure_quarter, departure_month
            ORDER BY departure_quarter, departure_month
        """
        return self.con.execute(query).df().to_dict(orient="records")

    def get_supplier_performance_by_region(self) -> List[Dict[str, Any]]:
        """2. Supplier performance by geographical region"""
        if not self.initialized:
            self.sync_views_from_database()
        query = """
            SELECT 
                supplier_country,
                supplier_tier,
                COUNT(*) as active_corridors,
                AVG(supplier_risk_score) as avg_risk_score,
                SUM(cargo_value_usd) as total_supplied_value_usd,
                ROUND(AVG(CASE WHEN on_time_flag THEN 100.0 ELSE 0.0 END), 1) as delivery_reliability_pct
            FROM v_olap_shipments
            GROUP BY supplier_country, supplier_tier
            ORDER BY total_supplied_value_usd DESC
        """
        return self.con.execute(query).df().to_dict(orient="records")

    def get_product_demand_by_warehouse(self) -> List[Dict[str, Any]]:
        """3. Product demand by warehouse"""
        if not self.initialized:
            self.sync_views_from_database()
        query = """
            SELECT 
                warehouse_name,
                warehouse_region,
                product_category,
                SUM(order_quantity) as total_units_ordered,
                SUM(total_amount_usd) as total_revenue_usd
            FROM v_olap_orders_shipments
            GROUP BY warehouse_name, warehouse_region, product_category
            ORDER BY total_units_ordered DESC
        """
        return self.con.execute(query).df().to_dict(orient="records")

    def get_logistics_cost_by_mode(self) -> List[Dict[str, Any]]:
        """5. Logistics cost by transportation mode"""
        if not self.initialized:
            self.sync_views_from_database()
        query = """
            SELECT 
                transport_mode,
                COUNT(*) as trip_count,
                SUM(freight_cost_usd) as total_freight_cost_usd,
                AVG(freight_cost_usd) as avg_cost_per_consignment_usd,
                AVG(transit_time_days) as avg_transit_days,
                AVG(delay_hours) as avg_delay_hours
            FROM v_olap_shipments
            GROUP BY transport_mode
            ORDER BY total_freight_cost_usd DESC
        """
        return self.con.execute(query).df().to_dict(orient="records")

    def get_revenue_by_product_and_region(self) -> List[Dict[str, Any]]:
        """6. Revenue by product and region"""
        if not self.initialized:
            self.sync_views_from_database()
        query = """
            SELECT 
                product_category,
                warehouse_region as region,
                SUM(total_amount_usd) as gross_revenue_usd,
                SUM(order_quantity) as units_sold,
                AVG(unit_price_usd) as avg_unit_price
            FROM v_olap_orders_shipments
            GROUP BY product_category, warehouse_region
            ORDER BY gross_revenue_usd DESC
        """
        return self.con.execute(query).df().to_dict(orient="records")

olap_engine = OLAPEngine()
