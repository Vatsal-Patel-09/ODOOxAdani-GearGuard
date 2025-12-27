# GearGuard - Maintenance Management System
## Requirements Analysis & System Design Document

---

## 1. System Overview

**Purpose:** A comprehensive maintenance management system to track company assets (equipment & work centers) and manage maintenance requests throughout their lifecycle.

**Core Philosophy:** Seamlessly connect four pillars:
- **Equipment / Work Centers** → What needs maintenance
- **Teams** → Who fixes it  
- **Requests** → The work to be done
- **Company** → Multi-company support

---

## 2. Data Models & Entities

### 2.1 Company

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | Primary key | ✓ |
| `name` | String | Company name (e.g., "My Company (San Francisco)") | ✓ |
| `code` | String | Short code | Optional |
| `is_active` | Boolean | Company status | ✓ |
| `created_at` | Timestamp | Record creation time | ✓ |
| `updated_at` | Timestamp | Last modification time | ✓ |

---

### 2.2 User (Employee/Technician)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | Primary key | ✓ |
| `email` | String | Login email (unique) | ✓ |
| `password_hash` | String | Encrypted password (8+ chars, special char required) | ✓ |
| `name` | String | Full name | ✓ |
| `avatar_url` | String | Profile picture URL | Optional |
| `role` | Enum | Admin, Manager, Technician, User | ✓ |
| `company_id` | FK → Company | Which company user belongs to | ✓ |
| `is_active` | Boolean | Account status | ✓ |
| `created_at` | Timestamp | Record creation time | ✓ |
| `updated_at` | Timestamp | Last modification time | ✓ |

**Validation Rules:**
- Email must be unique (no duplicates)
- Password: minimum 8 characters, must contain special character
- Password confirmation must match

---

### 2.3 Equipment Category

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | Primary key | ✓ |
| `name` | String | Category name (Computers, Software, Monitors, etc.) | ✓ |
| `responsible_id` | FK → User | Default responsible person | Optional |
| `company_id` | FK → Company | Which company | ✓ |
| `created_at` | Timestamp | Record creation time | ✓ |
| `updated_at` | Timestamp | Last modification time | ✓ |

**Examples:** Computers, Software, Monitors, Machines, Vehicles

---

### 2.4 Equipment

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | Primary key | ✓ |
| `name` | String | Equipment name (e.g., "Samsung Monitor 15") | ✓ |
| `category_id` | FK → EquipmentCategory | Equipment type | ✓ |
| `company_id` | FK → Company | Which company owns this | ✓ |
| `used_by_id` | FK → User | Employee currently using it | Optional |
| `technician_id` | FK → User | Default technician for repairs | Optional |
| `employee_id` | FK → User | Responsible employee | Optional |
| `maintenance_team_id` | FK → MaintenanceTeam | Default team for repairs | Optional |
| `work_center_id` | FK → WorkCenter | Associated work center | Optional |
| `assigned_date` | Date | When equipment was assigned | Optional |
| `scrap_date` | Date | When equipment was scrapped | Optional |
| `used_in_location` | String | Physical location | Optional |
| `description` | Text | Additional information | Optional |
| `is_active` | Boolean | Is equipment usable (false = scrapped) | ✓ |
| `created_at` | Timestamp | Record creation time | ✓ |
| `updated_at` | Timestamp | Last modification time | ✓ |

**Smart Button:** "Maintenance" button shows count of open requests for this equipment

---

### 2.5 Work Center

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | Primary key | ✓ |
| `name` | String | Work center name (e.g., "Assembly 1", "Drill 1") | ✓ |
| `code` | String | Short code | Optional |
| `tag` | String | Classification tag | Optional |
| `alternative_workcenter_ids` | Array[FK] | Alternative work centers | Optional |
| `cost_per_hour` | Decimal | Hourly cost (e.g., 1.00) | Optional |
| `capacity` | Decimal | Production capacity | Optional |
| `time_efficiency` | Decimal | Time efficiency % (e.g., 100.00) | Optional |
| `oee_target` | Decimal | OEE target % (e.g., 34.59, 90.00) | Optional |
| `company_id` | FK → Company | Which company | ✓ |
| `is_active` | Boolean | Is work center operational | ✓ |
| `created_at` | Timestamp | Record creation time | ✓ |
| `updated_at` | Timestamp | Last modification time | ✓ |

---

