// ============================================================
// KISS V-TRACK — Unit Tests: Business Logic
// ============================================================

import { describe, it, expect } from 'vitest';

// ── Attendance Calculation ──

function calculateAttendancePercentage(
  attended: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((attended / total) * 10000) / 100;
}

function calculateAttendanceHours(
  sessions: { durationMin: number; attended: boolean }[]
): { totalScheduled: number; totalAttended: number } {
  let totalScheduled = 0;
  let totalAttended = 0;
  for (const s of sessions) {
    totalScheduled += s.durationMin;
    if (s.attended) {
      totalAttended += s.durationMin;
    }
  }
  return {
    totalScheduled: totalScheduled / 60,
    totalAttended: totalAttended / 60,
  };
}

describe('Attendance Calculations', () => {
  it('should calculate attendance percentage correctly', () => {
    expect(calculateAttendancePercentage(8, 10)).toBe(80);
    expect(calculateAttendancePercentage(10, 10)).toBe(100);
    expect(calculateAttendancePercentage(0, 10)).toBe(0);
    expect(calculateAttendancePercentage(7, 10)).toBe(70);
  });

  it('should handle zero total sessions', () => {
    expect(calculateAttendancePercentage(0, 0)).toBe(0);
  });

  it('should calculate attendance hours correctly', () => {
    const sessions = [
      { durationMin: 180, attended: true },
      { durationMin: 180, attended: true },
      { durationMin: 180, attended: false },
      { durationMin: 120, attended: true },
    ];
    const result = calculateAttendanceHours(sessions);
    expect(result.totalScheduled).toBe(11); // 660 min = 11 hours
    expect(result.totalAttended).toBe(8); // 480 min = 8 hours
  });
});

// ── Progress Calculation ──

function calculateOverallProgress(
  modulesCompleted: number,
  totalModules: number,
  skillsVerified: number,
  totalSkills: number,
  productsCompleted: number,
  requiredProducts: number,
  attendancePct: number
): number {
  if (totalModules === 0 && totalSkills === 0) return 0;

  const moduleWeight = 0.3;
  const skillWeight = 0.3;
  const productWeight = 0.2;
  const attendanceWeight = 0.2;

  const moduleProgress = totalModules > 0 ? (modulesCompleted / totalModules) * 100 : 100;
  const skillProgress = totalSkills > 0 ? (skillsVerified / totalSkills) * 100 : 100;
  const productProgress = requiredProducts > 0 ? Math.min((productsCompleted / requiredProducts) * 100, 100) : 100;

  return Math.round(
    moduleProgress * moduleWeight +
    skillProgress * skillWeight +
    productProgress * productWeight +
    attendancePct * attendanceWeight
  );
}

describe('Progress Calculations', () => {
  it('should calculate overall progress correctly', () => {
    const progress = calculateOverallProgress(6, 8, 3, 6, 1, 1, 85);
    // Module: (6/8)*100*0.3 = 22.5
    // Skill: (3/6)*100*0.3 = 15
    // Product: 100*0.2 = 20
    // Attendance: 85*0.2 = 17
    expect(progress).toBe(75); // 22.5 + 15 + 20 + 17 = 74.5 -> 75
  });

  it('should handle all zeros gracefully', () => {
    expect(calculateOverallProgress(0, 0, 0, 0, 0, 0, 0)).toBe(0);
  });

  it('should handle 100% completion', () => {
    expect(calculateOverallProgress(8, 8, 6, 6, 2, 1, 100)).toBe(100);
  });
});

// ── Skill Verification Rules ──

type SkillStatus = 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'ASSESSED' | 'VERIFIED';

function canVerifySkill(currentStatus: SkillStatus): boolean {
  // A skill can only be verified if it's in ASSESSED or PRACTICING status
  return currentStatus === 'ASSESSED' || currentStatus === 'PRACTICING';
}

function isSkillVerified(status: SkillStatus): boolean {
  return status === 'VERIFIED';
}

describe('Skill Verification Rules', () => {
  it('should allow verification of assessed skills', () => {
    expect(canVerifySkill('ASSESSED')).toBe(true);
  });

  it('should allow verification of practicing skills', () => {
    expect(canVerifySkill('PRACTICING')).toBe(true);
  });

  it('should not allow verification of not-started skills', () => {
    expect(canVerifySkill('NOT_STARTED')).toBe(false);
  });

  it('should not allow verification of learning skills', () => {
    expect(canVerifySkill('LEARNING')).toBe(false);
  });

  it('should not allow re-verification', () => {
    expect(canVerifySkill('VERIFIED')).toBe(false);
  });

  it('should correctly check verified status', () => {
    expect(isSkillVerified('VERIFIED')).toBe(true);
    expect(isSkillVerified('ASSESSED')).toBe(false);
    expect(isSkillVerified('NOT_STARTED')).toBe(false);
  });
});

// ── Certificate Eligibility ──

