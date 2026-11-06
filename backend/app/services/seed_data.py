from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from app.models.entities import Supplier, Warehouse, Shipment, InventoryItem, OperationalAlert
from app.core.logging import logger

def seed_database_if_empty(db: Session):
    # Check if data already exists
    if db.query(Supplier).first():
        logger.info("Database already seeded with enterprise records.")
        return

    logger.info("Seeding database with Tier-1 Enterprise Supply Chain entities...")

    # 1. Global Suppliers
    suppliers_data = [
        {"name": "Taiwan Semiconductor Mfg Co", "code": "SUP-TSMC-01", "tier": "Tier 1", "category": "Advanced Wafer Fab", "country": "Taiwan", "city": "Hsinchu", "latitude": 24.7820, "longitude": 120.9980, "risk_score": 38.5, "financial_health": 98.0, "geopolitical_risk": 58.0, "esg_score": 88.0, "delivery_reliability": 97.4, "active_contracts": 18, "status": "Active"},
        {"name": "ASML Lithography Systems", "code": "SUP-ASML-02", "tier": "Tier 1", "category": "Photolithography Core", "country": "Netherlands", "city": "Veldhoven", "latitude": 51.4050, "longitude": 5.4080, "risk_score": 14.2, "financial_health": 99.5, "geopolitical_risk": 8.0, "esg_score": 94.0, "delivery_reliability": 99.1, "active_contracts": 12, "status": "Active"},
        {"name": "Samsung Foundry Electronics", "code": "SUP-SMSNG-03", "tier": "Tier 1", "category": "Memory & Logic", "country": "South Korea", "city": "Suwon", "latitude": 37.2636, "longitude": 127.0286, "risk_score": 26.0, "financial_health": 96.0, "geopolitical_risk": 32.0, "esg_score": 82.0, "delivery_reliability": 95.8, "active_contracts": 15, "status": "Active"},
        {"name": "Bosch Global Powertrain & Sensor", "code": "SUP-BSCH-04", "tier": "Tier 1", "category": "Automotive Telematics", "country": "Germany", "city": "Stuttgart", "latitude": 48.7758, "longitude": 9.1829, "risk_score": 19.8, "financial_health": 92.0, "geopolitical_risk": 12.0, "esg_score": 91.0, "delivery_reliability": 96.5, "active_contracts": 22, "status": "Active"},
        {"name": "Foxconn Precision Electronics", "code": "SUP-FXCN-05", "tier": "Tier 2", "category": "Sub-Assembly Systems", "country": "China", "city": "Shenzhen", "latitude": 22.5431, "longitude": 114.0579, "risk_score": 44.0, "financial_health": 88.0, "geopolitical_risk": 62.0, "esg_score": 70.0, "delivery_reliability": 91.2, "active_contracts": 30, "status": "Watchlist"},
        {"name": "Infineon Technologies Silicon", "code": "SUP-INF-06", "tier": "Tier 1", "category": "Power Semiconductors", "country": "Germany", "city": "Dresden", "latitude": 51.0504, "longitude": 13.7373, "risk_score": 16.5, "financial_health": 94.0, "geopolitical_risk": 9.0, "esg_score": 89.0, "delivery_reliability": 98.2, "active_contracts": 14, "status": "Active"},
        {"name": "Murata Manufacturing Components", "code": "SUP-MRT-07", "tier": "Tier 2", "category": "Capacitors & RF", "country": "Japan", "city": "Kyoto", "latitude": 35.0116, "longitude": 135.7681, "risk_score": 12.0, "financial_health": 97.0, "geopolitical_risk": 11.0, "esg_score": 92.0, "delivery_reliability": 98.7, "active_contracts": 19, "status": "Active"},
        {"name": "Kyocera Precision Ceramics", "code": "SUP-KYO-08", "tier": "Tier 2", "category": "Optical & Structural", "country": "Japan", "city": "Kyoto", "latitude": 34.9570, "longitude": 135.7530, "risk_score": 15.0, "financial_health": 93.0, "geopolitical_risk": 10.0, "esg_score": 87.0, "delivery_reliability": 96.0, "active_contracts": 11, "status": "Active"},
        {"name": "Texas Instruments Analog", "code": "SUP-TI-09", "tier": "Tier 1", "category": "Embedded Processors", "country": "United States", "city": "Dallas", "latitude": 32.7767, "longitude": -96.7970, "risk_score": 11.0, "financial_health": 98.5, "geopolitical_risk": 6.0, "esg_score": 88.0, "delivery_reliability": 99.0, "active_contracts": 25, "status": "Active"},
        {"name": "SK Hynix Memory Systems", "code": "SUP-SKH-10", "tier": "Tier 1", "category": "High Bandwidth Memory", "country": "South Korea", "city": "Icheon", "latitude": 37.2800, "longitude": 127.4425, "risk_score": 28.0, "financial_health": 94.0, "geopolitical_risk": 35.0, "esg_score": 83.0, "delivery_reliability": 94.5, "active_contracts": 16, "status": "Active"},
        {"name": "Valemount Rare Earth Extractor", "code": "SUP-VMNT-11", "tier": "Tier 3", "category": "Neodymium & Dysprosium", "country": "DR Congo", "city": "Kolwezi", "latitude": -10.7160, "longitude": 25.4660, "risk_score": 82.5, "financial_health": 64.0, "geopolitical_risk": 89.0, "esg_score": 52.0, "delivery_reliability": 78.4, "active_contracts": 6, "status": "Critical"},
        {"name": "Nordic Lithium Refining AB", "code": "SUP-NLR-12", "tier": "Tier 2", "category": "Battery Chemical Grade", "country": "Sweden", "city": "Skellefteå", "latitude": 64.7507, "longitude": 20.9528, "risk_score": 18.0, "financial_health": 89.0, "geopolitical_risk": 5.0, "esg_score": 96.0, "delivery_reliability": 95.0, "active_contracts": 8, "status": "Active"}
    ]

    for item in suppliers_data:
        db.add(Supplier(**item))

    # 2. Global Warehouses & Hubs
    warehouses_data = [
        {"name": "Rotterdam Europort Super-Hub", "facility_code": "WH-RTM-01", "city": "Rotterdam", "country": "Netherlands", "region": "EMEA", "latitude": 51.9244, "longitude": 4.4777, "capacity_sqft": 850000, "utilization_pct": 84.5, "temperature_controlled": True, "handling_throughput_units_per_day": 75000, "operational_status": "Optimal"},
        {"name": "Singapore Tuas Logistics Gateway", "facility_code": "WH-SIN-02", "city": "Singapore", "country": "Singapore", "region": "APAC", "latitude": 1.3521, "longitude": 103.8198, "capacity_sqft": 1100000, "utilization_pct": 91.2, "temperature_controlled": True, "handling_throughput_units_per_day": 95000, "operational_status": "Constrained"},
        {"name": "Long Beach Port Complex Terminal", "facility_code": "WH-LGB-03", "city": "Long Beach", "country": "United States", "region": "North America", "latitude": 33.7701, "longitude": -118.1937, "capacity_sqft": 920000, "utilization_pct": 79.8, "temperature_controlled": True, "handling_throughput_units_per_day": 82000, "operational_status": "Optimal"},
        {"name": "Hamburg Logistics City Hub", "facility_code": "WH-HAM-04", "city": "Hamburg", "country": "Germany", "region": "EMEA", "latitude": 53.5511, "longitude": 9.9937, "capacity_sqft": 650000, "utilization_pct": 76.0, "temperature_controlled": False, "handling_throughput_units_per_day": 52000, "operational_status": "Optimal"},
        {"name": "Dubai Jebel Ali Freezone Hub", "facility_code": "WH-DXB-05", "city": "Dubai", "country": "United Arab Emirates", "region": "Middle East", "latitude": 24.9857, "longitude": 55.0273, "capacity_sqft": 780000, "utilization_pct": 73.4, "temperature_controlled": True, "handling_throughput_units_per_day": 64000, "operational_status": "Optimal"},
        {"name": "Chicago O'Hare Intermodal Logistics", "facility_code": "WH-ORD-06", "city": "Chicago", "country": "United States", "region": "North America", "latitude": 41.9742, "longitude": -87.9073, "capacity_sqft": 700000, "utilization_pct": 82.0, "temperature_controlled": True, "handling_throughput_units_per_day": 58000, "operational_status": "Optimal"},
        {"name": "Tokyo Haneda Air Cargo Nexus", "facility_code": "WH-HND-07", "city": "Tokyo", "country": "Japan", "region": "APAC", "latitude": 35.5494, "longitude": 139.7798, "capacity_sqft": 520000, "utilization_pct": 88.5, "temperature_controlled": True, "handling_throughput_units_per_day": 48000, "operational_status": "Optimal"},
        {"name": "Santos Latin America Hub", "facility_code": "WH-SSZ-08", "city": "Santos", "country": "Brazil", "region": "LATAM", "latitude": -23.9618, "longitude": -46.3322, "capacity_sqft": 480000, "utilization_pct": 87.2, "temperature_controlled": False, "handling_throughput_units_per_day": 34000, "operational_status": "Constrained"}
    ]

    for item in warehouses_data:
        db.add(Warehouse(**item))

    # Commit suppliers and warehouses to generate IDs
    db.commit()

    # 3. Shipments
    now = datetime.utcnow()
    shipments_data = [
        {"tracking_number": "NEX-SHP-90214", "origin_facility": "Taiwan Semiconductor Mfg Co", "destination_facility": "Long Beach Port Complex Terminal", "origin_lat": 24.7820, "origin_lng": 120.9980, "dest_lat": 33.7701, "dest_lng": -118.1937, "carrier": "Ocean Network Express (ONE)", "mode": "Maritime", "departure_date": now - timedelta(days=6), "estimated_delivery": now + timedelta(days=4), "status": "In Transit", "delay_hours": 0.0, "cargo_value_usd": 12500000.0, "risk_level": "Low", "customs_hold": False},
        {"tracking_number": "NEX-SHP-90215", "origin_facility": "ASML Lithography Systems", "destination_facility": "Singapore Tuas Logistics Gateway", "origin_lat": 51.4050, "origin_lng": 5.4080, "dest_lat": 1.3521, "dest_lng": 103.8198, "carrier": "Lufthansa Cargo Heavy", "mode": "Air", "departure_date": now - timedelta(days=1), "estimated_delivery": now + timedelta(hours=14), "status": "In Transit", "delay_hours": 1.2, "cargo_value_usd": 48000000.0, "risk_level": "Medium", "customs_hold": False},
        {"tracking_number": "NEX-SHP-90216", "origin_facility": "Foxconn Precision Electronics", "destination_facility": "Rotterdam Europort Super-Hub", "origin_lat": 22.5431, "origin_lng": 114.0579, "dest_lat": 51.9244, "dest_lng": 4.4777, "carrier": "Maersk Triple-E", "mode": "Maritime", "departure_date": now - timedelta(days=12), "estimated_delivery": now + timedelta(days=3), "status": "Delayed", "delay_hours": 42.0, "cargo_value_usd": 8900000.0, "risk_level": "High", "customs_hold": False},
        {"tracking_number": "NEX-SHP-90217", "origin_facility": "Valemount Rare Earth Extractor", "destination_facility": "Dubai Jebel Ali Freezone Hub", "origin_lat": -10.7160, "origin_lng": 25.4660, "dest_lat": 24.9857, "dest_lng": 55.0273, "carrier": "MSC Mediterranean", "mode": "Maritime", "departure_date": now - timedelta(days=8), "estimated_delivery": now + timedelta(days=2), "status": "Critical Alert", "delay_hours": 76.5, "cargo_value_usd": 6400000.0, "risk_level": "Critical", "customs_hold": True},
        {"tracking_number": "NEX-SHP-90218", "origin_facility": "Bosch Global Powertrain", "destination_facility": "Chicago O'Hare Intermodal Logistics", "origin_lat": 48.7758, "origin_lng": 9.1829, "dest_lat": 41.9742, "dest_lng": -87.9073, "carrier": "DHL Global Forwarding", "mode": "Air", "departure_date": now - timedelta(days=2), "estimated_delivery": now + timedelta(days=1), "status": "In Transit", "delay_hours": 0.0, "cargo_value_usd": 3800000.0, "risk_level": "Low", "customs_hold": False},
        {"tracking_number": "NEX-SHP-90219", "origin_facility": "Samsung Foundry Electronics", "destination_facility": "Tokyo Haneda Air Cargo Nexus", "origin_lat": 37.2636, "origin_lng": 127.0286, "dest_lat": 35.5494, "dest_lng": 139.7798, "carrier": "Korean Air Cargo", "mode": "Air", "departure_date": now - timedelta(hours=18), "estimated_delivery": now + timedelta(hours=6), "status": "In Transit", "delay_hours": 0.0, "cargo_value_usd": 9200000.0, "risk_level": "Low", "customs_hold": False},
        {"tracking_number": "NEX-SHP-90220", "origin_facility": "Nordic Lithium Refining AB", "destination_facility": "Hamburg Logistics City Hub", "origin_lat": 64.7507, "origin_lng": 20.9528, "dest_lat": 53.5511, "dest_lng": 9.9937, "carrier": "DB Cargo Scandinavia", "mode": "Rail", "departure_date": now - timedelta(days=3), "estimated_delivery": now + timedelta(hours=12), "status": "In Transit", "delay_hours": 2.5, "cargo_value_usd": 2100000.0, "risk_level": "Low", "customs_hold": False}
    ]

    for item in shipments_data:
        db.add(Shipment(**item))

    # 4. Inventory Items
    inventory_data = [
        {"sku": "SKU-3NM-SOC-990", "name": "3nm Neural Engine SoC Gen 4", "category": "Advanced Processors", "stock_on_hand": 1420, "safety_stock": 1800, "reorder_point": 2400, "lead_time_days": 42, "unit_cost_usd": 850.0, "stockout_risk_score": 86.4, "velocity_tier": "Fast Moving"},
        {"sku": "SKU-HBM3E-24GB", "name": "HBM3e Stacked Memory Die 24GB", "category": "Memory Systems", "stock_on_hand": 3800, "safety_stock": 2500, "reorder_point": 3500, "lead_time_days": 35, "unit_cost_usd": 320.0, "stockout_risk_score": 42.1, "velocity_tier": "Fast Moving"},
        {"sku": "SKU-EUVP-RET-01", "name": "EUV Pellicle Ultra-Pure Membrane", "category": "Fabrication Consumables", "stock_on_hand": 85, "safety_stock": 120, "reorder_point": 160, "lead_time_days": 60, "unit_cost_usd": 14500.0, "stockout_risk_score": 91.2, "velocity_tier": "Critical Special"},
        {"sku": "SKU-SIC-MOS-1200V", "name": "Silicon Carbide Power MOSFET 1200V", "category": "Power Electrification", "stock_on_hand": 18500, "safety_stock": 12000, "reorder_point": 15000, "lead_time_days": 21, "unit_cost_usd": 45.0, "stockout_risk_score": 15.0, "velocity_tier": "Fast Moving"},
        {"sku": "SKU-NEO-MAGNET-52M", "name": "Neodymium-Dysprosium Sintered Magnet", "category": "Rare Earth Materials", "stock_on_hand": 2400, "safety_stock": 4000, "reorder_point": 5500, "lead_time_days": 75, "unit_cost_usd": 180.0, "stockout_risk_score": 79.5, "velocity_tier": "Moderate"}
    ]

    for item in inventory_data:
        db.add(InventoryItem(**item))

    # 5. Operational Alerts
    alerts_data = [
        {
            "alert_code": "ALT-2026-GEO-09",
            "title": "Red Sea / Bab el-Mandeb Maritime Redirection Advisory",
            "summary": "Heightened drone threat index requires all containerships traversing westbound to reroute around Cape of Good Hope, injecting +10 to +14 sailing days and $1.2M fuel surcharges per vessel.",
            "severity": "Critical",
            "category": "Geopolitical",
            "entity_type": "Corridor",
            "entity_id": "CORR-ASIA-EUROPE-01",
            "status": "Active",
            "recommended_action": "Execute Pre-emptive Air Bridge contingency for SKU-3NM-SOC-990 batches and invoke Cape buffer safety stock protocols.",
            "impact_usd": 2400000.0
        },
        {
            "alert_code": "ALT-2026-MET-14",
            "title": "Typhoon Malakas Trajectory: Luzon Strait Port Closures",
            "summary": "Category 4 tropical storm approaching Kaohsiung and Hong Kong berths. 48-hour terminal shut down declared by Taiwan Maritime Bureau.",
            "severity": "High",
            "category": "Weather",
            "entity_type": "Warehouse",
            "entity_id": "WH-SIN-02",
            "status": "Active",
            "recommended_action": "Divert vessel NEX-SHP-90214 to Subic Bay or hold at anchorage outside typhoon envelope.",
            "impact_usd": 680000.0
        },
        {
            "alert_code": "ALT-2026-LAB-03",
            "title": "Hamburg Waterfront Union 72-Hour Warning Strike",
            "summary": "Dockworkers union announced localized work stoppage affecting container gantry cranes at Waltershof and Burchardkai berths.",
            "severity": "Medium",
            "category": "Labor Strike",
            "entity_type": "Warehouse",
            "entity_id": "WH-HAM-04",
            "status": "Active",
            "recommended_action": "Shift rail intermodal connections to Wilhelmshaven JadeWeserPort terminal.",
            "impact_usd": 320000.0
        },
        {
            "alert_code": "ALT-2026-SUP-22",
            "title": "Valemount Rare Earth Extractor Export License Suspension",
            "summary": "Ministry of Mines audits have halted heavy rare-earth concentrate shipments out of Kolwezi facility pending environmental compliance review.",
            "severity": "Critical",
            "category": "Supplier Solvency",
            "entity_type": "Supplier",
            "entity_id": "SUP-VMNT-11",
            "status": "Active",
            "recommended_action": "Activate secondary qualified supplier Lynas Rare Earths (Australia) under emergency allocation agreement.",
            "impact_usd": 4500000.0
        }
    ]

    for item in alerts_data:
        db.add(OperationalAlert(**item))

    db.commit()
    logger.info("Successfully populated Tier-1 enterprise dataset.")
