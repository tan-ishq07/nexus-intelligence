import os
import json
import csv
from datetime import datetime, timedelta
import random

def generate_sample_raw_data(data_dir: str):
    raw_dir = os.path.join(data_dir, "raw")
    os.makedirs(raw_dir, exist_ok=True)
    random.seed(42)

    # 1. Suppliers Registry
    suppliers_path = os.path.join(raw_dir, "suppliers_registry.csv")
    suppliers = [
        {"supplier_id": "SUP-TSMC-01", "supplier_name": "Taiwan Semiconductor Mfg Co", "tier": "Tier 1", "category": "Semiconductors", "country": "Taiwan", "city": "Hsinchu", "financial_rating": 98.0, "risk_score": 38.5, "esg_score": 88.0, "delivery_reliability_pct": 97.4},
        {"supplier_id": "SUP-ASML-02", "supplier_name": "ASML Lithography Systems", "tier": "Tier 1", "category": "Photolithography Core", "country": "Netherlands", "city": "Veldhoven", "financial_rating": 99.5, "risk_score": 14.2, "esg_score": 94.0, "delivery_reliability_pct": 99.1},
        {"supplier_id": "SUP-SMSNG-03", "supplier_name": "Samsung Foundry Electronics", "tier": "Tier 1", "category": "Memory & Logic", "country": "South Korea", "city": "Suwon", "financial_rating": 96.0, "risk_score": 26.0, "esg_score": 82.0, "delivery_reliability_pct": 95.8},
        {"supplier_id": "SUP-BSCH-04", "supplier_name": "Bosch Global Powertrain & Sensor", "tier": "Tier 1", "category": "Automotive Telematics", "country": "Germany", "city": "Stuttgart", "financial_rating": 92.0, "risk_score": 19.8, "esg_score": 91.0, "delivery_reliability_pct": 96.5},
        {"supplier_id": "SUP-FXCN-05", "supplier_name": "Foxconn Precision Electronics", "tier": "Tier 2", "category": "Sub-Assembly Systems", "country": "China", "city": "Shenzhen", "financial_rating": 88.0, "risk_score": 44.0, "esg_score": 70.0, "delivery_reliability_pct": 91.2},
        {"supplier_id": "SUP-INF-06", "supplier_name": "Infineon Technologies Silicon", "tier": "Tier 1", "category": "Power Semiconductors", "country": "Germany", "city": "Dresden", "financial_rating": 94.0, "risk_score": 16.5, "esg_score": 89.0, "delivery_reliability_pct": 98.2},
        {"supplier_id": "SUP-TI-09", "supplier_name": "Texas Instruments Analog", "tier": "Tier 1", "category": "Embedded Processors", "country": "United States", "city": "Dallas", "financial_rating": 98.5, "risk_score": 11.0, "esg_score": 88.0, "delivery_reliability_pct": 99.0},
        {"supplier_id": "SUP-VMNT-11", "supplier_name": "Valemount Rare Earth Extractor", "tier": "Tier 3", "category": "Neodymium & Dysprosium", "country": "DR Congo", "city": "Kolwezi", "financial_rating": 64.0, "risk_score": 82.5, "esg_score": 52.0, "delivery_reliability_pct": 78.4},
        {"supplier_id": "SUP-NLR-12", "supplier_name": "Nordic Lithium Refining AB", "tier": "Tier 2", "category": "Battery Chemical Grade", "country": "Sweden", "city": "Skellefteå", "financial_rating": 89.0, "risk_score": 18.0, "esg_score": 96.0, "delivery_reliability_pct": 95.0}
    ]
    with open(suppliers_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(suppliers[0].keys()))
        writer.writeheader()
        writer.writerows(suppliers)

    # 2. Warehouses Registry
    warehouses_path = os.path.join(raw_dir, "warehouses_registry.csv")
    warehouses = [
        {"warehouse_id": "WH-RTM-01", "warehouse_name": "Rotterdam Europort Super-Hub", "city": "Rotterdam", "country": "Netherlands", "region": "EMEA", "capacity_sqft": 850000, "utilization_pct": 84.5, "temperature_controlled": True, "daily_throughput": 75000},
        {"warehouse_id": "WH-SIN-02", "warehouse_name": "Singapore Tuas Logistics Gateway", "city": "Singapore", "country": "Singapore", "region": "APAC", "capacity_sqft": 1100000, "utilization_pct": 91.2, "temperature_controlled": True, "daily_throughput": 95000},
        {"warehouse_id": "WH-LGB-03", "warehouse_name": "Long Beach Port Complex Terminal", "city": "Long Beach", "country": "United States", "region": "North America", "capacity_sqft": 920000, "utilization_pct": 79.8, "temperature_controlled": True, "daily_throughput": 82000},
        {"warehouse_id": "WH-HAM-04", "warehouse_name": "Hamburg Logistics City Hub", "city": "Hamburg", "country": "Germany", "region": "EMEA", "capacity_sqft": 650000, "utilization_pct": 76.0, "temperature_controlled": False, "daily_throughput": 52000},
        {"warehouse_id": "WH-DXB-05", "warehouse_name": "Dubai Jebel Ali Freezone Hub", "city": "Dubai", "country": "United Arab Emirates", "region": "Middle East", "capacity_sqft": 780000, "utilization_pct": 73.4, "temperature_controlled": True, "daily_throughput": 64000},
        {"warehouse_id": "WH-ORD-06", "warehouse_name": "Chicago O'Hare Intermodal Logistics", "city": "Chicago", "country": "United States", "region": "North America", "capacity_sqft": 700000, "utilization_pct": 82.0, "temperature_controlled": True, "daily_throughput": 58000}
    ]
    with open(warehouses_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(warehouses[0].keys()))
        writer.writeheader()
        writer.writerows(warehouses)

    # 3. Olist Customers Sample
    customers_path = os.path.join(raw_dir, "olist_customers_sample.csv")
    customers = []
    cities_states = [("Sao Paulo", "SP"), ("Rio de Janeiro", "RJ"), ("Belo Horizonte", "MG"), ("Curitiba", "PR"), ("Porto Alegre", "RS"), ("Salvador", "BA")]
    segments = ["Enterprise", "Commercial", "Direct Retail"]
    for i in range(1, 101):
        city, state = random.choice(cities_states)
        customers.append({
            "customer_id": f"CUST-{i:05d}",
            "customer_unique_id": f"UID-{random.randint(100000, 999999)}",
            "customer_zip_code_prefix": f"{random.randint(10000, 99999)}",
            "customer_city": city,
            "customer_state": state,
            "segment": random.choice(segments),
            "credit_limit_usd": round(random.uniform(50000, 500000), 2)
        })
    with open(customers_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(customers[0].keys()))
        writer.writeheader()
        writer.writerows(customers)

    # 4. Products Master
    products = [
        {"product_id": "PRD-SOC-3NM", "product_name": "3nm Neural Engine SoC Gen 4", "category": "Advanced Processors", "subcategory": "Silicon AI", "unit_cost_usd": 850.0, "unit_price_usd": 1280.0, "weight_kg": 0.08, "volume_cu_m": 0.0002, "temp_regime": "Ambient", "hazard_class": "Non-Hazardous"},
        {"product_id": "PRD-HBM-24G", "product_name": "HBM3e Stacked Memory Die 24GB", "category": "Memory Systems", "subcategory": "High Bandwidth Memory", "unit_cost_usd": 320.0, "unit_price_usd": 510.0, "weight_kg": 0.05, "volume_cu_m": 0.0001, "temp_regime": "Ambient", "hazard_class": "Non-Hazardous"},
        {"product_id": "PRD-EUV-MEM", "product_name": "EUV Pellicle Ultra-Pure Membrane", "category": "Fabrication Consumables", "subcategory": "Photolithography Optics", "unit_cost_usd": 14500.0, "unit_price_usd": 22000.0, "weight_kg": 1.2, "volume_cu_m": 0.015, "temp_regime": "Climate Controlled", "hazard_class": "Class 9"},
        {"product_id": "PRD-SIC-120", "product_name": "Silicon Carbide Power MOSFET 1200V", "category": "Power Electrification", "subcategory": "EV Inverter Core", "unit_cost_usd": 45.0, "unit_price_usd": 78.0, "weight_kg": 0.15, "volume_cu_m": 0.0004, "temp_regime": "Ambient", "hazard_class": "Non-Hazardous"},
        {"product_id": "PRD-NEO-MAG", "product_name": "Neodymium-Dysprosium Sintered Magnet", "category": "Rare Earth Materials", "subcategory": "Permanent Magnetic Alloys", "unit_cost_usd": 180.0, "unit_price_usd": 290.0, "weight_kg": 2.5, "volume_cu_m": 0.002, "temp_regime": "Ambient", "hazard_class": "Class 4.1"},
        {"product_id": "PRD-LITH-BAT", "product_name": "Cathode Grade Lithium Hydroxide Purity 99.5%", "category": "Chemical Feedstock", "subcategory": "Battery Energy", "unit_cost_usd": 38.0, "unit_price_usd": 62.0, "weight_kg": 25.0, "volume_cu_m": 0.04, "temp_regime": "Dry Sealed", "hazard_class": "Class 8"}
    ]
    products_path = os.path.join(raw_dir, "products_catalog.csv")
    with open(products_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(products[0].keys()))
        writer.writeheader()
        writer.writerows(products)

    # 5. Olist Orders Sample
    orders_path = os.path.join(raw_dir, "olist_orders_sample.csv")
    orders = []
    base_date = datetime(2026, 9, 1)
    statuses = ["delivered", "shipped", "processing", "in_transit", "delivered", "delivered"]
    for i in range(1, 251):
        order_date = base_date + timedelta(days=random.randint(0, 60), hours=random.randint(1, 23))
        delivered_date = order_date + timedelta(days=random.randint(2, 18)) if random.random() > 0.15 else None
        prod = random.choice(products)
        qty = random.randint(1, 20)
        orders.append({
            "order_id": f"ORD-2026-{i:05d}",
            "customer_id": f"CUST-{random.randint(1, 100):05d}",
            "product_id": prod["product_id"],
            "warehouse_id": random.choice(warehouses)["warehouse_id"],
            "order_status": random.choice(statuses),
            "order_purchase_timestamp": order_date.strftime("%Y-%m-%d %H:%M:%S"),
            "order_delivered_customer_date": delivered_date.strftime("%Y-%m-%d %H:%M:%S") if delivered_date else "",
            "order_quantity": qty,
            "unit_price": prod["unit_price_usd"],
            "freight_value": round(random.uniform(25, 450), 2),
            "discount_amount": round(prod["unit_price_usd"] * qty * random.uniform(0, 0.1), 2)
        })
    with open(orders_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(orders[0].keys()))
        writer.writeheader()
        writer.writerows(orders)

    # 6. M5 Retail Demand Sample
    m5_path = os.path.join(raw_dir, "m5_demand_sample.csv")
    m5_records = []
    date_start = datetime(2026, 10, 1)
    for prod in products[:4]:
        for day in range(35):
            cur_date = date_start + timedelta(days=day)
            wh = random.choice(warehouses)
            base_d = 120 + int(random.gauss(50, 15))
            m5_records.append({
                "item_id": prod["product_id"],
                "dept_id": prod["category"],
                "warehouse_id": wh["warehouse_id"],
                "date": cur_date.strftime("%Y-%m-%d"),
                "actual_demand": max(10, base_d),
                "forecast_demand": max(10, int(base_d * random.uniform(0.92, 1.08))),
                "sell_price": prod["unit_price_usd"]
            })
    with open(m5_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(m5_records[0].keys()))
        writer.writeheader()
        writer.writerows(m5_records)

    # 7. Inventory Ledger
    inv_path = os.path.join(raw_dir, "inventory_ledger.csv")
    inventory_items = []
    for prod in products:
        for wh in warehouses[:4]:
            on_hand = random.randint(200, 15000)
            safety = int(on_hand * random.uniform(0.3, 0.6))
            inventory_items.append({
                "sku": f"SKU-{prod['product_id']}-{wh['warehouse_id']}",
                "product_id": prod["product_id"],
                "product_name": prod["product_name"],
                "category": prod["category"],
                "warehouse_id": wh["warehouse_id"],
                "stock_on_hand": on_hand,
                "safety_stock": safety,
                "reorder_point": int(safety * 1.4),
                "lead_time_days": random.randint(14, 45),
                "unit_cost_usd": prod["unit_cost_usd"]
            })
    with open(inv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(inventory_items[0].keys()))
        writer.writeheader()
        writer.writerows(inventory_items)

    # 8. Supply Chain Shipments JSON
    shipments_path = os.path.join(raw_dir, "supply_chain_shipments.json")
    shipments = []
    modes = ["Maritime", "Air", "Rail", "Road"]
    carriers = ["Ocean Network Express", "Maersk Line", "Lufthansa Cargo", "DHL Global", "DB Cargo"]
    for i in range(1, 101):
        sup = random.choice(suppliers)
        wh = random.choice(warehouses)
        mode = random.choice(modes)
        dep = datetime(2026, 10, 1) + timedelta(days=random.randint(0, 30))
        transit = random.randint(2, 35) if mode == "Maritime" else random.randint(1, 4)
        delay = random.choice([0.0, 0.0, 0.0, 4.5, 12.0, 42.0, 76.5])
        shipments.append({
            "shipment_id": f"SHP-2026-{i:05d}",
            "supplier_id": sup["supplier_id"],
            "warehouse_id": wh["warehouse_id"],
            "origin_country": sup["country"],
            "dest_country": wh["country"],
            "carrier": random.choice(carriers),
            "transport_mode": mode,
            "departure_date": dep.strftime("%Y-%m-%d"),
            "estimated_delivery_date": (dep + timedelta(days=transit)).strftime("%Y-%m-%d"),
            "actual_delivery_date": (dep + timedelta(days=transit, hours=delay)).strftime("%Y-%m-%d"),
            "delay_hours": delay,
            "cargo_value_usd": round(random.uniform(50000, 25000000), 2),
            "freight_cost_usd": round(random.uniform(3500, 85000), 2),
            "status": "Delayed" if delay > 24 else "Critical Alert" if delay > 60 else "Delivered" if delay == 0 else "In Transit"
        })
    with open(shipments_path, "w", encoding="utf-8") as f:
        json.dump(shipments, f, indent=2)

    # 9. Disruption Events JSON
    disruptions_path = os.path.join(raw_dir, "disruption_events.json")
    disruptions = [
        {"event_id": "EVT-GEO-01", "name": "Red Sea Shipping Rerouting", "type": "Geopolitical Threat", "affected_corridor": "Bab el-Mandeb", "severity": "Critical", "cost_impact_usd": 2400000, "delay_days": 12.0},
        {"event_id": "EVT-MET-02", "name": "Typhoon Malakas Luzon Strait", "type": "Weather Cyclone", "affected_corridor": "South China Sea", "severity": "High", "cost_impact_usd": 680000, "delay_days": 3.0},
        {"event_id": "EVT-LAB-03", "name": "Hamburg Port Dockworkers Warning Strike", "type": "Labor Dispute", "affected_corridor": "Europort Access", "severity": "Medium", "cost_impact_usd": 320000, "delay_days": 2.5},
        {"event_id": "EVT-GEO-04", "name": "Valemount DR Congo Mining Suspension", "type": "Regulatory Compliance", "affected_corridor": "African Mineral Export", "severity": "Critical", "cost_impact_usd": 4500000, "delay_days": 35.0}
    ]
    with open(disruptions_path, "w", encoding="utf-8") as f:
        json.dump(disruptions, f, indent=2)

    return {
        "raw_directory": raw_dir,
        "files_generated": [
            "suppliers_registry.csv",
            "warehouses_registry.csv",
            "olist_customers_sample.csv",
            "products_catalog.csv",
            "olist_orders_sample.csv",
            "m5_demand_sample.csv",
            "inventory_ledger.csv",
            "supply_chain_shipments.json",
            "disruption_events.json"
        ]
    }
