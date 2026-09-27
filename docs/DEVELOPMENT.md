# KISS V-TRACK Development Guide

## Development Phases

### Phase 1 — Foundation ✅
- [x] Monorepo structure (npm workspaces)
- [x] TypeScript configuration
- [x] Prisma schema (40+ models)
- [x] Docker & Docker Compose
- [x] GitHub Actions CI/CD
- [x] Environment configuration
- [x] Shared types & validation

### Phase 2 — Authentication ✅
- [x] User model with roles
- [x] JWT authentication
- [x] Login / Logout
- [x] Password hashing (bcrypt)
- [x] Session management
- [x] RBAC middleware (requireRole)
- [x] Password reset flow

### Phase 3 — Core Data ✅
- [x] Campus CRUD
- [x] Trainee management (with user creation)
- [x] Trainer management (with user creation)
- [x] Vocational Category CRUD
- [x] Vocational Elective CRUD
- [x] Training Batch CRUD
- [x] Enrollment management

### Phase 4 — Training ✅
- [x] Module management with skill mapping
- [x] Training session scheduling
- [x] Session management (create, update, cancel, reschedule)
- [x] Attendance marking (bulk)
- [x] Attendance calculation

### Phase 5 — Skill Tracking ✅
- [x] Skill CRUD
- [x] Module-skill mapping
- [x] Trainee skill tracking
- [x] Skill status progression
- [x] Trainer skill verification
- [x] Skill evidence management

### Phase 6 — Practical Learning ✅
- [x] Practical task management
- [x] Trainee submission
- [x] Trainer review
- [x] Product management
- [x] Product-skill mapping
- [x] Product review & evaluation
- [x] Product status tracking

### Phase 7 — Assessment ✅
- [x] Assessment creation
- [x] Assessment-skill mapping
- [x] Configurable evaluation criteria
- [x] Completion rules management

### Phase 8 — Certification ✅
- [x] Certificate eligibility engine
- [x] Certificate number generation
- [x] Certificate issuance
- [x] QR code support
- [x] Public certificate verification
- [x] Certificate revocation

### Phase 9 — Dashboards ✅
- [x] Admin dashboard (10 metrics + charts)
- [x] Trainer dashboard (assignments + pending items)
- [x] Trainee dashboard (progress + upcoming)
- [x] Skill Passport
- [x] Reports (trainee, batch, institutional)

### Phase 10 — Production Hardening ✅
- [x] Security headers (Helmet)
- [x] Rate limiting
- [x] CORS configuration
- [x] Input validation (Zod)
- [x] Error handling
- [x] Audit logging
- [x] Request ID tracking
- [x] Structured logging (Winston)
- [x] Health checks
- [x] Unit tests
- [x] E2E tests (Playwright)
- [x] Docker multi-stage builds
- [x] GitHub Actions CI/CD

## Architecture Principles

### Backend (Express + Prisma)
```
HTTP Request → Middleware (Auth, Validation) → Controller → Service → Prisma → PostgreSQL
```

- **Controllers**: Handle HTTP request/response, delegate to services
- **Services**: Contain business logic, use Prisma for DB access
- **Middleware**: Cross-cutting concerns (auth, validation, error handling)

### Frontend (React + TanStack Query)
```
User → Component → Hook (useQuery/useMutation) → Axios → API
```

- **Pages**: Route-level components
- **Components**: Reusable UI elements
- **Hooks**: Data fetching and state management
- **Context**: Auth state, theme

### Shared Package
- Types exported from `@kiss-vtrack/shared`
- Zod schemas used on both frontend (UX) and backend (security)
- Constants (status labels, colors) shared for consistency

## Coding Standards

1. **TypeScript Strict Mode** — No `any` unless absolutely necessary
2. **Zod Validation** — All external input validated on backend
3. **Backend Authorization** — Never trust frontend; all access control in middleware/services
4. **Database Constraints** — Use unique constraints, foreign keys, indexes
5. **Transactions** — Multi-step operations wrapped in `prisma.$transaction`
6. **Audit Logging** — Log all significant actions
7. **Error Handling** — Custom error classes with proper HTTP status codes
8. **Consistent APIs** — `{ success, data, meta, error }` format
9. **Pagination** — All list endpoints paginated server-side

## Common Commands

```bash
# Start development
npm run dev

# Database
npx prisma migrate dev --name <name>
npx prisma generate
npx prisma db seed
npx prisma studio

# Testing
npm run test
npm run test:e2e

# Building
npm run build

# Docker
docker compose up -d
docker compose down

# Linting & Type Checking
npm run lint
npm run typecheck
```
