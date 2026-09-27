// ============================================================
// KISS V-TRACK — Shared Validation Schemas (Zod)
// ============================================================

import { z } from 'zod';

// ---- Common ----
export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
});

// ---- Auth ----
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ---- Campus ----
export const createCampusSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  code: z.string().min(1, 'Code is required').max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  description: z.string().max(1000).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
});

export const updateCampusSchema = createCampusSchema.partial();

// ---- User ----
export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'CENTRE_ADMIN', 'TRAINER', 'TRAINEE']),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(20).optional().nullable(),
  campusId: z.string().uuid().optional().nullable(),
});

// ---- Trainee ----
export const createTraineeSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional().nullable(),
  studentId: z.string().min(1, 'Student ID is required').max(50),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional().nullable(),
  className: z.string().max(50).optional().nullable(),
  academicYear: z.string().max(20).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  campusId: z.string().uuid('Invalid campus'),
  guardianName: z.string().max(200).optional().nullable(),
  guardianPhone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
});

export const updateTraineeSchema = createTraineeSchema
  .omit({ email: true, username: true, password: true })
  .partial();

// ---- Trainer ----
export const createTrainerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional().nullable(),
  employeeId: z.string().min(1, 'Employee ID is required').max(50),
  qualification: z.string().max(200).optional().nullable(),
  specialization: z.string().max(200).optional().nullable(),
  experience: z.string().max(200).optional().nullable(),
  campusId: z.string().uuid('Invalid campus'),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const updateTrainerSchema = createTrainerSchema
  .omit({ email: true, username: true, password: true })
  .partial();

// ---- Vocational Category ----
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  code: z.string().min(1, 'Code is required').max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  description: z.string().max(1000).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ---- Vocational Elective ----
export const createElectiveSchema = z.object({
  categoryId: z.string().uuid('Invalid category'),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  description: z.string().max(2000).optional().nullable(),
  objectives: z.string().max(2000).optional().nullable(),
  durationWeeks: z.number().int().positive().optional().nullable(),
  totalTrainingHours: z.number().int().positive('Total training hours required'),
  theoryHours: z.number().int().min(0),
  practicalHours: z.number().int().min(0),
  requiredAttendancePct: z.number().min(0).max(100).default(80),
  completionRequirements: z.string().max(2000).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'DISCONTINUED']).default('DRAFT'),
});

export const updateElectiveSchema = createElectiveSchema.partial();

// ---- Module ----
export const createModuleSchema = z.object({
  electiveId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  sequenceOrder: z.number().int().min(0).default(0),
  theoryHours: z.number().int().min(0).default(0),
  practicalHours: z.number().int().min(0).default(0),
  learningObjectives: z.string().max(2000).optional().nullable(),
  completionCriteria: z.string().max(2000).optional().nullable(),
  skillIds: z.array(z.string().uuid()).optional(),
});

export const updateModuleSchema = createModuleSchema.partial();

// ---- Skill ----
export const createSkillSchema = z.object({
  categoryId: z.string().uuid('Invalid category'),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  description: z.string().max(2000).optional().nullable(),
  difficulty: z.enum(['BEGINNER', 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('BEGINNER'),
  learningObjectives: z.string().max(2000).optional().nullable(),
  assessmentCriteria: z.string().max(2000).optional().nullable(),
});

export const updateSkillSchema = createSkillSchema.partial();

// ---- Training Batch ----
export const createBatchSchema = z.object({
  electiveId: z.string().uuid(),
  campusId: z.string().uuid(),
  trainerId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  capacity: z.number().int().positive().default(30),
  status: z.enum(['DRAFT', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  description: z.string().max(2000).optional().nullable(),
});

export const updateBatchSchema = createBatchSchema.partial();

// ---- Enrollment ----
export const createEnrollmentSchema = z.object({
  traineeId: z.string().uuid(),
  batchId: z.string().uuid(),
  remarks: z.string().max(500).optional().nullable(),
});

export const updateEnrollmentSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'DROPPED', 'TRANSFERRED', 'CANCELLED']),
  remarks: z.string().max(500).optional().nullable(),
});