interface CompletionRule {
  ruleType: string;
  ruleValue: string;
  isRequired: boolean;
}

interface EligibilityData {
  attendancePct: number;
  trainingHours: number;
  modulesCompleted: number;
  totalModules: number;
  skillsVerified: number;
  totalSkills: number;
  assessmentPassed: boolean;
  productsApproved: number;
  trainerRecommended: boolean;
  adminApproved: boolean;
}

interface RuleResult {
  ruleType: string;
  required: string;
  actual: string;
  passed: boolean;
}

function evaluateEligibility(
  rules: CompletionRule[],
  data: EligibilityData
): { isEligible: boolean; results: RuleResult[] } {
  const results: RuleResult[] = [];
  let isEligible = true;

  for (const rule of rules) {
    let passed = false;
    let actual = '';

    switch (rule.ruleType) {
      case 'MIN_ATTENDANCE_PCT':
        actual = `${data.attendancePct}%`;
        passed = data.attendancePct >= parseFloat(rule.ruleValue);
        break;
      case 'MIN_TRAINING_HOURS':
        actual = `${data.trainingHours}h`;
        passed = data.trainingHours >= parseFloat(rule.ruleValue);
        break;
      case 'MODULES_COMPLETED':
        actual = `${data.modulesCompleted}/${data.totalModules}`;
        passed = rule.ruleValue === 'ALL'
          ? data.modulesCompleted >= data.totalModules
          : data.modulesCompleted >= parseInt(rule.ruleValue);
        break;
      case 'SKILLS_VERIFIED':
        actual = `${data.skillsVerified}/${data.totalSkills}`;
        passed = rule.ruleValue === 'ALL'
          ? data.skillsVerified >= data.totalSkills
          : data.skillsVerified >= parseInt(rule.ruleValue);
        break;
      case 'PRACTICAL_ASSESSMENT_PASSED':
        actual = data.assessmentPassed ? 'Passed' : 'Not passed';
        passed = data.assessmentPassed;
        break;
      case 'PRODUCT_APPROVED':
        actual = `${data.productsApproved}`;
        passed = data.productsApproved >= parseInt(rule.ruleValue);
        break;
      case 'TRAINER_RECOMMENDATION':
        actual = data.trainerRecommended ? 'Yes' : 'No';
        passed = data.trainerRecommended;
        break;
      case 'ADMIN_APPROVAL':
        actual = data.adminApproved ? 'Yes' : 'No';
        passed = data.adminApproved;
        break;
      default:
        actual = 'Unknown rule';
        passed = false;
    }

    if (rule.isRequired && !passed) {
      isEligible = false;
    }

    results.push({
      ruleType: rule.ruleType,
      required: rule.ruleValue,
      actual,
      passed,
    });
  }

  return { isEligible, results };
}

describe('Certificate Eligibility Engine', () => {
  const rules: CompletionRule[] = [
    { ruleType: 'MIN_ATTENDANCE_PCT', ruleValue: '80', isRequired: true },
    { ruleType: 'MODULES_COMPLETED', ruleValue: 'ALL', isRequired: true },
    { ruleType: 'SKILLS_VERIFIED', ruleValue: 'ALL', isRequired: true },
    { ruleType: 'PRODUCT_APPROVED', ruleValue: '1', isRequired: true },
    { ruleType: 'PRACTICAL_ASSESSMENT_PASSED', ruleValue: 'true', isRequired: true },
  ];

  it('should pass when all criteria are met', () => {
    const data: EligibilityData = {
      attendancePct: 85,
      trainingHours: 200,
      modulesCompleted: 8,
      totalModules: 8,
      skillsVerified: 6,
      totalSkills: 6,
      assessmentPassed: true,
      productsApproved: 2,
      trainerRecommended: true,
      adminApproved: true,
    };

    const result = evaluateEligibility(rules, data);
    expect(result.isEligible).toBe(true);
    expect(result.results.every(r => r.passed)).toBe(true);
  });

  it('should fail when attendance is below minimum', () => {
    const data: EligibilityData = {
      attendancePct: 70,
      trainingHours: 200,
      modulesCompleted: 8,
      totalModules: 8,
      skillsVerified: 6,
      totalSkills: 6,
      assessmentPassed: true,
      productsApproved: 2,
      trainerRecommended: true,
      adminApproved: true,
    };

    const result = evaluateEligibility(rules, data);
    expect(result.isEligible).toBe(false);
    const attendanceRule = result.results.find(r => r.ruleType === 'MIN_ATTENDANCE_PCT');
    expect(attendanceRule?.passed).toBe(false);
  });

  it('should fail when not all skills are verified', () => {
    const data: EligibilityData = {
      attendancePct: 85,
      trainingHours: 200,
      modulesCompleted: 8,
      totalModules: 8,
      skillsVerified: 4,
      totalSkills: 6,
      assessmentPassed: true,
      productsApproved: 1,
      trainerRecommended: true,
      adminApproved: true,
    };

    const result = evaluateEligibility(rules, data);
    expect(result.isEligible).toBe(false);
    const skillsRule = result.results.find(r => r.ruleType === 'SKILLS_VERIFIED');
    expect(skillsRule?.passed).toBe(false);
  });

  it('should fail when no product is approved', () => {
    const data: EligibilityData = {
      attendancePct: 85,
      trainingHours: 200,
      modulesCompleted: 8,
      totalModules: 8,
      skillsVerified: 6,
      totalSkills: 6,
      assessmentPassed: true,
      productsApproved: 0,
      trainerRecommended: true,
      adminApproved: true,
    };

    const result = evaluateEligibility(rules, data);
    expect(result.isEligible).toBe(false);
  });

  it('should handle optional rules not blocking eligibility', () => {
    const rulesWithOptional: CompletionRule[] = [
      { ruleType: 'MIN_ATTENDANCE_PCT', ruleValue: '80', isRequired: true },
      { ruleType: 'TRAINER_RECOMMENDATION', ruleValue: 'true', isRequired: false },
    ];

    const data: EligibilityData = {
      attendancePct: 85,
      trainingHours: 200,
      modulesCompleted: 8,
      totalModules: 8,
      skillsVerified: 6,
      totalSkills: 6,
      assessmentPassed: true,
      productsApproved: 1,
      trainerRecommended: false,
      adminApproved: false,
    };

    const result = evaluateEligibility(rulesWithOptional, data);
    expect(result.isEligible).toBe(true);
    const recommendRule = result.results.find(r => r.ruleType === 'TRAINER_RECOMMENDATION');
    expect(recommendRule?.passed).toBe(false); // Failed but not required
  });
});

