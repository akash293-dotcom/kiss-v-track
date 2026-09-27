// ============================================================
// KISS V-TRACK — Shared Type Definitions
// ============================================================

// ---- User & Auth ----
export type UserRole = 'ADMIN' | 'CENTRE_ADMIN' | 'TRAINER' | 'TRAINEE';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  campusId: string | null;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

// ---- API Response ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ---- Organization & Campus ----
export interface Campus {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

// ---- Trainee ----
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type TraineeEnrollmentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'WITHDRAWN';

export interface Trainee {
  id: string;
  userId: string;
  studentId: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  className: string | null;
  academicYear: string | null;
  department: string | null;
  campusId: string;
  enrollmentStatus: TraineeEnrollmentStatus;
  user?: AuthUser;
  campus?: Campus;
}

// ---- Trainer ----
export interface Trainer {
  id: string;
  userId: string;
  employeeId: string;
  qualification: string | null;
  specialization: string | null;
  experience: string | null;
  campusId: string;
  isActive: boolean;
  user?: AuthUser;
  campus?: Campus;
}

// ---- Vocational Category ----
export interface VocationalCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  electivesCount?: number;
}

// ---- Vocational Elective ----
export type ElectiveStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DISCONTINUED';

export interface VocationalElective {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  description: string | null;
  objectives: string | null;
  durationWeeks: number | null;
  totalTrainingHours: number;
  theoryHours: number;
  practicalHours: number;
  requiredAttendancePct: number;
  completionRequirements: string | null;
  status: ElectiveStatus;
  category?: VocationalCategory;
  modules?: Module[];
}

// ---- Module ----
export interface Module {
  id: string;
  electiveId: string;
  name: string;
  description: string | null;
  sequenceOrder: number;
  theoryHours: number;
  practicalHours: number;
  learningObjectives: string | null;
  completionCriteria: string | null;
  isActive: boolean;
  skills?: Skill[];
}

// ---- Skill ----
export type SkillDifficulty = 'BEGINNER' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type SkillStatus = 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'ASSESSED' | 'VERIFIED';
export type SkillLevel = 'BEGINNER' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTERED';

export interface Skill {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  description: string | null;
  difficulty: SkillDifficulty;
  learningObjectives: string | null;
  assessmentCriteria: string | null;
  isActive: boolean;
  category?: VocationalCategory;
}

export interface TraineeSkill {
  id: string;
  traineeId: string;
  skillId: string;
  status: SkillStatus;
  level: SkillLevel;
  progressPct: number;
  dateStarted: string | null;
  dateLearned: string | null;
  dateAssessed: string | null;
  dateVerified: string | null;
  verifiedById: string | null;
  skill?: Skill;
  verifiedBy?: Trainer;
}

// ---- Training Batch ----
export type BatchStatus = 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface TrainingBatch {
  id: string;
  electiveId: string;
  campusId: string;
  trainerId: string | null;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: BatchStatus;
  description: string | null;
  elective?: VocationalElective;
  campus?: Campus;
  trainer?: Trainer;
  enrollmentCount?: number;
}

// ---- Enrollment ----
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'TRANSFERRED' | 'CANCELLED';

export interface Enrollment {
  id: string;
  traineeId: string;
  batchId: string;
  enrollmentDate: string;
  completionDate: string | null;
  status: EnrollmentStatus;
  remarks: string | null;
  trainee?: Trainee;
  batch?: TrainingBatch;
}

// ---- Training Session ----
export type SessionType = 'THEORY' | 'PRACTICAL' | 'WORKSHOP' | 'PROJECT' | 'ASSESSMENT';
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface TrainingSession {
  id: string;
  batchId: string;
  trainerId: string;
  moduleId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  location: string | null;
  sessionType: SessionType;
  topic: string | null;
  description: string | null;
  status: SessionStatus;
  batch?: TrainingBatch;
  trainer?: Trainer;
  module?: Module;
}

// ---- Attendance ----
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface Attendance {
  id: string;
  traineeId: string;
  sessionId: string;
  status: AttendanceStatus;
  markedById: string | null;
  markedAt: string;
  remarks: string | null;
  trainee?: Trainee;
  session?: TrainingSession;
}

export interface AttendanceSummary {
  totalSessions: number;
  attended: number;
  absent: number;
  late: number;
  excused: number;
  attendancePct: number;
  totalScheduledHours: number;
  totalAttendedHours: number;
  theoryHours: number;
  practicalHours: number;
}

// ---- Product ----
export type ProductStatus = 'IDEA' | 'DESIGN' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'COMPLETED';

export interface Product {
  id: string;
  traineeId: string;
  batchId: string | null;
  name: string;
  category: string | null;
  description: string | null;
  materials: string | null;
  productionDate: string | null;
  submissionDate: string | null;
  imageUrls: string | null;
  documentUrls: string | null;
  status: ProductStatus;
  trainee?: Trainee;
  skills?: Skill[];
  reviews?: ProductReview[];
}