// ---- Training Session ----
export const createSessionSchema = z.object({
  batchId: z.string().uuid(),
  trainerId: z.string().uuid(),
  moduleId: z.string().uuid().optional().nullable(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:mm format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be HH:mm format'),
  durationMin: z.number().int().positive(),
  location: z.string().max(200).optional().nullable(),
  sessionType: z.enum(['THEORY', 'PRACTICAL', 'WORKSHOP', 'PROJECT', 'ASSESSMENT']).default('THEORY'),
  topic: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export const updateSessionSchema = createSessionSchema.partial().extend({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
});

// ---- Attendance ----
export const markAttendanceSchema = z.object({
  sessionId: z.string().uuid(),
  records: z.array(z.object({
    traineeId: z.string().uuid(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    remarks: z.string().max(500).optional().nullable(),
  })).min(1, 'At least one attendance record required'),
});

// ---- Trainee Skill ----
export const updateTraineeSkillSchema = z.object({
  status: z.enum(['NOT_STARTED', 'LEARNING', 'PRACTICING', 'ASSESSED', 'VERIFIED']).optional(),
  level: z.enum(['BEGINNER', 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'MASTERED']).optional(),
  progressPct: z.number().min(0).max(100).optional(),
  assessmentNotes: z.string().max(2000).optional().nullable(),
  evidenceNotes: z.string().max(2000).optional().nullable(),
});

export const verifySkillSchema = z.object({
  traineeId: z.string().uuid(),
  skillId: z.string().uuid(),
  level: z.enum(['BEGINNER', 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'MASTERED']),
  assessmentNotes: z.string().max(2000).optional().nullable(),
});

// ---- Product ----
export const createProductSchema = z.object({
  batchId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(200),
  category: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  materials: z.string().max(1000).optional().nullable(),
  productionDate: z.string().optional().nullable(),
  skillIds: z.array(z.string().uuid()).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum([
    'IDEA', 'DESIGN', 'IN_PROGRESS', 'SUBMITTED',
    'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'COMPLETED',
  ]).optional(),
});

export const reviewProductSchema = z.object({
  criteria: z.array(z.object({
    criterion: z.string(),
    score: z.number().min(0),
    weight: z.number().min(0).default(1),
    comment: z.string().optional(),
  })).optional(),
  overallScore: z.number().min(0).optional(),
  maxScore: z.number().min(0).optional(),
  feedback: z.string().max(2000).optional().nullable(),
  recommendation: z.string().max(500).optional().nullable(),
  newStatus: z.enum(['APPROVED', 'REVISION_REQUIRED', 'COMPLETED']).optional(),
});

// ---- Assessment ----
export const createAssessmentSchema = z.object({
  traineeId: z.string().uuid(),
  batchId: z.string().uuid().optional().nullable(),
  type: z.enum(['THEORY', 'PRACTICAL', 'PRODUCT', 'PROJECT', 'FINAL']),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  score: z.number().min(0).optional().nullable(),
  maxScore: z.number().min(0).default(100),
  result: z.enum(['PASS', 'FAIL', 'MERIT', 'DISTINCTION', 'PENDING']).default('PENDING'),
  feedback: z.string().max(2000).optional().nullable(),
  skillIds: z.array(z.string().uuid()).optional(),
});

// ---- Practical Task ----
export const createPracticalTaskSchema = z.object({
  moduleId: z.string().uuid().optional().nullable(),
  batchId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  instructions: z.string().max(5000).optional().nullable(),
  requiredSkills: z.string().max(1000).optional().nullable(),
  deadline: z.string().optional().nullable(),
  evaluationCriteria: z.string().max(2000).optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ACTIVE', 'CLOSED']).default('DRAFT'),
});

// ---- Practical Submission ----
export const createSubmissionSchema = z.object({
  taskId: z.string().uuid(),
  description: z.string().max(2000).optional().nullable(),
});

export const reviewSubmissionSchema = z.object({
  status: z.enum(['APPROVED', 'REVISION_REQUIRED', 'REJECTED']),
  feedback: z.string().max(2000).optional().nullable(),
  score: z.number().min(0).optional().nullable(),
  maxScore: z.number().min(0).optional().nullable(),
});

// ---- Certificate ----
export const issueCertificateSchema = z.object({
  traineeId: z.string().uuid(),
  electiveId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  trainingPeriod: z.string().max(200).optional().nullable(),
  trainingHours: z.number().int().positive().optional().nullable(),
  signatory: z.string().max(200).optional().nullable(),
});

// ---- Completion Rules ----
export const createCompletionRuleSchema = z.object({
  electiveId: z.string().uuid(),
  ruleType: z.enum([
    'MIN_ATTENDANCE_PCT', 'MIN_TRAINING_HOURS', 'MODULES_COMPLETED',
    'SKILLS_VERIFIED', 'PRACTICAL_ASSESSMENT_PASSED', 'PRODUCT_APPROVED',
    'TRAINER_RECOMMENDATION', 'ADMIN_APPROVAL',
  ]),
  ruleValue: z.string().min(1),
  description: z.string().max(500).optional().nullable(),
  isRequired: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// ---- Notification ----
export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum([
    'SCHEDULE_UPDATE', 'ATTENDANCE_WARNING', 'ASSIGNMENT_DEADLINE',
    'PRODUCT_REVIEW', 'ASSESSMENT_RESULT', 'SKILL_VERIFICATION',
    'CERTIFICATE_AVAILABLE', 'GENERAL',
  ]).default('GENERAL'),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  data: z.string().optional().nullable(),
});
