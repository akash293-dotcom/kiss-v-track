import prisma from '../lib/prisma';
import { NotFoundError, ValidationError } from '../lib/errors';

export const list = async (query: { page?: number; limit?: number; traineeId?: string; status?: string }) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const where: Record<string, unknown> = {};

  if (query.traineeId) where.traineeId = query.traineeId;
  if (query.status) where.status = query.status;

  const [data, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      include: {
        trainee: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
      orderBy: { issueDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.certificate.count({ where }),
  ]);

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getById = async (id: string) => {
  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: {
      trainee: { include: { user: { select: { firstName: true, lastName: true, email: true, profilePhoto: true } } } },
      issuedBy: { select: { firstName: true, lastName: true } },
    },
  });
  if (!cert) throw new NotFoundError('Certificate not found');
  return cert;
};

export const verifyByCertificateNo = async (certificateNo: string) => {
  const cert = await prisma.certificate.findUnique({
    where: { certificateNo },
    include: {
      trainee: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  if (!cert) {
    return null;
  }

  return {
    certificateNo: cert.certificateNo,
    traineeName: `${cert.trainee.user.firstName} ${cert.trainee.user.lastName}`,
    programName: cert.title,
    trainingPeriod: cert.trainingPeriod,
    trainingHours: cert.trainingHours,
    verifiedSkills: cert.skillsSummary ? JSON.parse(cert.skillsSummary) : [],
    issueDate: cert.issueDate.toISOString(),
    status: cert.status,
  };
};

export const checkEligibility = async (traineeId: string, electiveId: string) => {
  const rules = await prisma.completionRule.findMany({
    where: { electiveId },
    orderBy: { sortOrder: 'asc' },
  });

  const results: { ruleType: string; description: string | null; required: string; actual: string; passed: boolean }[] = [];
  let isEligible = true;

  for (const rule of rules) {
    let actual = '';
    let passed = false;

    switch (rule.ruleType) {
      case 'MIN_ATTENDANCE_PCT': {
        const allAttendance = await prisma.attendance.findMany({
          where: { traineeId, session: { batch: { electiveId } } },
        });
        const presentCount = allAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        const pct = allAttendance.length > 0 ? Math.round((presentCount / allAttendance.length) * 100) : 0;
        actual = `${pct}%`;
        passed = pct >= parseFloat(rule.ruleValue);
        break;
      }
      case 'MIN_TRAINING_HOURS': {
        const sessions = await prisma.trainingSession.findMany({
          where: { batch: { electiveId }, status: 'COMPLETED' },
        });
        const totalHours = sessions.reduce((sum, s) => sum + s.durationMin, 0) / 60;
        actual = `${Math.round(totalHours)}h`;
        passed = totalHours >= parseFloat(rule.ruleValue);
        break;
      }
      case 'MODULES_COMPLETED': {
        const totalModules = await prisma.module.count({ where: { electiveId } });
        // Simplified: check if trainee has skills verified for module skills
        const verifiedSkillCount = await prisma.traineeSkill.count({
          where: {
            traineeId,
            status: 'VERIFIED',
            skill: { moduleSkills: { some: { module: { electiveId } } } },
          },
        });
        actual = `${verifiedSkillCount}/${totalModules} modules`;
        passed = rule.ruleValue === 'ALL' ? verifiedSkillCount >= totalModules : verifiedSkillCount >= parseInt(rule.ruleValue);
        break;
      }
      case 'SKILLS_VERIFIED': {
        const totalRequiredSkills = await prisma.skill.count({
          where: { moduleSkills: { some: { module: { electiveId } } } },
        });
        const verifiedCount = await prisma.traineeSkill.count({
          where: {
            traineeId,
            status: 'VERIFIED',
            skill: { moduleSkills: { some: { module: { electiveId } } } },
          },
        });
        actual = `${verifiedCount}/${totalRequiredSkills}`;
        passed = rule.ruleValue === 'ALL' ? verifiedCount >= totalRequiredSkills : verifiedCount >= parseInt(rule.ruleValue);
        break;
      }
      case 'PRACTICAL_ASSESSMENT_PASSED': {
        const passedAssessments = await prisma.assessment.count({
          where: {
            traineeId,
            type: 'PRACTICAL',
            result: { in: ['PASS', 'MERIT', 'DISTINCTION'] },
          },
        });
        actual = passedAssessments > 0 ? 'Passed' : 'Not passed';
        passed = passedAssessments > 0;
        break;
      }
      case 'PRODUCT_APPROVED': {
        const approvedProducts = await prisma.product.count({
          where: { traineeId, status: { in: ['APPROVED', 'COMPLETED'] } },
        });
        actual = `${approvedProducts}`;
        passed = approvedProducts >= parseInt(rule.ruleValue);
        break;
      }
      case 'TRAINER_RECOMMENDATION': {
        actual = 'Pending';
        passed = false; // Manual approval needed
        break;
      }
      case 'ADMIN_APPROVAL': {
        actual = 'Pending';
        passed = false; // Manual approval needed
        break;
      }
      default:
        actual = 'Unknown';
        passed = false;
    }

    if (rule.isRequired && !passed) {
      isEligible = false;
    }

    results.push({
      ruleType: rule.ruleType,
      description: rule.description,
      required: rule.ruleValue,
      actual,
      passed,
    });
  }

  return { isEligible, rules: results };
};

export const issueCertificate = async (data: {
  traineeId: string;
  electiveId?: string | null;
  title: string;
  description?: string | null;
  trainingPeriod?: string | null;
  trainingHours?: number | null;
  signatory?: string | null;
}, issuerId: string) => {
  // Check eligibility if electiveId provided
  if (data.electiveId) {
    const eligibility = await checkEligibility(data.traineeId, data.electiveId);
    if (!eligibility.isEligible) {
      throw new ValidationError('Trainee does not meet all completion requirements');
    }
  }

  // Generate certificate number
  const year = new Date().getFullYear();
  const count = await prisma.certificate.count({
    where: { certificateNo: { startsWith: `KISS-VT-${year}` } },
  });
  const seq = (count + 1).toString().padStart(6, '0');
  const certificateNo = `KISS-VT-${year}-${seq}`;

  // Get verified skills for summary
  let skillsSummary: string | null = null;
  if (data.electiveId) {
    const verifiedSkills = await prisma.traineeSkill.findMany({
      where: {
        traineeId: data.traineeId,
        status: 'VERIFIED',
        skill: { moduleSkills: { some: { module: { electiveId: data.electiveId } } } },
      },
      include: { skill: { select: { name: true } } },
    });
    skillsSummary = JSON.stringify(verifiedSkills.map(vs => vs.skill.name));
  }

  // Generate QR code URL
  const qrCode = `${process.env.APP_URL || 'http://localhost:5173'}/verify/certificate/${certificateNo}`;

  const certificate = await prisma.certificate.create({
    data: {
      traineeId: data.traineeId,
      electiveId: data.electiveId,
      certificateNo,
      title: data.title,
      description: data.description,
      trainingPeriod: data.trainingPeriod,
      trainingHours: data.trainingHours,
      skillsSummary,
      issueDate: new Date(),
      status: 'ISSUED',
      issuedById: issuerId,
      signatory: data.signatory || 'Dr. Achyuta Samanta, Founder — KISS',
      qrCode,
    },
    include: {
      trainee: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  return certificate;
};

export const revokeCertificate = async (id: string, reason: string) => {
  const cert = await getById(id);
  if (cert.status === 'REVOKED') {
    throw new ValidationError('Certificate is already revoked');
  }

  return prisma.certificate.update({
    where: { id },
    data: {
      status: 'REVOKED',
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
};