### 2.6 Maintenance Team

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | Primary key | ✓ |
| `name` | String | Team name (Internal Maintenance, Metrology, Subcontractor) | ✓ |
| `company_id` | FK → Company | Which company | ✓ |
| `is_active` | Boolean | Is team operational | ✓ |
| `created_at` | Timestamp | Record creation time | ✓ |
| `updated_at` | Timestamp | Last modification time | ✓ |

**Relationships:**
- One Team → Many Team Members (Users)

---

### 2.7 Team Member (User-Team Association)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | Primary key | ✓ |
| `user_id` | FK → User | The technician | ✓ |
| `team_id` | FK → MaintenanceTeam | Which team they belong to | ✓ |
| `joined_at` | Timestamp | When they joined the team | ✓ |

**Business Rule:** A user can belong to multiple teams.

---

### 2.8 Maintenance Request (Core Transaction)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | Primary key | ✓ |
| `subject` | String | Brief description ("Test activity") | ✓ |
| `maintenance_for` | Enum | **Equipment** or **Work Center** | ✓ |
| `equipment_id` | FK → Equipment | Which equipment (if maintenance_for = Equipment) | Conditional |
| `work_center_id` | FK → WorkCenter | Which work center (if maintenance_for = Work Center) | Conditional |
| `category_id` | FK → EquipmentCategory | Auto-filled from equipment | Optional |
| `request_date` | Date | When request was made | ✓ |
| `maintenance_type` | Enum | **Corrective** / **Preventive** | ✓ |
| `stage` | Enum | New Request, In Progress, Repaired, Scrap | ✓ |
| `created_by_id` | FK → User | Who created the request | ✓ |
| `team_id` | FK → MaintenanceTeam | Maintenance team assigned | Optional |
| `technician_id` | FK → User | Assigned technician | Optional |
| `scheduled_date` | DateTime | When should work happen (e.g., "12/28/2025 14:30:00") | Optional |
| `duration_hours` | Decimal | Hours spent on repair (e.g., 00:00) | Optional |
| `priority` | Integer | Priority level 0-3 (shown as ⬥⬥⬥ diamonds) | ✓ |
| `company_id` | FK → Company | Which company | ✓ |
| `notes` | Text | Additional notes (Tab 1) | Optional |
| `instructions` | Text | Work instructions (Tab 2) | Optional |
| `created_at` | Timestamp | Request creation time | ✓ |
| `updated_at` | Timestamp | Last modification | ✓ |

**Smart Button:** "Worksheet" button opens comment/worksheet section

---

## 3. Enumerations

### 3.1 Maintenance For (Request Target)
```
EQUIPMENT     - Request is for an Equipment item
WORK_CENTER   - Request is for a Work Center
```

### 3.2 Maintenance Type
```
CORRECTIVE   - Unplanned repair (something broke) ● 
PREVENTIVE   - Planned maintenance (routine checkup) ○
```

### 3.3 Request Stage
```
NEW_REQUEST   - Just created, awaiting assignment
IN_PROGRESS   - Technician is working on it (🟢 green)
REPAIRED      - Work completed successfully
SCRAP         - Equipment cannot be repaired, marked for disposal
```

**Stage Status Indicators:**
- 🟢 In Progress
- 🔴 Blocked
- 🟢 Ready for next stage

### 3.4 Priority (Visual Diamonds)
```
0 - ◇◇◇  (No priority / Low)
1 - ⬥◇◇  (Medium)
2 - ⬥⬥◇  (High)
3 - ⬥⬥⬥  (Critical)
```

### 3.5 User Role
```
ADMIN        - Full system access
MANAGER      - Can manage teams, view reports, assign work
TECHNICIAN   - Can pick up and complete requests
USER         - Can create requests, view own equipment
```

---

## 4. Business Logic & Workflows

### 4.1 Flow 1: Corrective Maintenance (Breakdown)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CORRECTIVE MAINTENANCE FLOW                      │
└─────────────────────────────────────────────────────────────────────┘

Step 1: CREATE REQUEST
        │
        │ Any user reports a problem
        │ Selects: Maintenance For = Equipment OR Work Center
        │
        ▼
Step 2: SELECT TARGET
        │
        │ If Equipment selected:
        │   → Show Equipment dropdown
        │   → Auto-fill Category from equipment
        │   → Auto-fill Team from equipment
        │   → Auto-fill Technician from equipment
        │
        │ If Work Center selected:
        │   → Show Work Center dropdown
        │
        ▼
