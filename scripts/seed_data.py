#!/usr/bin/env python3
"""Seed the database with sample CNG pump data."""
import sys
import os
import random
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.db import SessionLocal, engine, Base
import backend.models  # noqa: F401

Base.metadata.create_all(bind=engine)

PUMPS_DATA = [
    # ── Mumbai ──────────────────────────────────────────────────────────
    {"name": "Mahanagar Gas - Andheri West", "area": "Andheri West", "city": "Mumbai",
     "address": "S.V. Road, Andheri West, Mumbai 400058", "latitude": 19.1364, "longitude": 72.8296,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": False}},
    {"name": "MGL CNG Station - Bandra", "area": "Bandra West", "city": "Mumbai",
     "address": "Linking Road, Bandra West, Mumbai 400050", "latitude": 19.0596, "longitude": 72.8295,
     "is_24x7": False, "facilities": {"air": True, "water": False, "restroom": False, "shop": False, "ev_charger": False}},
    {"name": "Bharat Petroleum CNG - Powai", "area": "Powai", "city": "Mumbai",
     "address": "Hiranandani Gardens, Powai, Mumbai 400076", "latitude": 19.1176, "longitude": 72.9060,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": True}},
    {"name": "HP CNG Pump - Chembur", "area": "Chembur", "city": "Mumbai",
     "address": "Eastern Express Highway, Chembur, Mumbai 400071", "latitude": 19.0626, "longitude": 72.8996,
     "is_24x7": False, "facilities": {"air": True, "water": True, "restroom": False, "shop": False, "ev_charger": False}},
    {"name": "MGL CNG - Kurla", "area": "Kurla", "city": "Mumbai",
     "address": "LBS Marg, Kurla West, Mumbai 400070", "latitude": 19.0726, "longitude": 72.8791,
     "is_24x7": True, "facilities": {"air": True, "water": False, "restroom": True, "shop": False, "ev_charger": False}},
    {"name": "Indian Oil CNG - Malad", "area": "Malad West", "city": "Mumbai",
     "address": "Marve Road, Malad West, Mumbai 400064", "latitude": 19.1862, "longitude": 72.8479,
     "is_24x7": False, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": False}},
    {"name": "MGL CNG - Borivali", "area": "Borivali", "city": "Mumbai",
     "address": "Western Express Highway, Borivali East, Mumbai 400066", "latitude": 19.2307, "longitude": 72.8567,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": False, "shop": False, "ev_charger": False}},
    {"name": "Bharat Petroleum - Ghatkopar", "area": "Ghatkopar", "city": "Mumbai",
     "address": "R.C. Marg, Ghatkopar West, Mumbai 400086", "latitude": 19.0862, "longitude": 72.9082,
     "is_24x7": False, "facilities": {"air": True, "water": False, "restroom": False, "shop": False, "ev_charger": False}},
    {"name": "HP CNG - Vikhroli", "area": "Vikhroli", "city": "Mumbai",
     "address": "LBS Marg, Vikhroli West, Mumbai 400079", "latitude": 19.1070, "longitude": 72.9277,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": False, "ev_charger": True}},
    {"name": "MGL CNG - Thane", "area": "Thane West", "city": "Mumbai",
     "address": "Pokhran Road, Thane West 400601", "latitude": 19.2183, "longitude": 72.9781,
     "is_24x7": False, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": False}},
    {"name": "IndianOil CNG - Dadar", "area": "Dadar", "city": "Mumbai",
     "address": "Dr. Ambedkar Road, Dadar, Mumbai 400014", "latitude": 19.0176, "longitude": 72.8426,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": False, "shop": True, "ev_charger": False}},

    # ── Delhi ──────────────────────────────────────────────────────────
    {"name": "IGL CNG - Connaught Place", "area": "Connaught Place", "city": "Delhi",
     "address": "Inner Circle, Connaught Place, New Delhi 110001", "latitude": 28.6315, "longitude": 77.2167,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": True}},
    {"name": "IGL CNG Station - Karol Bagh", "area": "Karol Bagh", "city": "Delhi",
     "address": "Ajmal Khan Road, Karol Bagh, New Delhi 110005", "latitude": 28.6520, "longitude": 77.1909,
     "is_24x7": False, "facilities": {"air": True, "water": False, "restroom": False, "shop": False, "ev_charger": False}},
    {"name": "HP CNG - Dwarka", "area": "Dwarka", "city": "Delhi",
     "address": "Sector 12, Dwarka, New Delhi 110075", "latitude": 28.5921, "longitude": 77.0460,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": False, "ev_charger": False}},
    {"name": "IGL CNG - Lajpat Nagar", "area": "Lajpat Nagar", "city": "Delhi",
     "address": "Ring Road, Lajpat Nagar, New Delhi 110024", "latitude": 28.5700, "longitude": 77.2431,
     "is_24x7": False, "facilities": {"air": True, "water": True, "restroom": False, "shop": True, "ev_charger": False}},
    {"name": "Bharat Petroleum CNG - Rohini", "area": "Rohini", "city": "Delhi",
     "address": "Sector 8, Rohini, New Delhi 110085", "latitude": 28.7196, "longitude": 77.1204,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": False}},
    {"name": "IGL CNG - Vasant Kunj", "area": "Vasant Kunj", "city": "Delhi",
     "address": "Vasant Kunj Marg, Vasant Kunj, New Delhi 110070", "latitude": 28.5213, "longitude": 77.1586,
     "is_24x7": False, "facilities": {"air": True, "water": False, "restroom": True, "shop": False, "ev_charger": False}},
    {"name": "IndianOil CNG - Shahdara", "area": "Shahdara", "city": "Delhi",
     "address": "GT Road, Shahdara, Delhi 110032", "latitude": 28.6780, "longitude": 77.2944,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": False, "shop": True, "ev_charger": False}},
    {"name": "IGL CNG - Janakpuri", "area": "Janakpuri", "city": "Delhi",
     "address": "District Centre, Janakpuri, New Delhi 110058", "latitude": 28.6225, "longitude": 77.0832,
     "is_24x7": False, "facilities": {"air": True, "water": True, "restroom": True, "shop": False, "ev_charger": True}},
    {"name": "HP CNG - Saket", "area": "Saket", "city": "Delhi",
     "address": "Press Enclave Road, Saket, New Delhi 110017", "latitude": 28.5254, "longitude": 77.2148,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": True}},
    {"name": "IGL CNG - Pitampura", "area": "Pitampura", "city": "Delhi",
     "address": "Madhuban Chowk, Pitampura, Delhi 110034", "latitude": 28.6972, "longitude": 77.1313,
     "is_24x7": False, "facilities": {"air": True, "water": True, "restroom": False, "shop": False, "ev_charger": False}},

    # ── Pune ──────────────────────────────────────────────────────────
    {"name": "MGL CNG - Kothrud", "area": "Kothrud", "city": "Pune",
     "address": "Karve Road, Kothrud, Pune 411038", "latitude": 18.5074, "longitude": 73.8077,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": False}},
    {"name": "HP CNG - Shivajinagar", "area": "Shivajinagar", "city": "Pune",
     "address": "FC Road, Shivajinagar, Pune 411005", "latitude": 18.5314, "longitude": 73.8446,
     "is_24x7": False, "facilities": {"air": True, "water": False, "restroom": False, "shop": True, "ev_charger": False}},
    {"name": "IndianOil CNG - Hadapsar", "area": "Hadapsar", "city": "Pune",
     "address": "Solapur Road, Hadapsar, Pune 411028", "latitude": 18.5018, "longitude": 73.9265,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": False, "ev_charger": False}},
    {"name": "Bharat Petroleum CNG - Baner", "area": "Baner", "city": "Pune",
     "address": "Baner Road, Baner, Pune 411045", "latitude": 18.5590, "longitude": 73.7868,
     "is_24x7": False, "facilities": {"air": True, "water": True, "restroom": False, "shop": True, "ev_charger": True}},
    {"name": "MGL CNG - Wakad", "area": "Wakad", "city": "Pune",
     "address": "Old Mumbai Pune Highway, Wakad, Pune 411057", "latitude": 18.5944, "longitude": 73.7597,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": False}},
    {"name": "HP CNG - Viman Nagar", "area": "Viman Nagar", "city": "Pune",
     "address": "Nagar Road, Viman Nagar, Pune 411014", "latitude": 18.5679, "longitude": 73.9143,
     "is_24x7": False, "facilities": {"air": True, "water": False, "restroom": True, "shop": False, "ev_charger": False}},
    {"name": "IGL CNG - Katraj", "area": "Katraj", "city": "Pune",
     "address": "Katraj Bypass, Katraj, Pune 411046", "latitude": 18.4529, "longitude": 73.8576,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": False, "shop": False, "ev_charger": False}},
    {"name": "IndianOil CNG - Sinhagad Road", "area": "Sinhagad Road", "city": "Pune",
     "address": "Sinhagad Road, Pune 411030", "latitude": 18.4830, "longitude": 73.8219,
     "is_24x7": False, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": False}},
    {"name": "Bharat Petroleum CNG - Pimpri", "area": "Pimpri", "city": "Pune",
     "address": "Old Mumbai Pune Road, Pimpri, Pune 411018", "latitude": 18.6279, "longitude": 73.8003,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": True}},
    {"name": "MGL CNG - Aundh", "area": "Aundh", "city": "Pune",
     "address": "ITI Road, Aundh, Pune 411007", "latitude": 18.5587, "longitude": 73.8091,
     "is_24x7": False, "facilities": {"air": True, "water": False, "restroom": False, "shop": False, "ev_charger": False}},
    {"name": "HP CNG - Hinjewadi", "area": "Hinjewadi", "city": "Pune",
     "address": "Hinjewadi Phase 1, Pune 411057", "latitude": 18.5904, "longitude": 73.7387,
     "is_24x7": True, "facilities": {"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": True}},
]

CITY_PRICES = {
    "Mumbai": 79.0,
    "Delhi": 74.09,
    "Pune": 83.5,
}


def seed():
    db = SessionLocal()
    try:
        from backend.models.pump import CngPump, PumpPrice, PumpStatus, PriceTrend, QueueHistory
        from datetime import datetime

        existing = db.query(CngPump).count()
        if existing > 0:
            print(f"⚠️  Database already has {existing} pumps. Skipping seed.")
            return

        print(f"Seeding {len(PUMPS_DATA)} CNG pumps...")
        pumps = []
        for data in PUMPS_DATA:
            pump = CngPump(
                name=data["name"],
                area=data["area"],
                city=data["city"],
                address=data["address"],
                latitude=data["latitude"],
                longitude=data["longitude"],
                is_24x7=data["is_24x7"],
                facilities=data["facilities"],
                operating_hours={"open": "06:00", "close": "22:00"} if not data["is_24x7"] else {"open": "00:00", "close": "23:59"},
                current_crowd_level=random.randint(10, 70),
                max_capacity=random.choice([30, 40, 50, 60]),
                current_vehicles=random.randint(2, 25),
                status=PumpStatus.OPEN,
                avg_rating=round(random.uniform(3.5, 5.0), 1),
                review_count=random.randint(5, 120),
            )
            db.add(pump)
            pumps.append((pump, data["city"]))

        db.flush()

        # Seed prices and queue history
        today = date.today()
        for pump, city in pumps:
            base_price = CITY_PRICES.get(city, 79.0)
            for i in range(7):
                price_date = today - timedelta(days=i)
                db.add(PumpPrice(
                    pump_id=pump.id,
                    city=city,
                    price_per_kg=round(base_price + random.uniform(-0.5, 0.5), 2),
                    date=price_date,
                    trend=random.choice(list(PriceTrend)),
                ))

            # Seed last 24h queue history
            for h in range(24):
                crowd = random.randint(5, 80)
                db.add(QueueHistory(
                    pump_id=pump.id,
                    timestamp=datetime.utcnow().replace(hour=h, minute=0, second=0),
                    vehicle_count=int(crowd / 100 * pump.max_capacity),
                    crowd_level=crowd,
                    wait_time_minutes=round(random.uniform(2.0, 25.0), 1),
                ))

        db.commit()
        print(f"✅ Seeded {len(PUMPS_DATA)} pumps with prices and queue history.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
