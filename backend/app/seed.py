"""
Seed script to populate the database with sample data.
Run with: python -m app.seed
"""
import os
import sys
from datetime import date, timedelta
from dotenv import load_dotenv

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.models.user import User
from app.db.models.maintenance_team import MaintenanceTeam
from app.db.models.team_member import TeamMember
from app.db.models.equipment import Equipment
from app.db.models.maintenance_request import MaintenanceRequest

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    if DATABASE_URL.startswith("postgresql+asyncpg://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    elif DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)

def seed_database():
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already has data. Skipping seed.")
            return
        
        print("Seeding database...")
        
        # Create Users
        users = [
            User(name="Admin User", email="admin@gearguard.com", role="admin"),
            User(name="John Smith", email="john.smith@gearguard.com", role="technician"),
            User(name="Jane Doe", email="jane.doe@gearguard.com", role="technician"),
            User(name="Mike Johnson", email="mike.johnson@gearguard.com", role="manager"),
            User(name="Sarah Williams", email="sarah.williams@gearguard.com", role="user"),
            User(name="Tom Brown", email="tom.brown@gearguard.com", role="technician"),
        ]
        db.add_all(users)
        db.commit()
        print(f"Created {len(users)} users")
        
        # Refresh to get IDs
        for user in users:
            db.refresh(user)
        
        # Create Maintenance Teams
        teams = [
            MaintenanceTeam(name="Electrical Team", description="Handles all electrical equipment maintenance"),
            MaintenanceTeam(name="Mechanical Team", description="Handles mechanical equipment and machinery"),
            MaintenanceTeam(name="HVAC Team", description="Heating, ventilation, and air conditioning maintenance"),
            MaintenanceTeam(name="General Maintenance", description="General facility maintenance tasks"),
        ]
        db.add_all(teams)
        db.commit()
        print(f"Created {len(teams)} teams")
        
        # Refresh to get IDs
        for team in teams:
            db.refresh(team)
        
        # Add team members
        team_members = [
            TeamMember(team_id=teams[0].id, user_id=users[1].id),  # John -> Electrical
            TeamMember(team_id=teams[0].id, user_id=users[2].id),  # Jane -> Electrical
            TeamMember(team_id=teams[1].id, user_id=users[5].id),  # Tom -> Mechanical
            TeamMember(team_id=teams[2].id, user_id=users[1].id),  # John -> HVAC
            TeamMember(team_id=teams[3].id, user_id=users[2].id),  # Jane -> General
            TeamMember(team_id=teams[3].id, user_id=users[5].id),  # Tom -> General
        ]
        db.add_all(team_members)
        db.commit()
        print(f"Created {len(team_members)} team memberships")
        
        # Create Equipment
        equipment_list = [
            Equipment(
                name="Industrial Generator A1",
                serial_number="GEN-001-2024",
                category="Power",
                department="Facilities",
                location="Building A - Basement",
                purchase_date=date(2022, 3, 15),
                warranty_expiry=date(2027, 3, 15),
                maintenance_team_id=teams[0].id,
                is_scrapped=False,
            ),
            Equipment(
                name="HVAC Unit Floor 1",
                serial_number="HVAC-F1-001",
                category="HVAC",
                department="Facilities",
                location="Building A - Floor 1",
                purchase_date=date(2021, 6, 20),
                warranty_expiry=date(2026, 6, 20),
                maintenance_team_id=teams[2].id,
                is_scrapped=False,
            ),
            Equipment(
                name="CNC Machine M100",
                serial_number="CNC-M100-2023",
                category="Manufacturing",
                department="Production",
                location="Factory Floor - Section B",
                purchase_date=date(2023, 1, 10),
                warranty_expiry=date(2028, 1, 10),
                maintenance_team_id=teams[1].id,
                is_scrapped=False,
            ),
            Equipment(
                name="Forklift Unit 3",
                serial_number="FLT-003-2020",
                category="Transportation",
                department="Warehouse",
                location="Warehouse A",
                purchase_date=date(2020, 8, 5),
                warranty_expiry=date(2025, 8, 5),
                maintenance_team_id=teams[1].id,
                is_scrapped=False,
            ),
            Equipment(
                name="Elevator System Main",
                serial_number="ELV-MAIN-2019",
                category="Transportation",
                department="Facilities",
                location="Building A - Central",
                purchase_date=date(2019, 4, 22),
                warranty_expiry=date(2024, 4, 22),
                maintenance_team_id=teams[0].id,
                is_scrapped=False,
            ),
            Equipment(
                name="Server Rack #5",
                serial_number="SRV-RACK-005",
                category="IT",
                department="IT",
                location="Server Room",
                purchase_date=date(2022, 11, 1),
                warranty_expiry=date(2027, 11, 1),
                maintenance_team_id=teams[0].id,
                is_scrapped=False,
            ),
            Equipment(
                name="Air Compressor Unit 2",
                serial_number="COMP-002-2021",
                category="Industrial",
                department="Production",
                location="Factory Floor - Section A",
                purchase_date=date(2021, 2, 14),
                warranty_expiry=date(2026, 2, 14),
                maintenance_team_id=teams[1].id,
                is_scrapped=False,
            ),
            Equipment(
                name="Security Camera System",
                serial_number="CAM-SYS-2023",
                category="Security",
                department="Security",
                location="Building A - All Floors",
                purchase_date=date(2023, 5, 8),
                warranty_expiry=date(2028, 5, 8),
                maintenance_team_id=teams[0].id,
                is_scrapped=False,
            ),
        ]
        db.add_all(equipment_list)
        db.commit()
        print(f"Created {len(equipment_list)} equipment items")
        
        # Refresh to get IDs
        for eq in equipment_list:
            db.refresh(eq)
        
        # Create Maintenance Requests
        today = date.today()
        requests = [
            MaintenanceRequest(
                subject="Generator A1 - Annual Inspection",
                description="Scheduled annual inspection and oil change for Industrial Generator A1",
                request_type="preventive",
                status="new",
                equipment_id=equipment_list[0].id,
                maintenance_team_id=teams[0].id,
                scheduled_date=today + timedelta(days=3),
            ),
            MaintenanceRequest(
                subject="HVAC Filter Replacement",
                description="Replace air filters on HVAC Unit Floor 1",
                request_type="preventive",
                status="in_progress",
                equipment_id=equipment_list[1].id,
                maintenance_team_id=teams[2].id,
                assigned_to=users[1].id,
                scheduled_date=today,
            ),
            MaintenanceRequest(
                subject="CNC Machine Calibration",
                description="Recalibrate CNC Machine M100 after software update",
                request_type="corrective",
                status="new",
                equipment_id=equipment_list[2].id,
                maintenance_team_id=teams[1].id,
                scheduled_date=today + timedelta(days=1),
            ),
            MaintenanceRequest(
                subject="Forklift Battery Replacement",
                description="Battery not holding charge - needs replacement",
                request_type="corrective",
                status="in_progress",
                equipment_id=equipment_list[3].id,
                maintenance_team_id=teams[1].id,
                assigned_to=users[5].id,
                scheduled_date=today,
            ),
            MaintenanceRequest(
                subject="Elevator Monthly Inspection",
                description="Routine monthly safety inspection",
                request_type="preventive",
                status="repaired",
                equipment_id=equipment_list[4].id,
                maintenance_team_id=teams[0].id,
                assigned_to=users[1].id,
                scheduled_date=today - timedelta(days=2),
            ),
            MaintenanceRequest(
                subject="Server Room Cooling Issue",
                description="Temperature sensors showing higher than normal readings",
                request_type="corrective",
                status="new",
                equipment_id=equipment_list[5].id,
                maintenance_team_id=teams[2].id,
                scheduled_date=today + timedelta(days=1),
            ),
            MaintenanceRequest(
                subject="Compressor Pressure Check",
                description="Quarterly pressure and safety valve check",
                request_type="preventive",
                status="repaired",
                equipment_id=equipment_list[6].id,
                maintenance_team_id=teams[1].id,
                assigned_to=users[5].id,
                scheduled_date=today - timedelta(days=5),
            ),
            MaintenanceRequest(
                subject="Security Camera Firmware Update",
                description="Update firmware on all security cameras",
                request_type="preventive",
                status="new",
                equipment_id=equipment_list[7].id,
                maintenance_team_id=teams[0].id,
                scheduled_date=today + timedelta(days=7),
            ),
        ]
        db.add_all(requests)
        db.commit()
        print(f"Created {len(requests)} maintenance requests")
        
        print("\nDatabase seeded successfully!")
        print(f"  - Users: {len(users)}")
        print(f"  - Teams: {len(teams)}")
        print(f"  - Equipment: {len(equipment_list)}")
        print(f"  - Requests: {len(requests)}")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