Step 3: NEW REQUEST STAGE
        │
        │ Request appears on Dashboard
        │ Stage = "New Request"
        │ Visible to all team members
        │
        ▼
Step 4: ASSIGNMENT
        │
        │ Manager assigns OR
        │ Technician self-assigns (picks up)
        │ technician_id is set
        │
        ▼
Step 5: IN PROGRESS
        │
        │ Technician moves to "In Progress"
        │ Status shows green indicator
        │
        ▼
Step 6: COMPLETION
        │
        │ Technician records:
        │   • Duration (hours spent)
        │   • Notes/Instructions
        │ Moves to "Repaired"
        │
        ▼
       DONE ✓
```

### 4.2 Flow 2: Preventive Maintenance (Routine Checkup)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PREVENTIVE MAINTENANCE FLOW                      │
└─────────────────────────────────────────────────────────────────────┘

Step 1: SCHEDULE REQUEST
        │
        │ Manager creates request
        │ Type = "Preventive" (○)
        │ Sets Scheduled Date & Time
        │
        ▼
Step 2: CALENDAR VISIBILITY
        │
        │ Request appears on Maintenance Calendar
        │ On the specific scheduled date/time
        │ Weekly view: Sun-Sat with time slots
        │
        ▼
Step 3: EXECUTION
        │
        │ On scheduled date, technician:
        │   • Moves to "In Progress"
        │   • Performs routine maintenance
        │
        ▼
Step 4: COMPLETION
        │
        │ Records duration & notes
        │ Moves to "Repaired"
        │
        ▼
       DONE ✓
```

### 4.3 Scrap Logic

```
When request.stage → SCRAP:
  │
  ├─► Set equipment.is_active = false
  │
  ├─► Set equipment.scrap_date = today
  │
  └─► Equipment no longer appears in active dropdowns
```

---

## 5. Dashboard & KPI Cards

### 5.1 Dashboard Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Navigation: Maintenance | Dashboard | Maintenance Calendar | Equipment |   │
│              Reporting | Teams                                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  [+ New]                    🔍 Search...                           ▼       │
│                                                                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ 🔴 Critical     │  │ 🔵 Technician   │  │ 🟢 Open         │            │
│  │    Equipment    │  │    Load         │  │    Requests     │            │
│  │                 │  │                 │  │                 │            │
│  │    5 Units      │  │  85% Utilized   │  │  12 Pending     │            │
│  │  (Health < 30%) │  │ (Assign Carefully)│ │   3 Overdue     │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ Subject     │ Employee      │ Technician │ Category │ Stage │Company│  │
│  ├────────────────────────────────────────────────────────────────────┤   │
│  │ Test activity│ Mitchell Admin│ Aka Foster │ computer │New Req│My Co │   │
│  │ ...          │ ...           │ ...        │ ...      │ ...   │ ...  │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 KPI Card Definitions

| Card | Color | Metric | Description |
|------|-------|--------|-------------|
| Critical Equipment | 🔴 Red | Count | Equipment where health/condition < 30% |
| Technician Load | 🔵 Blue | Percentage | Workforce utilization % with warning |
| Open Requests | 🟢 Green | Count | Pending + Overdue requests |

---

## 6. API Endpoints Structure

### 6.1 Authentication
```
POST   /api/auth/register        - Create new user (with validation)
POST   /api/auth/login           - Get JWT token
POST   /api/auth/forgot-password - Password reset request
GET    /api/auth/me              - Get current user
```

### 6.2 Companies
```
GET    /api/companies            - List all companies
GET    /api/companies/:id        - Get single company
POST   /api/companies            - Create company
PUT    /api/companies/:id        - Update company
```

### 6.3 Equipment Categories
```
GET    /api/equipment-categories           - List all
GET    /api/equipment-categories/:id       - Get single
POST   /api/equipment-categories           - Create
PUT    /api/equipment-categories/:id       - Update
DELETE /api/equipment-categories/:id       - Delete
```

### 6.4 Equipment
```
GET    /api/equipment            - List all (with filters: category, company, team)
GET    /api/equipment/:id        - Get single equipment
POST   /api/equipment            - Create equipment
PUT    /api/equipment/:id        - Update equipment
DELETE /api/equipment/:id        - Soft delete (set is_active = false)
GET    /api/equipment/:id/requests          - Get all requests for this equipment
GET    /api/equipment/:id/requests/count    - Get open request count (for smart button)
```

