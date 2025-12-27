"""
Seed script to populate the database with sample data.
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
        print("🌱 Seeding database...")
        
        # Create Users
        print("  Creating users...")
        users_data = [
            {"name": "John Smith", "email": "john@gearguard.com", "role": "admin"},
            {"name": "Sarah Johnson", "email": "sarah@gearguard.com", "role": "manager"},
            {"name": "Mike Wilson", "email": "mike@gearguard.com", "role": "technician"},
            {"name": "Emily Brown", "email": "emily@gearguard.com", "role": "technician"},
            {"name": "David Lee", "email": "david@gearguard.com", "role": "technician"},
            {"name": "Lisa Chen", "email": "lisa@gearguard.com", "role": "user"},
        ]
        
        users = []
        for data in users_data:
            existing = db.query(User).filter(User.email == data["email"]).first()
            if existing:
                users.append(existing)
            else:
                user = User(
                    name=data["name"],
                    email=data["email"],
                    password_hash=pwd_context.hash("password123"),
                    role=data["role"],
                )
                db.add(user)
                db.flush()
                users.append(user)
        
        # Create Teams
        print("  Creating teams...")
        teams_data = [
            {"name": "Mechanics", "description": "Handles mechanical equipment repairs"},
            {"name": "Electricians", "description": "Electrical systems maintenance"},
            {"name": "IT Support", "description": "Computer and network maintenance"},
        ]
        
        teams = []
        for data in teams_data:
            existing = db.query(MaintenanceTeam).filter(MaintenanceTeam.name == data["name"]).first()
            if existing:
                teams.append(existing)
            else:
                team = MaintenanceTeam(**data)
                db.add(team)
                db.flush()
                teams.append(team)
        
        # Add team members
        print("  Adding team members...")
        # Mike and Emily -> Mechanics
        # David -> Electricians
        # Emily -> IT Support
        team_assignments = [
            (teams[0].id, users[2].id),  # Mike -> Mechanics
            (teams[0].id, users[3].id),  # Emily -> Mechanics
            (teams[1].id, users[4].id),  # David -> Electricians
            (teams[2].id, users[3].id),  # Emily -> IT Support
        ]
        
        for team_id, user_id in team_assignments:
            existing = db.query(TeamMember).filter(
                TeamMember.team_id == team_id,
                TeamMember.user_id == user_id
            ).first()
            if not existing:
                db.add(TeamMember(team_id=team_id, user_id=user_id))
        
        # Create Equipment
        print("  Creating equipment...")
        equipment_data = [
            {"name": "CNC Machine A1", "serial_number": "CNC-001", "category": "Machine", "department": "Production", "location": "Building A", "maintenance_team_id": teams[0].id, "assigned_employee_id": users[5].id},
            {"name": "CNC Machine A2", "serial_number": "CNC-002", "category": "Machine", "department": "Production", "location": "Building A", "maintenance_team_id": teams[0].id},
            {"name": "Forklift #3", "serial_number": "FL-003", "category": "Vehicle", "department": "Warehouse", "location": "Dock B", "maintenance_team_id": teams[0].id},
            {"name": "Delivery Van", "serial_number": "VAN-001", "category": "Vehicle", "department": "Logistics", "location": "Parking Lot", "maintenance_team_id": teams[0].id},
            {"name": "MacBook Pro - John", "serial_number": "MAC-001", "category": "Computer", "department": "IT", "location": "Office 101", "maintenance_team_id": teams[2].id, "assigned_employee_id": users[0].id},
            {"name": "Dell Workstation", "serial_number": "DELL-002", "category": "Computer", "department": "Design", "location": "Office 205", "maintenance_team_id": teams[2].id, "assigned_employee_id": users[5].id},
            {"name": "Industrial Printer", "serial_number": "PRT-001", "category": "Machine", "department": "Production", "location": "Print Room", "maintenance_team_id": teams[1].id},
            {"name": "Air Compressor", "serial_number": "AC-001", "category": "Tool", "department": "Maintenance", "location": "Workshop", "maintenance_team_id": teams[0].id},
        ]
        
        equipment_list = []
        for data in equipment_data:
            existing = db.query(Equipment).filter(Equipment.serial_number == data["serial_number"]).first()
            if existing:
                equipment_list.append(existing)
            else:
                eq = Equipment(
                    **data,
                    purchase_date=date.today() - timedelta(days=365),
                    warranty_expiry=date.today() + timedelta(days=365),
                )
                db.add(eq)
                db.flush()
                equipment_list.append(eq)
        
        # Create Maintenance Requests
        print("  Creating maintenance requests...")
        requests_data = [
            # New requests
            {"subject": "Leaking Oil", "description": "Oil leaking from hydraulic system", "request_type": "corrective", "status": "new", "equipment_id": equipment_list[0].id, "maintenance_team_id": teams[0].id},
            {"subject": "Strange Noise", "description": "Grinding noise when running", "request_type": "corrective", "status": "new", "equipment_id": equipment_list[1].id, "maintenance_team_id": teams[0].id},
            
            # In Progress
            {"subject": "Brake Check", "description": "Brakes need inspection", "request_type": "corrective", "status": "in_progress", "equipment_id": equipment_list[2].id, "maintenance_team_id": teams[0].id, "assigned_to": users[2].id},
            {"subject": "Software Update", "description": "System update required", "request_type": "preventive", "status": "in_progress", "equipment_id": equipment_list[4].id, "maintenance_team_id": teams[2].id, "assigned_to": users[3].id},
            
            # Repaired
            {"subject": "Battery Replacement", "description": "Replace worn battery", "request_type": "corrective", "status": "repaired", "equipment_id": equipment_list[3].id, "maintenance_team_id": teams[0].id, "assigned_to": users[2].id, "duration_hours": 2.5},
            {"subject": "Monitor Calibration", "description": "Color calibration needed", "request_type": "preventive", "status": "repaired", "equipment_id": equipment_list[5].id, "maintenance_team_id": teams[2].id, "assigned_to": users[3].id, "duration_hours": 1.0},
            
            # Preventive scheduled
            {"subject": "Monthly Inspection", "description": "Regular monthly checkup", "request_type": "preventive", "status": "new", "equipment_id": equipment_list[6].id, "maintenance_team_id": teams[1].id, "scheduled_date": date.today() + timedelta(days=3)},
            {"subject": "Oil Change", "description": "Scheduled oil change", "request_type": "preventive", "status": "new", "equipment_id": equipment_list[7].id, "maintenance_team_id": teams[0].id, "scheduled_date": date.today() + timedelta(days=7)},
            
            # Overdue request
            {"subject": "Filter Replacement", "description": "Replace air filter", "request_type": "preventive", "status": "new", "equipment_id": equipment_list[7].id, "maintenance_team_id": teams[0].id, "scheduled_date": date.today() - timedelta(days=2)},
        ]
        
        for data in requests_data:
            # Check if similar request exists
            existing = db.query(MaintenanceRequest).filter(
                MaintenanceRequest.subject == data["subject"],
                MaintenanceRequest.equipment_id == data.get("equipment_id")
            ).first()
            if not existing:
                req = MaintenanceRequest(**data, created_by=users[1].id)
                db.add(req)
        
        db.commit()
        print("✅ Database seeded successfully!")
        print("\n📝 Login credentials:")
        print("   Email: john@gearguard.com")
        print("   Password: password123")
        print("\n   (All users have password: password123)")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
