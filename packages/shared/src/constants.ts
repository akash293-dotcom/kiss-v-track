// ============================================================
// KISS V-TRACK — Constants
// ============================================================

export const APP_NAME = 'KISS V-TRACK';
export const APP_TAGLINE = 'Learn. Practice. Create. Get Skilled.';
export const APP_DESCRIPTION = 'KISS Vocational Training & Skill Tracking System';

// ---- Pagination ----
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// ---- User Roles ----
export const USER_ROLES = ['ADMIN', 'CENTRE_ADMIN', 'TRAINER', 'TRAINEE'] as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  CENTRE_ADMIN: 'Centre Administrator',
  TRAINER: 'Trainer',
  TRAINEE: 'Trainee',
};

// ---- Batch Statuses ----
export const BATCH_STATUSES = ['DRAFT', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;

export const BATCH_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'gray',
  UPCOMING: 'blue',
  ACTIVE: 'green',
  COMPLETED: 'purple',
  CANCELLED: 'red',
};

// ---- Enrollment Statuses ----
export const ENROLLMENT_STATUSES = ['ACTIVE', 'COMPLETED', 'DROPPED', 'TRANSFERRED', 'CANCELLED'] as const;

// ---- Session Types ----
export const SESSION_TYPES = ['THEORY', 'PRACTICAL', 'WORKSHOP', 'PROJECT', 'ASSESSMENT'] as const;

export const SESSION_TYPE_LABELS: Record<string, string> = {
  THEORY: 'Theory',
  PRACTICAL: 'Practical',
  WORKSHOP: 'Workshop',
  PROJECT: 'Project',
  ASSESSMENT: 'Assessment',
};

export const SESSION_TYPE_COLORS: Record<string, string> = {
  THEORY: 'blue',
  PRACTICAL: 'green',
  WORKSHOP: 'yellow',
  PROJECT: 'purple',
  ASSESSMENT: 'red',
};

// ---- Attendance Statuses ----
export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  PRESENT: 'green',
  ABSENT: 'red',
  LATE: 'yellow',
  EXCUSED: 'blue',
};

// ---- Skill Statuses ----
export const SKILL_STATUSES = ['NOT_STARTED', 'LEARNING', 'PRACTICING', 'ASSESSED', 'VERIFIED'] as const;

export const SKILL_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  LEARNING: 'Learning',
  PRACTICING: 'Practicing',
  ASSESSED: 'Assessed',
  VERIFIED: 'Verified',
};

export const SKILL_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'gray',
  LEARNING: 'blue',
  PRACTICING: 'yellow',
  ASSESSED: 'orange',
  VERIFIED: 'green',
};

// ---- Skill Levels ----
export const SKILL_LEVELS = ['BEGINNER', 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'MASTERED'] as const;

export const SKILL_LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'gray',
  BASIC: 'blue',
  INTERMEDIATE: 'yellow',
  ADVANCED: 'orange',
  MASTERED: 'green',
};

// ---- Product Statuses ----
export const PRODUCT_STATUSES = [
  'IDEA', 'DESIGN', 'IN_PROGRESS', 'SUBMITTED',
  'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'COMPLETED',
] as const;

export const PRODUCT_STATUS_COLORS: Record<string, string> = {
  IDEA: 'gray',
  DESIGN: 'blue',
  IN_PROGRESS: 'yellow',
  SUBMITTED: 'orange',
  UNDER_REVIEW: 'purple',
  REVISION_REQUIRED: 'red',
  APPROVED: 'green',
  COMPLETED: 'emerald',
};

// ---- Assessment Types ----
export const ASSESSMENT_TYPES = ['THEORY', 'PRACTICAL', 'PRODUCT', 'PROJECT', 'FINAL'] as const;

// ---- Assessment Results ----
export const ASSESSMENT_RESULTS = ['PASS', 'FAIL', 'MERIT', 'DISTINCTION', 'PENDING'] as const;

export const ASSESSMENT_RESULT_COLORS: Record<string, string> = {
  PASS: 'green',
  FAIL: 'red',
  MERIT: 'blue',
  DISTINCTION: 'purple',
  PENDING: 'gray',
};

// ---- Certificate Statuses ----
export const CERTIFICATE_STATUSES = ['DRAFT', 'ISSUED', 'REVOKED', 'EXPIRED'] as const;

export const CERTIFICATE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'gray',
  ISSUED: 'green',
  REVOKED: 'red',
  EXPIRED: 'yellow',
};

// ---- Skill Difficulties ----
export const SKILL_DIFFICULTIES = ['BEGINNER', 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

// ---- Elective Statuses ----
export const ELECTIVE_STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED', 'DISCONTINUED'] as const;

// ---- Gender Options ----
export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;

// ---- Completion Rule Types ----
export const COMPLETION_RULE_TYPES = [
  'MIN_ATTENDANCE_PCT',
  'MIN_TRAINING_HOURS',
  'MODULES_COMPLETED',
  'SKILLS_VERIFIED',
  'PRACTICAL_ASSESSMENT_PASSED',
  'PRODUCT_APPROVED',
  'TRAINER_RECOMMENDATION',
  'ADMIN_APPROVAL',
] as const;

export const COMPLETION_RULE_LABELS: Record<string, string> = {
  MIN_ATTENDANCE_PCT: 'Minimum Attendance %',
  MIN_TRAINING_HOURS: 'Minimum Training Hours',
  MODULES_COMPLETED: 'All Modules Completed',
  SKILLS_VERIFIED: 'All Skills Verified',
  PRACTICAL_ASSESSMENT_PASSED: 'Practical Assessment Passed',
  PRODUCT_APPROVED: 'Product Approved',
  TRAINER_RECOMMENDATION: 'Trainer Recommendation',
  ADMIN_APPROVAL: 'Admin Approval',
};