### 6.5 Work Centers
```
GET    /api/work-centers         - List all
GET    /api/work-centers/:id     - Get single work center
POST   /api/work-centers         - Create work center
PUT    /api/work-centers/:id     - Update work center
DELETE /api/work-centers/:id     - Delete work center
GET    /api/work-centers/:id/requests       - Get all requests for this work center
```

### 6.6 Maintenance Teams
```
GET    /api/teams                - List all teams
GET    /api/teams/:id            - Get single team with members
POST   /api/teams                - Create team
PUT    /api/teams/:id            - Update team
DELETE /api/teams/:id            - Delete team
POST   /api/teams/:id/members    - Add member to team
DELETE /api/teams/:id/members/:userId - Remove member
```

### 6.7 Maintenance Requests
```
GET    /api/requests             - List all (filters: stage, type, team, technician, equipment, work_center)
GET    /api/requests/:id         - Get single request
POST   /api/requests             - Create request (triggers auto-fill)
PUT    /api/requests/:id         - Update request
DELETE /api/requests/:id         - Delete request
PATCH  /api/requests/:id/stage   - Change stage (triggers workflows)
PATCH  /api/requests/:id/assign  - Assign technician

GET    /api/requests/kanban      - Get requests grouped by stage
GET    /api/requests/calendar    - Get scheduled requests for calendar view
```

### 6.8 Dashboard & Reports
```
GET    /api/dashboard/kpis                  - Get KPI card data
GET    /api/dashboard/requests              - Get request list for dashboard
GET    /api/reports/requests-by-team        - Count per team
GET    /api/reports/requests-by-category    - Count per equipment category
GET    /api/reports/technician-utilization  - Utilization percentage
```

### 6.9 Users
```
GET    /api/users                - List users
GET    /api/users/:id            - Get user details
PUT    /api/users/:id            - Update user
GET    /api/users/technicians    - List only technicians (for assignment dropdown)
GET    /api/users/employees      - List employees (for equipment assignment)
```

---

## 7. User Interface Views