// ── Certificate Number Generation ──

function generateCertificateNumber(year: number, sequence: number): string {
  return `KISS-VT-${year}-${String(sequence).padStart(6, '0')}`;
}

describe('Certificate Number Generation', () => {
  it('should generate correct format', () => {
    expect(generateCertificateNumber(2026, 1)).toBe('KISS-VT-2026-000001');
    expect(generateCertificateNumber(2026, 123)).toBe('KISS-VT-2026-000123');
    expect(generateCertificateNumber(2027, 999999)).toBe('KISS-VT-2027-999999');
  });
});

// ── Validation Tests ──

describe('Shared Validation Schemas', () => {
  it('should validate login schema', async () => {
    const { loginSchema } = await import('../../packages/shared/src/validation');

    const valid = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({ email: 'not-an-email', password: '123' });
    expect(invalid.success).toBe(false);
  });

  it('should validate pagination schema', async () => {
    const { paginationSchema } = await import('../../packages/shared/src/validation');

    const result = paginationSchema.safeParse({ page: '2', limit: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it('should reject limit over 100', async () => {
    const { paginationSchema } = await import('../../packages/shared/src/validation');

    const result = paginationSchema.safeParse({ limit: '200' });
    expect(result.success).toBe(false);
  });
});

// ── Product Status Transitions ──

const VALID_TRANSITIONS: Record<string, string[]> = {
  'IDEA': ['DESIGN'],
  'DESIGN': ['IN_PROGRESS', 'IDEA'],
  'IN_PROGRESS': ['SUBMITTED', 'DESIGN'],
  'SUBMITTED': ['UNDER_REVIEW'],
  'UNDER_REVIEW': ['APPROVED', 'REVISION_REQUIRED'],
  'REVISION_REQUIRED': ['IN_PROGRESS', 'SUBMITTED'],
  'APPROVED': ['COMPLETED'],
  'COMPLETED': [],
};

function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

describe('Product Status Transitions', () => {
  it('should allow valid transitions', () => {
    expect(isValidTransition('IDEA', 'DESIGN')).toBe(true);
    expect(isValidTransition('DESIGN', 'IN_PROGRESS')).toBe(true);
    expect(isValidTransition('IN_PROGRESS', 'SUBMITTED')).toBe(true);
    expect(isValidTransition('SUBMITTED', 'UNDER_REVIEW')).toBe(true);
    expect(isValidTransition('UNDER_REVIEW', 'APPROVED')).toBe(true);
    expect(isValidTransition('APPROVED', 'COMPLETED')).toBe(true);
  });

  it('should reject invalid transitions', () => {
    expect(isValidTransition('IDEA', 'APPROVED')).toBe(false);
    expect(isValidTransition('COMPLETED', 'IDEA')).toBe(false);
    expect(isValidTransition('SUBMITTED', 'APPROVED')).toBe(false);
  });

  it('should allow revision flow', () => {
    expect(isValidTransition('UNDER_REVIEW', 'REVISION_REQUIRED')).toBe(true);
    expect(isValidTransition('REVISION_REQUIRED', 'IN_PROGRESS')).toBe(true);
    expect(isValidTransition('REVISION_REQUIRED', 'SUBMITTED')).toBe(true);
  });
});
