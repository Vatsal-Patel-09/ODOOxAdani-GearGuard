# GearGuard - The Ultimate Maintenance Tracker

A comprehensive maintenance management system  enabling companies to track assets and manage maintenance requests with RBAC, RACI matrix, workflow state machine, auto-fill, scrap logic, team-scoped access, and more.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Demo Credentials](#-demo-credentials)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)

---
Video Link: https://www.youtube.com/watch?v=m7mLU0dOr6o
--

## Demo Video and Images 

| | |
|:---:|:---:|
| ![Dashboard](https://github.com/Vatsal-Patel-09/ODOOxAdani-GearGuard/blob/dhruv/Assests/dashboard.png?raw=true) | ![equiqment](https://github.com/Vatsal-Patel-09/ODOOxAdani-GearGuard/blob/dhruv/Assests/equiement.png?raw=true) |
| ![requests](https://github.com/Vatsal-Patel-09/ODOOxAdani-GearGuard/blob/dhruv/Assests/requets.png?raw=true) | ![smart](https://github.com/Vatsal-Patel-09/ODOOxAdani-GearGuard/blob/dhruv/Assests/smart.png?raw=true) |
| ![teams](https://github.com/Vatsal-Patel-09/ODOOxAdani-GearGuard/blob/dhruv/Assests/teams.png?raw=true) | ![calender](https://github.com/Vatsal-Patel-09/ODOOxAdani-GearGuard/blob/dhruv/Assests/calender.png?raw=true) |

---
## Database Architecture 

<img src="https://github.com/Vatsal-Patel-09/ODOOxAdani-GearGuard/blob/dhruv/Assests/database%20schema.png?raw=true" alt="Database Architecture">

---

## ✨ Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **Equipment Management** | Track machines, vehicles, computers with department & location |
| **Maintenance Teams** | Create specialized teams (Mechanics, Electricians, IT) |
| **Maintenance Requests** | Corrective (breakdown) & Preventive (scheduled) requests |
| **Kanban Board** | Drag & drop workflow: New → In Progress → Repaired → Scrap |
| **Calendar View** | Schedule and visualize preventive maintenance |
| **Smart Button** | Equipment detail shows count of open requests |

### Security & Workflow

| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure token-based auth with role information |
| **Role-Based Access Control** | 4 roles: Admin, Manager, Technician, User |
| **Team-Scoped Access** | Technicians only see their team's requests |
| **Status State Machine** | Enforced workflow transitions |
| **Scrap Logic** | Scrapping equipment marks it as unusable |
| **Auto-Fill** | Request auto-inherits team from equipment |

---

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** database
- **Alembic** - Database migrations
- **PyJWT** - JWT token handling
- **Passlib + Bcrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Icon library

---


### Backend Structure
```
backend/
├── app/
│   ├── api/           # REST API routes
│   │   ├── auth.py    # Login, register, /me
│   │   ├── equipment.py
│   │   ├── teams.py
│   │   ├── requests.py
│   │   └── deps.py    # get_current_user, require_role
│   ├── core/
│   │   ├── jwt.py     # Token creation/verification
│   │   └── workflow.py # Status state machine
│   ├── db/
│   │   ├── models/    # SQLAlchemy models
│   │   └── session.py # Database connection
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   └── seed.py        # Demo data seeder
├── alembic/           # Migrations
└── requirements.txt
```

### Frontend Structure
```
frontend/
├── app/
│   ├── (auth)/        # Login & Register pages
│   ├── (dashboard)/   # Protected pages
│   │   ├── dashboard/ # Stats overview
│   │   ├── equipment/ # Equipment list + [id] detail
│   │   ├── teams/     # Team management
│   │   ├── requests/  # Kanban board
│   │   └── calendar/  # Preventive scheduling
│   └── layout.tsx     # Root layout with AuthProvider
├── components/
│   ├── AuthProvider.tsx
│   ├── AppSidebar.tsx
│   └── ui/            # shadcn components
└── lib/
    └── api.ts         # API client functions
```

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
alembic upgrade head

# Seed demo data
python -m app.seed

# Start server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔑 Demo Credentials

All passwords: `demo123`

| Role | Email | Permissions |
|------|-------|-------------|
| **Admin** | `admin@gearguard.com` | Full access - teams, scrap, delete |
| **Manager** | `manager@gearguard.com` | Equipment, preventive requests, assign anyone |
| **Technician** | `tech.mike@gearguard.com` | Mechanics team only, self-assign |
| **Technician** | `tech.alex@gearguard.com` | IT Support team only |
| **User** | `user@gearguard.com` | Create corrective, view own requests |

---

## 📚 API Documentation

Interactive API docs available at: `http://localhost:8000/docs`

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login, get JWT | Public |
| GET | `/auth/me` | Get current user | Bearer |
| GET | `/equipment` | List equipment | Bearer |
| POST | `/equipment` | Create equipment | Manager+ |
| GET | `/equipment/{id}` | Equipment detail | Bearer |
| GET | `/equipment/{id}/request-count` | Smart button count | Bearer |
| GET | `/teams` | List teams | Bearer |
| POST | `/teams` | Create team | Admin |
| GET | `/requests` | List requests (team-scoped) | Bearer |
| POST | `/requests` | Create request | Bearer |
| PATCH | `/requests/{id}/status` | Update status (state machine) | Technician+ |
| GET | `/requests/calendar` | Calendar view | Bearer |
| GET | `/stats` | Dashboard statistics | Bearer |

---

## 👥 User Roles & Permissions

### Permission Matrix

| Action | User | Technician | Manager | Admin |
|--------|:----:|:----------:|:-------:|:-----:|
| View equipment | ✅ | ✅ | ✅ | ✅ |
| Create equipment | ❌ | ❌ | ✅ | ✅ |
| Delete equipment | ❌ | ❌ | ❌ | ✅ |
| Manage teams | ❌ | ❌ | ❌ | ✅ |
| Create corrective request | ✅ | ✅ | ✅ | ✅ |
| Create preventive request | ❌ | ❌ | ✅ | ✅ |
| Assign to self | ❌ | ✅ | ✅ | ✅ |
| Assign to others | ❌ | ❌ | ✅ | ✅ |
| Update status | ❌ | ✅ | ✅ | ✅ |
| Move to scrap | ❌ | ❌ | ❌ | ✅ |

### Team-Scoped Access

- **Technicians** only see requests assigned to their team(s)
- **Users** only see requests they created
- **Managers/Admins** see all requests

---

## 🔄 Status Workflow (State Machine)

```
┌─────┐     ┌─────────────┐     ┌──────────┐     ┌───────┐
│ New │────▶│ In Progress │────▶│ Repaired │────▶│ Scrap │
└─────┘     └─────────────┘     └──────────┘     └───────┘
                  │                                  ▲
                  │                                  │
                  └──────────── (back to new) ──────┘
                                              (admin only)
```

Invalid transitions return `400 Bad Request`.

---

## 📁 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET_KEY=your-secret-key-here
```

---




## 📄 License

Built for ODOO x Adani Hackathon 2024

---

## 👨‍💻 Author

Vatsal <br>
Prince <br>
Siddhant <br>
Dhruv