### 7.1 Maintenance Request Form

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [New]  Maintenance Requests > Test activity     📝 Worksheet              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Stages: [New Request] → [In Progress] → [Repaired] → [Scrap]    ○────●   │
│                                                   🟢 In Progress           │
│                                                   🔴 Blocked               │
│                                                   🟢 Ready for next stage  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Subject?                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ Test activity                                                         │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐ │
│  │ LEFT COLUMN                 │  │ RIGHT COLUMN                        │ │
│  ├─────────────────────────────┤  ├─────────────────────────────────────┤ │
│  │ Created By    Mitchell Admin│  │ Team          Internal Maintenance  │ │
│  │                             │  │                                     │ │
│  │ Maintenance   ┌───────────┐ │  │ Technician    Aka Foster            │ │
│  │ For           │ Equipment▼│ │  │                                     │ │
│  │               │Work Center│ │  │ Scheduled     12/28/2025 14:30:00   │ │
│  │               └───────────┘ │  │ Date?                               │ │
│  │                             │  │                                     │ │
│  │ Equipment     Acer Laptop ▼ │  │ Duration      00:00 hours           │ │
│  │               LP/203/...    │  │                                     │ │
│  │                             │  │ Priority      ⬥ ⬥ ⬥                 │ │
│  │ Category      Computers     │  │                                     │ │
│  │                             │  │ Company       My Company (SF)       │ │
│  │ Request Date? 12/18/2025    │  │                                     │ │
│  │                             │  │                                     │ │
│  │ Maintenance   ● Corrective  │  │                                     │ │
│  │ Type          ○ Preventive  │  │                                     │ │
│  └─────────────────────────────┘  └─────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ [Notes] [Instructions]                                                │ │
│  │                                                                       │ │
│  │ _____________________________________________________________________│ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Equipment Form

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [New]  Equipment                                    📝 Maintenance (3)     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐ │
│  │ LEFT COLUMN                 │  │ RIGHT COLUMN                        │ │
│  ├─────────────────────────────┤  ├─────────────────────────────────────┤ │
│  │ Name?         Samsung       │  │ Technician?   Mitchell Admin        │ │
│  │               Monitor 15"   │  │                                     │ │
│  │                             │  │ Employee?     Abigail Peterson      │ │
│  │ Equipment     Monitors    ▼ │  │                                     │ │
│  │ Category?                   │  │ Scrap Date?   _______________       │ │
│  │                             │  │                                     │ │
│  │ Company?      My Company  ▼ │  │ Used in       _______________       │ │
│  │               (San Fran)    │  │ Location?                           │ │
│  │                             │  │                                     │ │
│  │ Used By?      Employee    ▼ │  │ Work Center?  _______________       │ │
│  │                             │  │                                     │ │
│  │ Maintenance   Internal    ▼ │  │                                     │ │
│  │ Team?         Maintenance   │  │                                     │ │
│  │                             │  │                                     │ │
│  │ Assigned      12/24/2025    │  │                                     │ │
│  │ Date?                       │  │                                     │ │
│  └─────────────────────────────┘  └─────────────────────────────────────┘ │
│                                                                            │
│  Description                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ __________________________________________________________________ │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Work Center List View

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Work Center                                                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │Work Center│ Code │ Tag │Alternative   │Cost/Hour│Capacity│Time    │OEE│ │
│  │           │      │     │Workcenters   │         │        │Effic.  │Tgt│ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │Assembly 1 │      │     │              │  1.00   │        │ 100.00 │34.59│ │
│  │Drill 1    │      │     │              │  1.00   │        │ 100.00 │90.00│ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.4 Teams List View

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [New]  Teams                                                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ Team Name            │ Team Members      │ Company                    │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │ Internal Maintenance │ Anas Makari       │ My Company (San Francisco) │ │
│  │ Metrology            │ Marc Demo         │ My Company (San Francisco) │ │
│  │ Subcontractor        │ Maggie Davidson   │ My Company (San Francisco) │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.5 Equipment Categories List View

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [New]  Equipment Categories                                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ Name       │ Responsible     │ Company                               │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │ Computers  │ OdooBot         │ My Company (San Francisco)            │ │
│  │ Software   │ OdooBot         │ My Company (San Francisco)            │ │
│  │ Monitors   │ Mitchell Admin  │ My Company (San Francisco)            │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.6 Maintenance Calendar

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Maintenance Calendar                                                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ◄  ►  Today   December 2025  Week ▼                    ┌─ December 202 ─┐│
│                                                          │ S M T W T F S ││
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐     │     1 2 3 4 5 ││
│  │ SUN  │ MON  │ TUE  │ WED  │ THU  │ FRI  │ SAT  │     │ 6 7 8 9 ...   ││
│  │  14  │  15  │  16  │  17  │ (18) │  19  │  20  │     │ ...           ││
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤     └───────────────┘│
│  │09:00 │      │      │      │      │      │      │                      │
│  │10:00 │      │      │      │      │      │      │                      │
│  │11:00 │      │      │      │      │      │      │                      │
│  │12:00 │      │      │      │      │      │      │                      │
│  │13:00 │      │      │      │      │      │      │                      │
│  │14:00 │      │      │      │      │      │      │                      │
│  │...   │      │      │      │      │      │      │                      │
│  │23:00 │      │      │      │      │      │      │                      │
│  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘                      │
│                                                                            │
│  * Scheduled requests appear on their respective date/time slots           │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.7 Login Page

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              Login Page                                     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│                    ┌─────────────────────────────────┐                     │
│                    │                                 │                     │
│                    │  Email id      ____________     │                     │
│                    │                                 │                     │
│                    │  Password      ____________     │                     │
│                    │                                 │                     │
│                    │         ┌──────────────┐        │                     │
│                    │         │   Sign In    │        │                     │
│                    │         └──────────────┘        │                     │
│                    │                                 │                     │
│                    │    Forgot Password? | Sign up   │                     │
│                    │                                 │                     │
│                    └─────────────────────────────────┘                     │
│                                                                            │
│  Validation:                                                               │
│  - Check for login credentials                                             │
│  - Match email, and allow to Sign in user                                  │
│  - If email not found: Show error "Account not exist"                      │
│  - Password does not match: Show error msg "Invalid Password"              │
│  - When clicked on Signup, Lead to Signup page                             │
│  - When Clicked on Forgot Password: Go to Forgot Password page             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.8 Sign Up Page

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              Sign Up Page                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│                    ┌─────────────────────────────────┐                     │
│                    │                                 │                     │
│                    │  Name           ____________    │                     │
│                    │                                 │                     │
│                    │  Email id       ____________    │                     │
│                    │                                 │                     │
│                    │  Password       ____________    │                     │
│                    │                                 │                     │
│                    │  Re-Enter       ____________    │                     │
│                    │  password                       │                     │
│                    │                                 │                     │
│                    │         ┌──────────────┐        │                     │
│                    │         │   Sign Up    │        │                     │
│                    │         └──────────────┘        │                     │
│                    │                                 │                     │
│                    └─────────────────────────────────┘                     │
│                                                                            │
│  Validation:                                                               │
│  1. Email Id should not be a duplicate in database                         │
│  2. Password min 8 chars and must contain a small case, a large case and   │
│     a special character and length should be more than 8 characters        │
│  3. Password confirmation must match                                       │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Technical Architecture

