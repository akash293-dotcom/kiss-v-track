# KISS V-TRACK API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All endpoints (except public ones) require a Bearer token:
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Invalid email address"]
    }
  }
}
```

## Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login |
| POST | `/auth/logout` | ✅ | Logout |
| GET | `/auth/me` | ✅ | Get profile |
| POST | `/auth/change-password` | ✅ | Change password |
| POST | `/auth/forgot-password` | ❌ | Request password reset |
| POST | `/auth/reset-password` | ❌ | Reset password |

### Campuses (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/campuses` | ✅ Admin | List campuses |
| GET | `/campuses/:id` | ✅ Admin | Get campus |
| POST | `/campuses` | ✅ Admin | Create campus |
| PATCH | `/campuses/:id` | ✅ Admin | Update campus |
| DELETE | `/campuses/:id` | ✅ Admin | Delete campus |

### Trainees

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trainees` | ✅ Admin/Trainer | List trainees |
| GET | `/trainees/:id` | ✅ | Get trainee profile |
| POST | `/trainees` | ✅ Admin | Create trainee |
| PATCH | `/trainees/:id` | ✅ Admin | Update trainee |
| GET | `/trainees/:id/skills` | ✅ | Trainee's skills |
| GET | `/trainees/:id/attendance-summary` | ✅ | Attendance summary |
| GET | `/trainees/:id/products` | ✅ | Trainee's products |
| GET | `/trainees/:id/certificates` | ✅ | Trainee's certificates |
| GET | `/trainees/:id/skill-passport` | ✅ | Full Skill Passport |

### Trainers (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trainers` | ✅ Admin | List trainers |
| GET | `/trainers/:id` | ✅ | Get trainer |
| POST | `/trainers` | ✅ Admin | Create trainer |
| PATCH | `/trainers/:id` | ✅ Admin | Update trainer |
| GET | `/trainers/:id/batches` | ✅ | Trainer's batches |

### Vocational Categories (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | ✅ | List categories |
| GET | `/categories/:id` | ✅ | Get category |
| POST | `/categories` | ✅ Admin | Create category |
| PATCH | `/categories/:id` | ✅ Admin | Update category |
| DELETE | `/categories/:id` | ✅ Admin | Delete category |

### Vocational Electives

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/electives` | ✅ | List electives |
| GET | `/electives/:id` | ✅ | Get elective (includes modules, rules) |
| POST | `/electives` | ✅ Admin | Create elective |
| PATCH | `/electives/:id` | ✅ Admin | Update elective |

### Modules

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/modules` | ✅ | List modules |
| GET | `/modules/:id` | ✅ | Get module |
| POST | `/modules` | ✅ Admin | Create module |
| PATCH | `/modules/:id` | ✅ Admin | Update module |

### Skills

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/skills` | ✅ | List skills |
| GET | `/skills/:id` | ✅ | Get skill |
| POST | `/skills` | ✅ Admin | Create skill |
| PATCH | `/skills/:id` | ✅ Admin | Update skill |
| POST | `/skills/verify` | ✅ Trainer | Verify trainee skill |

### Training Batches

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/batches` | ✅ | List batches |
| GET | `/batches/:id` | ✅ | Get batch |
| POST | `/batches` | ✅ Admin | Create batch |
| PATCH | `/batches/:id` | ✅ Admin | Update batch |
| GET | `/batches/:id/enrollments` | ✅ | Batch enrollments |
| GET | `/batches/:id/sessions` | ✅ | Batch sessions |

### Enrollments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/enrollments` | ✅ | List enrollments |
| POST | `/enrollments` | ✅ Admin | Create enrollment |
| PATCH | `/enrollments/:id` | ✅ Admin | Update enrollment |

### Training Sessions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sessions` | ✅ | List sessions |
| GET | `/sessions/:id` | ✅ | Get session |
| POST | `/sessions` | ✅ Admin/Trainer | Create session |
| PATCH | `/sessions/:id` | ✅ Admin/Trainer | Update session |

### Attendance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/attendance` | ✅ Trainer | Bulk mark attendance |
| GET | `/attendance` | ✅ | Get attendance records |
| GET | `/attendance/summary` | ✅ | Attendance summary |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | ✅ | List products |
| GET | `/products/:id` | ✅ | Get product |
| POST | `/products` | ✅ Trainee | Create product |
| PATCH | `/products/:id` | ✅ | Update product |
| POST | `/products/:id/review` | ✅ Trainer | Review product |

### Practical Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | ✅ | List tasks |
| GET | `/tasks/:id` | ✅ | Get task |
| POST | `/tasks` | ✅ Trainer | Create task |
| POST | `/tasks/:id/submit` | ✅ Trainee | Submit work |
| PATCH | `/submissions/:id/review` | ✅ Trainer | Review submission |

### Assessments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/assessments` | ✅ | List assessments |
| POST | `/assessments` | ✅ Trainer | Create assessment |
| GET | `/assessments/:id` | ✅ | Get assessment |

### Certificates

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/certificates` | ✅ | List certificates |
| GET | `/certificates/:id` | ✅ | Get certificate |
| POST | `/certificates` | ✅ Admin | Issue certificate |
| PATCH | `/certificates/:id/revoke` | ✅ Admin | Revoke certificate |
| GET | `/verify/certificate/:no` | ❌ | Public verification |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/admin` | ✅ Admin | Admin dashboard |
| GET | `/dashboard/trainer` | ✅ Trainer | Trainer dashboard |
| GET | `/dashboard/trainee` | ✅ Trainee | Trainee dashboard |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | ✅ | User notifications |
| PATCH | `/notifications/:id/read` | ✅ | Mark as read |
| PATCH | `/notifications/read-all` | ✅ | Mark all read |
| GET | `/notifications/unread-count` | ✅ | Unread count |

### Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reports/trainee/:id` | ✅ | Trainee report |
| GET | `/reports/batch/:id` | ✅ | Batch report |
| GET | `/reports/institutional` | ✅ Admin | Institutional report |

## Pagination

Use query parameters:
```
?page=1&limit=20&sortBy=createdAt&sortOrder=desc&search=keyword
```

## Filtering

Endpoints support relevant filters via query parameters:
```
?campusId=uuid&status=ACTIVE&categoryId=uuid
```
