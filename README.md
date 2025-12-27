# GearGuard - Maintenance Management System

🔧 **The Ultimate Maintenance Tracker for Equipment and Work Centers**

GearGuard is a comprehensive maintenance management ERP system built with FastAPI (backend) and Next.js (frontend). It helps organizations track equipment, manage maintenance requests, coordinate work teams, and streamline maintenance workflows.

## 📁 Project Structure

```
ODOOxAdani-GearGuard/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── core/              # Configuration, security, dependencies
│   │   ├── db/                # Database models and session
│   │   ├── routes/            # API endpoints
│   │   └── schemas/           # Pydantic schemas
│   ├── alembic/               # Database migrations
│   ├── requirements.txt
│   └── render.yaml            # Render deployment config
├── frontend/                   # Next.js Frontend
│   ├── app/                   # App router pages
│   ├── components/            # React components (shadcn/ui)
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utilities and API client
├── docs/                      # Documentation
└── REQUIREMENTS.md            # System requirements document
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and **pnpm** (for frontend)
- **Python** 3.11+ (for backend)
- **PostgreSQL** database (we recommend [Neon](https://neon.tech) for cloud PostgreSQL)

---

## 🔧 Backend Setup

### 1. Navigate to backend directory

```bash
cd backend
```

### 2. Create and activate virtual environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create environment file

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require

# JWT Configuration (CHANGE IN PRODUCTION!)
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars

# App Settings
DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

> ⚠️ **Important:** Replace `DATABASE_URL` with your actual Neon PostgreSQL connection string.

### 5. Run database migrations

```bash
alembic upgrade head
```

### 6. Start the backend server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs (Swagger)**: http://localhost:8000/docs
- **Docs (ReDoc)**: http://localhost:8000/redoc

---

## 🎨 Frontend Setup

### 1. Navigate to frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Create environment file

Create a `.env.local` file in the `frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Start the development server

```bash
pnpm dev
```

The frontend will be available at http://localhost:3000

---

## 🔐 Authentication

The system uses JWT (JSON Web Token) authentication:

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/logout` | Logout (client-side token removal) |

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

## 📚 API Endpoints

### Equipment
- `GET /api/equipment` - List all equipment
- `POST /api/equipment` - Create equipment
- `GET /api/equipment/{id}` - Get equipment details
- `PUT /api/equipment/{id}` - Update equipment
- `DELETE /api/equipment/{id}` - Delete equipment

### Maintenance Requests
- `GET /api/requests` - List all requests
- `POST /api/requests` - Create request
- `GET /api/requests/{id}` - Get request details
- `PUT /api/requests/{id}` - Update request
- `DELETE /api/requests/{id}` - Delete request

### Teams
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create team
- `GET /api/teams/{id}` - Get team details
- `PUT /api/teams/{id}` - Update team
- `DELETE /api/teams/{id}` - Delete team

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

---

## 🗃️ Database Schema

### Core Entities

- **User** - System users with roles (admin, user, technician)
- **Equipment** - Machines and equipment to maintain
- **MaintenanceRequest** - Maintenance work orders
- **MaintenanceTeam** - Teams of technicians
- **TeamMember** - Team membership records
- **EquipmentScrapLog** - Equipment disposal records
- **RequestHistory** - Request status change history

---

## 🚢 Deployment

### Backend (Render)

The backend is configured for Render deployment via `render.yaml`:

1. Connect your GitHub repository to Render
2. Render will automatically detect the `render.yaml` configuration
3. Set environment variables in Render dashboard:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `CORS_ORIGINS` (your frontend URL)

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` (your backend URL)

---

## 🛠️ Development

### Running Both Services

**Terminal 1 (Backend):**
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
pnpm dev
```

### Creating Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

---

## 📋 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Async ORM
- **PostgreSQL** - Database (Neon cloud)
- **Alembic** - Database migrations
- **JWT** - Authentication

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Sonner** - Toast notifications

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed for the ODOO x Adani Hackathon.

---

## 🆘 Troubleshooting

### Common Issues

**1. Database connection failed**
- Ensure `DATABASE_URL` is correct in `.env`
- Check if the database is accessible
- Verify SSL mode is enabled for Neon (`?sslmode=require`)

**2. CORS errors**
- Update `CORS_ORIGINS` in backend `.env` to include frontend URL
- Restart the backend server after changing environment variables

**3. Module not found errors**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

**4. Frontend API errors**
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Ensure backend is running and accessible

---

Built with ❤️ for GearGuard - The Ultimate Maintenance Tracker