### 8.1 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | FastAPI (Python) | REST API |
| **Database** | Neon (PostgreSQL) | Data persistence |
| **ORM** | SQLAlchemy (Async) | Database operations |
| **Auth** | JWT Tokens | Authentication |
| **Frontend** | React/Next.js | User interface |
| **Deployment** | Render | Cloud hosting |

### 8.2 Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── database.py             # Database connection
├── requirements.txt        # Dependencies
├── .env                    # Environment variables
│
├── models/                 # SQLAlchemy models
│   ├── __init__.py
│   ├── user.py
│   ├── company.py
│   ├── equipment_category.py
│   ├── equipment.py
│   ├── work_center.py
│   ├── team.py
│   ├── team_member.py
│   └── maintenance_request.py
│
├── schemas/                # Pydantic schemas (request/response)
│   ├── __init__.py
│   ├── auth.py
│   ├── user.py
│   ├── company.py
│   ├── equipment.py
│   ├── work_center.py
│   ├── team.py
│   └── maintenance_request.py
│
├── routers/                # API route handlers
│   ├── __init__.py
│   ├── auth.py
│   ├── users.py
│   ├── companies.py
│   ├── equipment_categories.py
│   ├── equipment.py
│   ├── work_centers.py
│   ├── teams.py
│   ├── maintenance_requests.py
│   ├── dashboard.py
│   └── reports.py
│
├── services/               # Business logic
│   ├── __init__.py
│   ├── auth_service.py
│   ├── equipment_service.py
│   ├── request_service.py  # Auto-fill, stage transitions
│   └── dashboard_service.py
│
└── utils/                  # Utilities
    ├── __init__.py
    ├── security.py         # JWT, password hashing
    └── dependencies.py     # FastAPI dependencies
```

---

## 9. Key Business Rules Summary

| Rule | Description |
|------|-------------|
| **Maintenance For Selection** | Request can be for Equipment OR Work Center (dropdown choice) |
| **Auto-Fill on Equipment Select** | When selecting equipment, auto-populate: category, team, technician |
| **Work Center Selection** | If Work Center selected, show Work Center field instead of Equipment |
| **Stage Transitions** | New Request → In Progress → Repaired (or Scrap) |
| **Scrap Effect** | Moving to Scrap sets `equipment.is_active = false` and `scrap_date = today` |
| **Calendar Display** | Show scheduled requests on Maintenance Calendar (weekly view with time) |
| **Smart Button - Equipment** | "Maintenance" button shows count of open requests |
| **Smart Button - Request** | "Worksheet" button opens comments section |
| **Priority Display** | Show as diamond icons ⬥⬥⬥ (0-3 levels) |
| **Multi-Company** | All entities belong to a company |

---

## 10. Implementation Priority

### Phase 1: Core Foundation
1. ✅ Database models (all entities including Company, WorkCenter)
2. ✅ User authentication (JWT with validation rules)
3. ✅ Basic CRUD for all entities
4. ✅ Company management

### Phase 2: Request Management
1. Maintenance request with Equipment/Work Center choice
2. Auto-fill logic on equipment selection
3. Stage transition logic
4. Scrap automation

### Phase 3: Dashboard & Views
1. Dashboard with 3 KPI cards
2. Request list view with filters
3. Calendar view (weekly with time slots)
4. Smart buttons (Maintenance count, Worksheet)

### Phase 4: Reports
1. Requests by team
2. Requests by category
3. Technician utilization

---

## 11. Navigation Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Maintenance  │  Dashboard  │  Maintenance Calendar  │  Equipment  │    │
│               │             │                        │             │    │
│               │             │                        │  ├─ Equipment List
│               │             │                        │  └─ Equipment Categories
│               │             │                        │             │    │
│  Reporting    │  Teams      │                        │             │    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

*This document captures the complete understanding of the GearGuard Maintenance Management System based on the provided wireframes.*