export interface ProductReview {
  id: string;
  productId: string;
  trainerId: string;
  criteria: string | null;
  overallScore: number | null;
  maxScore: number | null;
  feedback: string | null;
  recommendation: string | null;
  reviewedAt: string;
  trainer?: Trainer;
}

// ---- Assessment ----
export type AssessmentType = 'THEORY' | 'PRACTICAL' | 'PRODUCT' | 'PROJECT' | 'FINAL';
export type AssessmentResultType = 'PASS' | 'FAIL' | 'MERIT' | 'DISTINCTION' | 'PENDING';

export interface Assessment {
  id: string;
  traineeId: string;
  trainerId: string;
  batchId: string | null;
  type: AssessmentType;
  title: string;
  description: string | null;
  score: number | null;
  maxScore: number;
  result: AssessmentResultType;
  feedback: string | null;
  assessedAt: string;
  trainee?: Trainee;
  trainer?: Trainer;
  skills?: Skill[];
}

// ---- Certificate ----
export type CertificateStatus = 'DRAFT' | 'ISSUED' | 'REVOKED' | 'EXPIRED';

export interface Certificate {
  id: string;
  traineeId: string;
  electiveId: string | null;
  certificateNo: string;
  title: string;
  description: string | null;
  trainingPeriod: string | null;
  trainingHours: number | null;
  skillsSummary: string | null;
  issueDate: string;
  expiryDate: string | null;
  status: CertificateStatus;
  signatory: string | null;
  qrCode: string | null;
  pdfUrl: string | null;
  trainee?: Trainee;
}

export interface CertificateVerification {
  certificateNo: string;
  traineeName: string;
  programName: string;
  trainingPeriod: string | null;
  verifiedSkills: string[];
  issueDate: string;
  status: CertificateStatus;
}

// ---- Notification ----
export type NotificationType = 
  | 'SCHEDULE_UPDATE' | 'ATTENDANCE_WARNING' | 'ASSIGNMENT_DEADLINE'
  | 'PRODUCT_REVIEW' | 'ASSESSMENT_RESULT' | 'SKILL_VERIFICATION'
  | 'CERTIFICATE_AVAILABLE' | 'GENERAL';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

// ---- Dashboard ----
export interface AdminDashboard {
  totalTrainees: number;
  activePrograms: number;
  activeBatches: number;
  totalTrainers: number;
  totalTrainingHours: number;
  averageAttendance: number;
  skillsLearned: number;
  skillsVerified: number;
  productsCreated: number;
  certificatesIssued: number;
  recentEnrollments: Enrollment[];
  trainingTrends: ChartData[];
  skillDistribution: ChartData[];
}

export interface TrainerDashboard {
  myBatches: TrainingBatch[];
  totalTrainees: number;
  todaySessions: TrainingSession[];
  pendingAttendance: number;
  pendingProductReviews: number;
  pendingAssessments: number;
  pendingSkillVerifications: number;
}

export interface TraineeDashboard {
  currentProgram: VocationalElective | null;
  overallProgress: number;
  attendancePct: number;
  totalTrainingHours: number;
  skillsLearned: number;
  skillsVerified: number;
  totalSkills: number;
  upcomingSessions: TrainingSession[];
  recentAssessments: Assessment[];
  products: Product[];
  certificates: Certificate[];
}

export interface ChartData {
  label: string;
  value: number;
}

// ---- Skill Passport ----
export interface SkillPassport {
  trainee: Trainee;
  vocationalPrograms: VocationalElective[];
  skillsByCategory: {
    category: string;
    skills: TraineeSkill[];
  }[];
  products: Product[];
  certificates: Certificate[];
  totalSkillsVerified: number;
  totalProducts: number;
  totalCertificates: number;
}

// ---- Completion Eligibility ----
export interface CompletionEligibility {
  isEligible: boolean;
  rules: CompletionRuleResult[];
}

export interface CompletionRuleResult {
  ruleType: string;
  description: string;
  required: string;
  actual: string;
  passed: boolean;
}

// ---- Practical Task ----
export type TaskStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'CLOSED';
export type SubmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'REJECTED';

export interface PracticalTask {
  id: string;
  trainerId: string;
  moduleId: string | null;
  batchId: string | null;
  title: string;
  description: string | null;
  instructions: string | null;
  requiredSkills: string | null;
  deadline: string | null;
  evaluationCriteria: string | null;
  status: TaskStatus;
  trainer?: Trainer;
  module?: Module;
}

export interface PracticalSubmission {
  id: string;
  taskId: string;
  traineeId: string;
  description: string | null;
  fileUrls: string | null;
  submittedAt: string;
  status: SubmissionStatus;
  feedback: string | null;
  score: number | null;
  maxScore: number | null;
  reviewedAt: string | null;
  task?: PracticalTask;
  trainee?: Trainee;
}
