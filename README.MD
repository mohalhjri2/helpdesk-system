# Helpdesk Application

Internal help desk system for managing support tickets.

Tech stack:
- Frontend: React + TypeScript + MUI
- Backend: ASP.NET Core Web API
- Database: PostgreSQL
- API Docs: Swagger

# How to Run for Mac & Windows

## Prerequisites (Local Run)

You need:
- Docker & Docker Compose
- .NET10 SDK
- Node.js v22 or later

---

## 1. Install Prerequisites

### Docker
**Mac / Windows**
- Install Docker Desktop
- Open Docker Desktop and wait until it is running

Verify:
```bash
docker --version
docker compose version
```

---

### .NET SDK
Install the .NET10 SDK used by the project.

Verify:
```bash
dotnet --version
```

If EF tools are missing:
```bash
dotnet tool install --global dotnet-ef
```

---

### Node.js
Install Node.js v22.

Verify:
```bash
node -v
npm -v
```

---

## 2. Start Database (PostgreSQL via Docker)

From the project root:
```bash
docker compose up -d
```

Verify:
```bash
docker ps
```

---

## 3. Backend Setup

Navigate to backend:
```bash
cd backend/Helpdesk.Api
```

Run migrations and start API:
```bash
dotnet restore
dotnet ef database update
dotnet run
```

API will run at:
```
http://localhost:5033
```

Swagger:
```
http://localhost:5033/swagger
```

---

## 4. Frontend Setup

Open a new terminal:
```bash
cd frontend/helpdesk-ui
npm install
npm run dev
```

Frontend will run at:
```
http://localhost:5173
```

---

## 5. Stop Services

Stop backend/frontend:
```
CTRL + C
```

Stop Docker:
```bash
docker compose down
```

Reset database:
```bash
docker compose down -v
```

---

## Notes
- Backend must be running before frontend.