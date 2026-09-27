-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CENTRE_ADMIN', 'TRAINER', 'TRAINEE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "EnrollmentStatusType" AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ElectiveStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "SkillDifficulty" AS ENUM ('BEGINNER', 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('DRAFT', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED', 'TRANSFERRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('THEORY', 'PRACTICAL', 'WORKSHOP', 'PROJECT', 'ASSESSMENT');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "SkillStatus" AS ENUM ('NOT_STARTED', 'LEARNING', 'PRACTICING', 'ASSESSED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'MASTERED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PRACTICAL_TASK', 'PRODUCT', 'PROJECT', 'PHOTOGRAPH', 'DOCUMENT', 'TRAINER_OBSERVATION', 'ASSESSMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('IDEA', 'DESIGN', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('THEORY', 'PRACTICAL', 'PRODUCT', 'PROJECT', 'FINAL');

-- CreateEnum
CREATE TYPE "AssessmentResult" AS ENUM ('PASS', 'FAIL', 'MERIT', 'DISTINCTION', 'PENDING');

-- CreateEnum
CREATE TYPE "CompletionRuleType" AS ENUM ('MIN_ATTENDANCE_PCT', 'MIN_TRAINING_HOURS', 'MODULES_COMPLETED', 'SKILLS_VERIFIED', 'PRACTICAL_ASSESSMENT_PASSED', 'PRODUCT_APPROVED', 'TRAINER_RECOMMENDATION', 'ADMIN_APPROVAL');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('DRAFT', 'ISSUED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SCHEDULE_UPDATE', 'ATTENDANCE_WARNING', 'ASSIGNMENT_DEADLINE', 'PRODUCT_REVIEW', 'ASSESSMENT_RESULT', 'SKILL_VERIFICATION', 'CERTIFICATE_AVAILABLE', 'GENERAL');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campuses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "profilePhoto" TEXT,
    "campusId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainees" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "className" TEXT,
    "academicYear" TEXT,
    "department" TEXT,
    "campusId" TEXT NOT NULL,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "address" TEXT,
    "enrollmentStatus" "EnrollmentStatusType" NOT NULL DEFAULT 'ACTIVE',
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "qualification" TEXT,
    "specialization" TEXT,
    "experience" TEXT,
    "campusId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_categories" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "trainer_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocational_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocational_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocational_electives" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "objectives" TEXT,
    "durationWeeks" INTEGER,
    "totalTrainingHours" INTEGER NOT NULL,
    "theoryHours" INTEGER NOT NULL,
    "practicalHours" INTEGER NOT NULL,
    "requiredAttendancePct" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "completionRequirements" TEXT,
    "status" "ElectiveStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocational_electives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "electiveId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sequenceOrder" INTEGER NOT NULL DEFAULT 0,
    "theoryHours" INTEGER NOT NULL DEFAULT 0,
    "practicalHours" INTEGER NOT NULL DEFAULT 0,
    "learningObjectives" TEXT,
    "completionCriteria" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "SkillDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "learningObjectives" TEXT,
    "assessmentCriteria" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_skills" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "module_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_batches" (
    "id" TEXT NOT NULL,
    "electiveId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "trainerId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "status" "BatchStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionDate" TIMESTAMP(3),
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "moduleId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "location" TEXT,
    "sessionType" "SessionType" NOT NULL DEFAULT 'THEORY',
    "topic" TEXT,
    "description" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "trainerId" TEXT,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT',
    "markedById" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainee_skills" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "status" "SkillStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "level" "SkillLevel" NOT NULL DEFAULT 'BEGINNER',
    "progressPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dateStarted" TIMESTAMP(3),
    "dateLearned" TIMESTAMP(3),
    "dateAssessed" TIMESTAMP(3),
    "dateVerified" TIMESTAMP(3),
    "verifiedById" TEXT,
    "assessmentNotes" TEXT,
    "evidenceNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainee_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_evidence" (
    "id" TEXT NOT NULL,
    "traineeSkillId" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practical_tasks" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "moduleId" TEXT,
    "batchId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "requiredSkills" TEXT,
    "deadline" TIMESTAMP(3),
    "evaluationCriteria" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practical_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practical_submissions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "description" TEXT,
    "fileUrls" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "feedback" TEXT,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practical_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "batchId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "materials" TEXT,
    "productionDate" TIMESTAMP(3),
    "submissionDate" TIMESTAMP(3),
    "imageUrls" TEXT,
    "documentUrls" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'IDEA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_skills" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "product_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "criteria" TEXT,
    "overallScore" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "feedback" TEXT,
    "recommendation" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_status_history" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fromStatus" "ProductStatus",
    "toStatus" "ProductStatus" NOT NULL,
    "changedBy" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "batchId" TEXT,
    "type" "AssessmentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "result" "AssessmentResult" NOT NULL DEFAULT 'PENDING',
    "feedback" TEXT,
    "evidenceUrl" TEXT,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_skills" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "feedback" TEXT,

    CONSTRAINT "assessment_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_criteria" (
    "id" TEXT NOT NULL,
    "electiveId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completion_rules" (
    "id" TEXT NOT NULL,
    "electiveId" TEXT NOT NULL,
    "ruleType" "CompletionRuleType" NOT NULL,
    "ruleValue" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "completion_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "electiveId" TEXT,
    "certificateNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "trainingPeriod" TEXT,
    "trainingHours" INTEGER,
    "skillsSummary" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "status" "CertificateStatus" NOT NULL DEFAULT 'DRAFT',
    "issuedById" TEXT,
    "signatory" TEXT,
    "qrCode" TEXT,
    "pdfUrl" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "bucket" TEXT,
    "uploadedById" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_code_key" ON "organizations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "campuses_code_key" ON "campuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_campusId_idx" ON "users"("campusId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "trainees_userId_key" ON "trainees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "trainees_studentId_key" ON "trainees"("studentId");

-- CreateIndex
CREATE INDEX "trainees_studentId_idx" ON "trainees"("studentId");

-- CreateIndex
CREATE INDEX "trainees_campusId_idx" ON "trainees"("campusId");

-- CreateIndex
CREATE INDEX "trainees_enrollmentStatus_idx" ON "trainees"("enrollmentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_userId_key" ON "trainers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_employeeId_key" ON "trainers"("employeeId");

-- CreateIndex
CREATE INDEX "trainers_employeeId_idx" ON "trainers"("employeeId");

-- CreateIndex
CREATE INDEX "trainers_campusId_idx" ON "trainers"("campusId");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_categories_trainerId_categoryId_key" ON "trainer_categories"("trainerId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "vocational_categories_name_key" ON "vocational_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vocational_categories_code_key" ON "vocational_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vocational_electives_code_key" ON "vocational_electives"("code");

-- CreateIndex
CREATE INDEX "vocational_electives_categoryId_idx" ON "vocational_electives"("categoryId");

-- CreateIndex
CREATE INDEX "vocational_electives_status_idx" ON "vocational_electives"("status");

-- CreateIndex
CREATE INDEX "modules_electiveId_idx" ON "modules"("electiveId");

-- CreateIndex
CREATE UNIQUE INDEX "modules_electiveId_sequenceOrder_key" ON "modules"("electiveId", "sequenceOrder");

-- CreateIndex
CREATE UNIQUE INDEX "skills_code_key" ON "skills"("code");

-- CreateIndex
CREATE INDEX "skills_categoryId_idx" ON "skills"("categoryId");

-- CreateIndex
CREATE INDEX "skills_code_idx" ON "skills"("code");

-- CreateIndex
CREATE UNIQUE INDEX "module_skills_moduleId_skillId_key" ON "module_skills"("moduleId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "training_batches_code_key" ON "training_batches"("code");

-- CreateIndex
CREATE INDEX "training_batches_electiveId_idx" ON "training_batches"("electiveId");

-- CreateIndex
CREATE INDEX "training_batches_campusId_idx" ON "training_batches"("campusId");

-- CreateIndex
CREATE INDEX "training_batches_trainerId_idx" ON "training_batches"("trainerId");

-- CreateIndex
CREATE INDEX "training_batches_status_idx" ON "training_batches"("status");

-- CreateIndex
CREATE INDEX "enrollments_traineeId_idx" ON "enrollments"("traineeId");

-- CreateIndex
CREATE INDEX "enrollments_batchId_idx" ON "enrollments"("batchId");

-- CreateIndex
CREATE INDEX "enrollments_status_idx" ON "enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_traineeId_batchId_key" ON "enrollments"("traineeId", "batchId");

-- CreateIndex
CREATE INDEX "training_sessions_batchId_idx" ON "training_sessions"("batchId");

-- CreateIndex
CREATE INDEX "training_sessions_trainerId_idx" ON "training_sessions"("trainerId");

-- CreateIndex
CREATE INDEX "training_sessions_date_idx" ON "training_sessions"("date");

-- CreateIndex
CREATE INDEX "training_sessions_status_idx" ON "training_sessions"("status");

-- CreateIndex
CREATE INDEX "attendances_traineeId_idx" ON "attendances"("traineeId");

-- CreateIndex
CREATE INDEX "attendances_sessionId_idx" ON "attendances"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_traineeId_sessionId_key" ON "attendances"("traineeId", "sessionId");

-- CreateIndex
CREATE INDEX "trainee_skills_traineeId_idx" ON "trainee_skills"("traineeId");

-- CreateIndex
CREATE INDEX "trainee_skills_skillId_idx" ON "trainee_skills"("skillId");

-- CreateIndex
CREATE INDEX "trainee_skills_status_idx" ON "trainee_skills"("status");

-- CreateIndex
CREATE UNIQUE INDEX "trainee_skills_traineeId_skillId_key" ON "trainee_skills"("traineeId", "skillId");

-- CreateIndex
CREATE INDEX "skill_evidence_traineeSkillId_idx" ON "skill_evidence"("traineeSkillId");

-- CreateIndex
CREATE INDEX "practical_tasks_trainerId_idx" ON "practical_tasks"("trainerId");

-- CreateIndex
CREATE INDEX "practical_tasks_moduleId_idx" ON "practical_tasks"("moduleId");

-- CreateIndex
CREATE INDEX "practical_submissions_taskId_idx" ON "practical_submissions"("taskId");

-- CreateIndex
CREATE INDEX "practical_submissions_traineeId_idx" ON "practical_submissions"("traineeId");

-- CreateIndex
CREATE UNIQUE INDEX "practical_submissions_taskId_traineeId_key" ON "practical_submissions"("taskId", "traineeId");

-- CreateIndex
CREATE INDEX "products_traineeId_idx" ON "products"("traineeId");

-- CreateIndex
CREATE INDEX "products_batchId_idx" ON "products"("batchId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE UNIQUE INDEX "product_skills_productId_skillId_key" ON "product_skills"("productId", "skillId");

-- CreateIndex
CREATE INDEX "product_reviews_productId_idx" ON "product_reviews"("productId");

-- CreateIndex
CREATE INDEX "product_reviews_trainerId_idx" ON "product_reviews"("trainerId");

-- CreateIndex
CREATE INDEX "product_status_history_productId_idx" ON "product_status_history"("productId");

-- CreateIndex
CREATE INDEX "assessments_traineeId_idx" ON "assessments"("traineeId");

-- CreateIndex
CREATE INDEX "assessments_trainerId_idx" ON "assessments"("trainerId");

-- CreateIndex
CREATE INDEX "assessments_type_idx" ON "assessments"("type");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_skills_assessmentId_skillId_key" ON "assessment_skills"("assessmentId", "skillId");

-- CreateIndex
CREATE INDEX "evaluation_criteria_electiveId_idx" ON "evaluation_criteria"("electiveId");

-- CreateIndex
CREATE INDEX "completion_rules_electiveId_idx" ON "completion_rules"("electiveId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificateNo_key" ON "certificates"("certificateNo");

-- CreateIndex
CREATE INDEX "certificates_traineeId_idx" ON "certificates"("traineeId");

-- CreateIndex
CREATE INDEX "certificates_certificateNo_idx" ON "certificates"("certificateNo");

-- CreateIndex
CREATE INDEX "certificates_status_idx" ON "certificates"("status");

-- CreateIndex
CREATE INDEX "file_uploads_entityType_entityId_idx" ON "file_uploads"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "file_uploads_uploadedById_idx" ON "file_uploads"("uploadedById");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainees" ADD CONSTRAINT "trainees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainees" ADD CONSTRAINT "trainees_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_categories" ADD CONSTRAINT "trainer_categories_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_categories" ADD CONSTRAINT "trainer_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "vocational_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocational_electives" ADD CONSTRAINT "vocational_electives_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "vocational_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_electiveId_fkey" FOREIGN KEY ("electiveId") REFERENCES "vocational_electives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "vocational_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_skills" ADD CONSTRAINT "module_skills_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_skills" ADD CONSTRAINT "module_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_batches" ADD CONSTRAINT "training_batches_electiveId_fkey" FOREIGN KEY ("electiveId") REFERENCES "vocational_electives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_batches" ADD CONSTRAINT "training_batches_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_batches" ADD CONSTRAINT "training_batches_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "training_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "training_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainee_skills" ADD CONSTRAINT "trainee_skills_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainee_skills" ADD CONSTRAINT "trainee_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainee_skills" ADD CONSTRAINT "trainee_skills_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "trainers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_evidence" ADD CONSTRAINT "skill_evidence_traineeSkillId_fkey" FOREIGN KEY ("traineeSkillId") REFERENCES "trainee_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practical_tasks" ADD CONSTRAINT "practical_tasks_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practical_tasks" ADD CONSTRAINT "practical_tasks_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practical_submissions" ADD CONSTRAINT "practical_submissions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "practical_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practical_submissions" ADD CONSTRAINT "practical_submissions_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "training_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_skills" ADD CONSTRAINT "product_skills_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_skills" ADD CONSTRAINT "product_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_status_history" ADD CONSTRAINT "product_status_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_skills" ADD CONSTRAINT "assessment_skills_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_skills" ADD CONSTRAINT "assessment_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completion_rules" ADD CONSTRAINT "completion_rules_electiveId_fkey" FOREIGN KEY ("electiveId") REFERENCES "vocational_electives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
