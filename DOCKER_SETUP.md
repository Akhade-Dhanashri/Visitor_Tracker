# Visitor Tracker - Local Setup Guide

## Quick Start (One Command)

You have two options to run everything:

### Option 1: PowerShell (Recommended)
```powershell
cd c:\Visitor_Tracker
.\run-local-docker.ps1
```

### Option 2: Command Prompt (Batch)
```cmd
cd c:\Visitor_Tracker
run-local-docker.bat
```

Both scripts will:
1. ✓ Check Docker installation
2. ✓ Build backend image (PHP + PostgreSQL support)
3. ✓ Start PostgreSQL container
4. ✓ Start Laravel backend container
5. ✓ Run database migrations
6. ✓ Seed test users
7. ✓ Start frontend dev server

---

## What Gets Created

### Containers
- **db**: PostgreSQL 15 database
- **backend**: PHP 8.2 Apache with Laravel

### Database
- **Name**: rachana
- **User**: rachana_user
- **Password**: secret

### Test Users
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rachana.org | admin123 |
| Security Guard 1 | guard1@rachana.org | guard123 |
| Security Guard 2 | guard2@rachana.org | guard123 |

---

## Access Points

Once the setup is complete:

- **Frontend**: http://localhost:5173
  - React development server with Vite hot reload
  
- **Backend API**: http://localhost:8000
  - Laravel API endpoints
  - Available routes:
    - `GET  /api/users` - List all users
    - `POST /api/users` - Create new user
    - `GET  /api/users/{id}` - Get user by ID
    - `PUT  /api/users/{id}` - Update user
    - `POST /api/users/{id}/toggle-status` - Toggle active/inactive
    - `DELETE /api/users/{id}` - Delete user

---

## Prerequisites

### Required
- **Docker Desktop** (with Docker Compose)
  - Download: https://www.docker.com/products/docker-desktop
  - Must be running before you start the setup script

### Optional
- **Node.js** (for frontend)
  - The script installs dependencies automatically if missing
  - Version: 18.17.1+ recommended

---

## Useful Commands

### View Backend Logs
```bash
docker compose logs -f backend
```

### View Database Logs
```bash
docker compose logs -f db
```

### Stop All Containers
```bash
docker compose down
```

### Restart Backend Only
```bash
docker compose restart backend
```

### Reset Database (Delete Data)
```bash
docker compose down -v
docker compose up -d
```

### Access PostgreSQL CLI
```bash
docker compose exec db psql -U rachana_user -d rachana
```

### Access Laravel Tinker (Interactive Shell)
```bash
docker compose exec backend php artisan tinker
```

---

## Troubleshooting

### Docker Not Installed
```
Error: docker: not found
Solution: Install Docker Desktop from https://www.docker.com/products/docker-desktop
```

### Port Already in Use
If you already have services running on ports 5173, 8000, or 5432:
```bash
# Kill processes (Windows PowerShell)
Get-Process -Name node | Stop-Process -Force
Get-Process -Name php | Stop-Process -Force

# Or use Docker to change ports in docker-compose.yml
```

### Backend Takes Too Long to Start
```bash
# Check logs
docker compose logs backend

# Restart container
docker compose restart backend
```

### Database Connection Error
```bash
# Verify containers are running
docker compose ps

# Check database logs
docker compose logs db

# Reinitialize (this deletes test data)
docker compose down -v
docker compose up -d
```

---

## Project Structure

```
Visitor_Tracker/
├── frontend/              # React + Vite (port 5173)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/               # Laravel API (port 8000)
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── .env
│   ├── Dockerfile
│   └── docker-entrypoint.sh
├── docker-compose.yml     # Orchestrates containers
├── run-local-docker.ps1   # PowerShell startup script
└── run-local-docker.bat   # Batch startup script
```

---

## Feature Overview

### Admin Dashboard
- User management (create, edit, delete, toggle status)
- Visitor analytics (charts, trends)
- System settings
- Reports

### Security Guard Dashboard
- Visitor check-in/check-out
- Active visitors list
- Quick access visitor log

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: Laravel 11, PHP 8.2, PostgreSQL 15
- **Styling**: Responsive, mobile-first design with Rachana branding

---

## Next Steps

1. **Install Docker Desktop** (if not already installed)
2. **Run the setup script** (`.\run-local-docker.ps1` or `run-local-docker.bat`)
3. **Wait for containers to start** (2-3 minutes on first run)
4. **Open frontend** in browser: http://localhost:5173
5. **Login** with test credentials above

---

## Support

For issues or questions:
- Check logs: `docker compose logs -f`
- Verify Docker is running
- Ensure ports 5173, 8000, 5432 are available
- Reset and try again: `docker compose down -v && docker compose up -d`
