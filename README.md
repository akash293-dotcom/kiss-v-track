# KISS V-TRACK

## KISS Vocational Training & Skill Tracking System

> **Learn. Practice. Create. Get Skilled.**

A production-grade, full-stack web application for the Kalinga Institute of Social Sciences (KISS) to manage, monitor, and track vocational training and skills acquired by trainees.

KISS V-TRACK functions as a **Digital Vocational Skill Passport + Training Management System**, answering:

> *"What vocational skills has a KISS trainee learned, practiced, demonstrated, and had verified?"*

---

## 🏗 Architecture

```
kiss-v-track/
├── apps/
│   ├── web/          # React + TypeScript + Vite frontend
│   └── api/          # Node.js + Express + TypeScript backend
├── packages/
│   └── shared/       # Shared types, validation, constants
├── prisma/           # Database schema & migrations
├── docker/           # Docker configuration
├── .github/workflows # CI/CD pipelines
└── docs/             # Documentation
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Recharts |
| **Backend** | Node.js, Express.js, TypeScript, Zod validation |
| **Database** | PostgreSQL 16, Prisma ORM |
| **Auth** | JWT, bcrypt, RBAC |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL 16+ (or Docker)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd kiss-v-track

# Copy environment file
cp .env.example .env

# Start all services
docker compose up -d

# Run database migrations & seed
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development servers
npm run dev
```

---

## 🔑 Development Credentials

> ⚠️ **DEVELOPMENT ONLY** — Never use in production

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@kiss-vtrack.dev` | `Admin@123` |
| Trainer | `priya.trainer@kiss-vtrack.dev` | `Trainer@123` |
| Trainee | `anita.trainee@kiss-vtrack.dev` | `Trainee@123` |

---

## 👥 User Roles

### Admin
Full system access: manage trainees, trainers, programs, batches, assessments, certificates, reports.

### Trainer
Manage assigned batches, mark attendance, create tasks, review products, assess & verify skills.

### Trainee
View training progress, submit products, track skills, download certificates, view Skill Passport.

### Centre Admin (Optional)
Scoped admin access limited to their assigned campus/centre.

---

## 📋 Core Features

### Training Lifecycle
```
Trainee → Vocational Elective → Training Batch → Training Schedule → 
Attendance → Modules → Skills → Practical Training → Product/Project → 
Assessment → Trainer Verification → Training Completion → Certificate
```

### Key Capabilities

- **📊 Dashboards** — Role-specific dashboards with real-time metrics
- **🎯 Skill Tracking** — Track skill status from Learning → Verified
- **📦 Product Management** — Track products from Idea → Approved
- **✅ Attendance** — Session-linked attendance with automatic % calculation
- **📝 Assessments** — Theory, practical, product, and final assessments
- **🏆 Certificates** — Auto-generated with QR verification
- **🛂 Skill Passport** — Cumulative vocational competency record
- **📈 Reports** — Trainee, batch, program, and institutional reports
- **🔔 Notifications** — Real-time notification system
- **📋 Audit Logs** — Complete audit trail

### Certificate Verification

Public certificate verification at:
```
/verify/certificate/{certificateNo}
```

---

## 🗄 Database

### Key Entities
Organization, Campus, User, Trainee, Trainer, VocationalCategory, VocationalElective, Module, Skill, TrainingBatch, Enrollment, TrainingSession, Attendance, TraineeSkill, PracticalTask, Product, Assessment, Certificate, Notification, AuditLog

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations to production
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

---

## 🔌 API

All APIs are versioned under `/api/v1/`.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| GET | `/api/v1/trainees` | List trainees |
| GET | `/api/v1/trainees/:id/skill-passport` | Skill Passport |
| POST | `/api/v1/attendance` | Mark attendance |
| POST | `/api/v1/skills/verify` | Verify trainee skill |
| POST | `/api/v1/products/:id/review` | Review product |
| POST | `/api/v1/certificates` | Issue certificate |
| GET | `/api/v1/verify/certificate/:no` | Public verification |
| GET | `/api/v1/dashboard/admin` | Admin dashboard |

### Response Format

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 🔒 Security

- Password hashing with bcrypt (12 rounds)
- JWT authentication with session management
- Role-based access control (RBAC)
- Resource-level authorization
- Input validation with Zod
- Rate limiting
- CORS configuration
- Security headers (Helmet)
- Audit logging
- File upload validation

---

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all dev servers |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | Type check all packages |
| `npm run test` | Run all tests |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:up` | Start Docker services |
| `npm run docker:down` | Stop Docker services |

---

## 📄 License

This project is proprietary software developed for KISS (Kalinga Institute of Social Sciences).

---

*Built with ❤️ for KISS — Empowering tribal youth through vocational skill development*
