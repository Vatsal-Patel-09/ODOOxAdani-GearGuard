"""
Seed script to populate the database with comprehensive demo data.
Run with: python -m app.seed
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

from app.db.session import SessionLocal
from app.db.models.user import User
from app.db.models.equipment import Equipment
from app.db.models.maintenance_team import MaintenanceTeam
from app.db.models.team_member import TeamMember
from app.db.models.maintenance_request import MaintenanceRequest

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_data():
    db = SessionLocal()
    
    try:
        print("🌱 Seeding GearGuard Demo Database...")
        print("=" * 50)
        
        # ========================================
        # CREATE USERS
        # ========================================
        print("\n👤 Creating users...")
        users_data = [
            # Admins
            {"name": "John Smith", "email": "admin@gearguard.com", "role": "admin"},
            # Managers
            {"name": "Sarah Johnson", "email": "manager@gearguard.com", "role": "manager"},
            {"name": "Robert Chen", "email": "robert.chen@gearguard.com", "role": "manager"},
            # Technicians
            {"name": "Mike Wilson", "email": "tech.mike@gearguard.com", "role": "technician"},
            {"name": "Emily Brown", "email": "tech.emily@gearguard.com", "role": "technician"},
            {"name": "David Lee", "email": "tech.david@gearguard.com", "role": "technician"},
            {"name": "Alex Garcia", "email": "tech.alex@gearguard.com", "role": "technician"},
            # Regular Users
            {"name": "Lisa Chen", "email": "user@gearguard.com", "role": "user"},
            {"name": "Tom Baker", "email": "tom.baker@gearguard.com", "role": "user"},
        ]
        
        users = {}
        for data in users_data:
            existing = db.query(User).filter(User.email == data["email"]).first()
            if existing:
                users[data["email"]] = existing
                print(f"   ✓ {data['name']} ({data['role']}) - exists")
            else:
                user = User(
                    name=data["name"],
                    email=data["email"],
                    password_hash=pwd_context.hash("demo123"),
                    role=data["role"],
                )
                db.add(user)
                db.flush()
                users[data["email"]] = user
                print(f"   + {data['name']} ({data['role']})")
        
        # ========================================
        # CREATE TEAMS
        # ========================================
        print("\n🔧 Creating maintenance teams...")
        teams_data = [
            {"name": "Mechanics Team", "description": "Heavy machinery and vehicle maintenance"},
            {"name": "Electrical Team", "description": "Electrical systems and wiring"},
            {"name": "IT Support", "description": "Computers, networks, and software"},
            {"name": "HVAC Team", "description": "Heating, ventilation, and air conditioning"},
        ]
        
        teams = {}
        for data in teams_data:
            existing = db.query(MaintenanceTeam).filter(MaintenanceTeam.name == data["name"]).first()
            if existing:
                teams[data["name"]] = existing
                print(f"   ✓ {data['name']} - exists")
            else:
                team = MaintenanceTeam(**data)
                db.add(team)
                db.flush()
                teams[data["name"]] = team
                print(f"   + {data['name']}")
        
        # ========================================
        # ASSIGN TEAM MEMBERS
        # ========================================
        print("\n👥 Assigning team members...")
        team_assignments = [
            ("Mechanics Team", "tech.mike@gearguard.com"),
            ("Mechanics Team", "tech.emily@gearguard.com"),
            ("Electrical Team", "tech.david@gearguard.com"),
            ("Electrical Team", "tech.emily@gearguard.com"),  # Emily in 2 teams
            ("IT Support", "tech.alex@gearguard.com"),
            ("HVAC Team", "tech.david@gearguard.com"),  # David in 2 teams
        ]
        
        for team_name, user_email in team_assignments:
            team = teams[team_name]
            user = users[user_email]
            existing = db.query(TeamMember).filter(
                TeamMember.team_id == team.id,
                TeamMember.user_id == user.id
            ).first()
            if not existing:
                db.add(TeamMember(team_id=team.id, user_id=user.id))
                print(f"   + {user.name} → {team_name}")
        
        # ========================================
        # CREATE EQUIPMENT
        # ========================================
        print("\n🏭 Creating equipment...")
        equipment_data = [
            # Machines (Mechanics Team)
            {"name": "CNC Machine Alpha", "serial_number": "CNC-001", "category": "Machine", "department": "Production", "location": "Building A - Floor 1", "team": "Mechanics Team", "employee": "user@gearguard.com"},
            {"name": "CNC Machine Beta", "serial_number": "CNC-002", "category": "Machine", "department": "Production", "location": "Building A - Floor 1", "team": "Mechanics Team"},
            {"name": "Industrial Press #1", "serial_number": "PRESS-001", "category": "Machine", "department": "Production", "location": "Building A - Floor 2", "team": "Mechanics Team"},
            {"name": "Lathe Machine", "serial_number": "LATHE-001", "category": "Machine", "department": "Production", "location": "Building B", "team": "Mechanics Team"},
            
            # Vehicles (Mechanics Team)
            {"name": "Forklift #1", "serial_number": "FL-001", "category": "Vehicle", "department": "Warehouse", "location": "Dock A", "team": "Mechanics Team"},
            {"name": "Forklift #2", "serial_number": "FL-002", "category": "Vehicle", "department": "Warehouse", "location": "Dock B", "team": "Mechanics Team"},
            {"name": "Delivery Van", "serial_number": "VAN-001", "category": "Vehicle", "department": "Logistics", "location": "Parking Lot", "team": "Mechanics Team"},
            
            # Electrical (Electrical Team)
            {"name": "Main Power Panel", "serial_number": "PWR-001", "category": "Other", "department": "Facilities", "location": "Electrical Room", "team": "Electrical Team"},
            {"name": "Generator Backup", "serial_number": "GEN-001", "category": "Other", "department": "Facilities", "location": "Basement", "team": "Electrical Team"},
            {"name": "Industrial Printer", "serial_number": "PRT-001", "category": "Machine", "department": "Production", "location": "Print Room", "team": "Electrical Team"},
            
            # Computers (IT Support)
            {"name": "Admin Workstation", "serial_number": "PC-001", "category": "Computer", "department": "Admin", "location": "Office 101", "team": "IT Support", "employee": "admin@gearguard.com"},
            {"name": "Manager Laptop", "serial_number": "LAP-001", "category": "Computer", "department": "Management", "location": "Office 201", "team": "IT Support", "employee": "manager@gearguard.com"},
            {"name": "Design Workstation", "serial_number": "PC-002", "category": "Computer", "department": "Design", "location": "Creative Lab", "team": "IT Support"},
            {"name": "Server Rack #1", "serial_number": "SRV-001", "category": "Computer", "department": "IT", "location": "Server Room", "team": "IT Support"},
            
            # HVAC
            {"name": "Central AC Unit", "serial_number": "AC-001", "category": "Other", "department": "Facilities", "location": "Rooftop", "team": "HVAC Team"},
            {"name": "Air Compressor", "serial_number": "COMP-001", "category": "Tool", "department": "Maintenance", "location": "Workshop", "team": "HVAC Team"},
        ]
        
        equipment_map = {}
        for data in equipment_data:
            existing = db.query(Equipment).filter(Equipment.serial_number == data["serial_number"]).first()
            if existing:
                equipment_map[data["serial_number"]] = existing
                print(f"   ✓ {data['name']} - exists")
            else:
                eq = Equipment(
                    name=data["name"],
                    serial_number=data["serial_number"],
                    category=data["category"],
                    department=data["department"],
                    location=data["location"],
                    maintenance_team_id=teams[data["team"]].id,
                    assigned_employee_id=users.get(data.get("employee"), {}).id if data.get("employee") else None,
                    purchase_date=date.today() - timedelta(days=365 + hash(data["serial_number"]) % 730),
                    warranty_expiry=date.today() + timedelta(days=hash(data["serial_number"]) % 365),
                )
                db.add(eq)
                db.flush()
                equipment_map[data["serial_number"]] = eq
                print(f"   + {data['name']} ({data['category']})")
        
        # ========================================
        # CREATE MAINTENANCE REQUESTS
        # ========================================
        print("\n📋 Creating maintenance requests...")
        requests_data = [
            # NEW requests
            {"subject": "Oil Leak Detected", "desc": "Hydraulic oil leaking from main cylinder", "type": "corrective", "status": "new", "equipment": "CNC-001", "team": "Mechanics Team"},
            {"subject": "Strange Grinding Noise", "desc": "Unusual noise when machine starts", "type": "corrective", "status": "new", "equipment": "CNC-002", "team": "Mechanics Team"},
            {"subject": "Forklift Won't Start", "desc": "Battery seems dead", "type": "corrective", "status": "new", "equipment": "FL-001", "team": "Mechanics Team"},
            {"subject": "Blue Screen Error", "desc": "Workstation crashes frequently", "type": "corrective", "status": "new", "equipment": "PC-002", "team": "IT Support"},
            
            # IN PROGRESS requests (assigned)
            {"subject": "Brake Inspection", "desc": "Regular brake check and adjustment", "type": "corrective", "status": "in_progress", "equipment": "FL-002", "team": "Mechanics Team", "assigned": "tech.mike@gearguard.com"},
            {"subject": "Network Issue", "desc": "Slow network in Design Lab", "type": "corrective", "status": "in_progress", "equipment": "PC-002", "team": "IT Support", "assigned": "tech.alex@gearguard.com"},
            {"subject": "Power Fluctuation", "desc": "Voltage drops in Building A", "type": "corrective", "status": "in_progress", "equipment": "PWR-001", "team": "Electrical Team", "assigned": "tech.david@gearguard.com"},
            
            # REPAIRED requests
            {"subject": "Oil Change Complete", "desc": "Routine oil change", "type": "preventive", "status": "repaired", "equipment": "VAN-001", "team": "Mechanics Team", "assigned": "tech.mike@gearguard.com", "duration": 2.5},
            {"subject": "RAM Upgrade", "desc": "Upgraded to 32GB", "type": "corrective", "status": "repaired", "equipment": "LAP-001", "team": "IT Support", "assigned": "tech.alex@gearguard.com", "duration": 1.0},
            {"subject": "Filter Replaced", "desc": "AC filter replacement", "type": "preventive", "status": "repaired", "equipment": "AC-001", "team": "HVAC Team", "assigned": "tech.david@gearguard.com", "duration": 0.5},
            
            # PREVENTIVE (scheduled) - future dates
            {"subject": "Monthly Press Inspection", "desc": "Check hydraulics and safety", "type": "preventive", "status": "new", "equipment": "PRESS-001", "team": "Mechanics Team", "scheduled": date.today() + timedelta(days=3)},
            {"subject": "Server Maintenance", "desc": "Backup and updates", "type": "preventive", "status": "new", "equipment": "SRV-001", "team": "IT Support", "scheduled": date.today() + timedelta(days=5)},
            {"subject": "Generator Test Run", "desc": "Monthly test", "type": "preventive", "status": "new", "equipment": "GEN-001", "team": "Electrical Team", "scheduled": date.today() + timedelta(days=7)},
            {"subject": "AC Checkup", "desc": "Pre-summer inspection", "type": "preventive", "status": "new", "equipment": "AC-001", "team": "HVAC Team", "scheduled": date.today() + timedelta(days=10)},
            
            # OVERDUE request (past scheduled date)
            {"subject": "Overdue Lathe Calibration", "desc": "Precision calibration needed", "type": "preventive", "status": "new", "equipment": "LATHE-001", "team": "Mechanics Team", "scheduled": date.today() - timedelta(days=3)},
        ]
        
        for data in requests_data:
            equipment = equipment_map.get(data["equipment"])
            team = teams[data["team"]]
            assigned_user = users.get(data.get("assigned"))
            
            # Check if similar request exists
            existing = db.query(MaintenanceRequest).filter(
                MaintenanceRequest.subject == data["subject"],
                MaintenanceRequest.equipment_id == equipment.id if equipment else None
            ).first()
            
            if not existing:
                req = MaintenanceRequest(
                    subject=data["subject"],
                    description=data["desc"],
                    request_type=data["type"],
                    status=data["status"],
                    equipment_id=equipment.id if equipment else None,
                    maintenance_team_id=team.id,
                    assigned_to=assigned_user.id if assigned_user else None,
                    scheduled_date=data.get("scheduled"),
                    duration_hours=data.get("duration"),
                    created_by=users["manager@gearguard.com"].id,
                )
                db.add(req)
                print(f"   + {data['subject']} ({data['status']})")
        
        db.commit()
        
        # ========================================
        # PRINT CREDENTIALS
        # ========================================
        print("\n" + "=" * 50)
        print("✅ DATABASE SEEDED SUCCESSFULLY!")
        print("=" * 50)
        print("\n🔑 LOGIN CREDENTIALS (Password: demo123)")
        print("-" * 50)
        print("| Role       | Email                      |")
        print("-" * 50)
        print("| Admin      | admin@gearguard.com        |")
        print("| Manager    | manager@gearguard.com      |")
        print("| Technician | tech.mike@gearguard.com    | ← Mechanics")
        print("| Technician | tech.emily@gearguard.com   | ← Mechanics + Electrical")
        print("| Technician | tech.david@gearguard.com   | ← Electrical + HVAC")
        print("| Technician | tech.alex@gearguard.com    | ← IT Support")
        print("| User       | user@gearguard.com         |")
        print("-" * 50)
        print("\n📊 DATA CREATED:")
        print(f"   • {len(users_data)} Users")
        print(f"   • {len(teams_data)} Teams")
        print(f"   • {len(equipment_data)} Equipment")
        print(f"   • {len(requests_data)} Maintenance Requests")
        print("\n🎬 Ready for demo recording!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
