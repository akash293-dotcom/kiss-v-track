import prisma from '../lib/prisma';
import { NotFoundError, ValidationError } from '../lib/errors';

export const list = async (query: { page?: number; limit?: number; traineeId?: string; status?: string; campusId?: string; trainerId?: string }) => {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const where: any = {};

  if (query.traineeId) where.traineeId = query.traineeId;
  if (query.status) where.status = query.status;
  if (query.campusId) where.trainee = { campusId: query.campusId };
  if (query.trainerId) where.trainee = { ...(where.trainee || {}), enrollments: { some: { status: 'ACTIVE', batch: { trainerId: query.trainerId } } } };

  const [data, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      include: {
        trainee: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
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

const parseSkills = (value: string | null) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const verifyByCertificateNo = async (certificateNo: string) => {
  const cert = await prisma.certificate.findUnique({
    where: { certificateNo },
    include: { trainee: { include: { user: { select: { firstName: true, lastName: true } } } } },
  });
  if (!cert) return null;

  return {
    certificateNo: cert.certificateNo,
    traineeName: `${cert.trainee.user.firstName} ${cert.trainee.user.lastName}`,
    programName: cert.title,
    trainingPeriod: cert.trainingPeriod,
    trainingHours: cert.trainingHours,
    verifiedSkills: parseSkills(cert.skillsSummary),
    issueDate: cert.issueDate.toISOString(),
    status: cert.status,
  };
};

export const checkEligibility = async (traineeId: string, electiveId: string) => {
  const trainee = await prisma.trainee.findUnique({ where: { id: traineeId }, select: { id: true } });
  if (!trainee) throw new NotFoundError('Trainee not found');
  const elective = await prisma.vocationalElective.findUnique({ where: { id: electiveId }, select: { id: true } });
  if (!elective) throw new NotFoundError('Program not found');

  const [rules, enrollments, modules] = await Promise.all([
    prisma.completionRule.findMany({ where: { electiveId }, orderBy: { sortOrder: 'asc' } }),
    prisma.enrollment.findMany({
      where: { traineeId, status: 'ACTIVE', batch: { electiveId } },
      select: { batchId: true },
    }),
    prisma.module.findMany({
      where: { electiveId, isActive: true },
      include: { moduleSkills: { select: { skillId: true } } },
    }),
  ]);

  const batchIds = enrollments.map((item) => item.batchId);
  const moduleSkillIds = [...new Set(modules.flatMap((module) => module.moduleSkills.map((item) => item.skillId)))];
  const verifiedSkills = moduleSkillIds.length
    ? await prisma.traineeSkill.findMany({
        where: { traineeId, status: 'VERIFIED', skillId: { in: moduleSkillIds } },
        select: { skillId: true },
      })
    : [];
  const verifiedIds = new Set(verifiedSkills.map((item) => item.skillId));

  const completedModules = modules.filter((module) =>
    module.moduleSkills.length > 0 && module.moduleSkills.every((item) => verifiedIds.has(item.skillId))
  ).length;

  const results: { ruleType: string; description: string | null; required: string; actual: string; passed: boolean }[] = [];
  let isEligible = true;

  for (const rule of rules) {
    let actual = '';
    let passed = false;

    switch (rule.ruleType) {
      case 'MIN_ATTENDANCE_PCT': {
        const totalSessions = batchIds.length ? await prisma.trainingSession.count({
          where: { batchId: { in: batchIds }, status: 'COMPLETED' },
        }) : 0;
        const attended = batchIds.length ? await prisma.attendance.count({
          where: { traineeId, session: { batchId: { in: batchIds }, status: 'COMPLETED' }, status: { in: ['PRESENT', 'LATE'] } },
        }) : 0;
        const pct = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;
        actual = `${pct}%`;
        passed = pct >= Number(rule.ruleValue);
        break;
      }
      case 'MIN_TRAINING_HOURS': {
        const attendances = batchIds.length ? await prisma.attendance.findMany({
          where: { traineeId, session: { batchId: { in: batchIds }, status: 'COMPLETED' }, status: { in: ['PRESENT', 'LATE'] } },
          include: { session: { select: { durationMin: true } } },
        }) : [];
        const hours = attendances.reduce((sum, item) => sum + item.session.durationMin, 0) / 60;
        actual = `${Math.round(hours * 10) / 10}h`;
        passed = hours >= Number(rule.ruleValue);
        break;
      }
      case 'MODULES_COMPLETED': {
        const required = rule.ruleValue === 'ALL' ? modules.length : Number.parseInt(rule.ruleValue, 10);
        actual = `${completedModules}/${modules.length} modules`;
        passed = Number.isFinite(required) && completedModules >= required;
        break;
      }
      case 'SKILLS_VERIFIED': {
        const required = rule.ruleValue === 'ALL' ? moduleSkillIds.length : Number.parseInt(rule.ruleValue, 10);
        actual = `${verifiedIds.size}/${moduleSkillIds.length} skills`;
        passed = Number.isFinite(required) && verifiedIds.size >= required;
        break;
      }
      case 'PRACTICAL_ASSESSMENT_PASSED': {
        const passedAssessments = batchIds.length ? await prisma.assessment.count({
          where: { traineeId, batchId: { in: batchIds }, type: 'PRACTICAL', result: { in: ['PASS', 'MERIT', 'DISTINCTION'] } },
        }) : 0;
        actual = passedAssessments > 0 ? 'Passed' : 'Not passed';
        passed = passedAssessments > 0;
        break;
      }
      case 'PRODUCT_APPROVED': {
        const approvedProducts = batchIds.length ? await prisma.product.count({
          where: { traineeId, batchId: { in: batchIds }, status: { in: ['APPROVED', 'COMPLETED'] } },
        }) : 0;
        actual = String(approvedProducts);
        passed = approvedProducts >= Number(rule.ruleValue);
        break;
      }
      case 'TRAINER_RECOMMENDATION':
      case 'ADMIN_APPROVAL':
        actual = 'Manual approval is not configured';
        passed = false;
        break;
      default:
        actual = 'Unsupported completion rule';
        passed = false;
    }

    if (rule.isRequired && !passed) isEligible = false;
    results.push({ ruleType: rule.ruleType, description: rule.description, required: rule.ruleValue, actual, passed });
  }

  return { isEligible, rules: results, enrollmentRequired: batchIds.length > 0 };
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
  if (!data.traineeId || !data.title?.trim()) throw new ValidationError('Trainee and certificate title are required');
  const trainee = await prisma.trainee.findUnique({ where: { id: data.traineeId }, select: { id: true } });
  if (!trainee) throw new NotFoundError('Trainee not found');

  if (data.electiveId) {
    const eligibility = await checkEligibility(data.traineeId, data.electiveId);
    if (!eligibility.isEligible) throw new ValidationError('Trainee does not meet all required completion requirements');
  }

  const year = new Date().getFullYear();
  const count = await prisma.certificate.count({ where: { certificateNo: { startsWith: `KISS-VT-${year}` } } });
  const seq = (count + 1).toString().padStart(6, '0');
  const certificateNo = `KISS-VT-${year}-${seq}`;

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
    skillsSummary = JSON.stringify([...new Set(verifiedSkills.map((item) => item.skill.name))]);
  }

  const frontendUrl = (process.env.APP_URL || process.env.FRONTEND_URL || 'https://kiss-v-track.vercel.app').replace(/\/$/, '');
  const qrCode = `${frontendUrl}/verify/certificate/${certificateNo}`;

  return prisma.certificate.create({
    data: {
      traineeId: data.traineeId,
      electiveId: data.electiveId,
      certificateNo,
      title: data.title.trim(),
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
};

export const revokeCertificate = async (id: string, reason: string) => {
  const cert = await getById(id);
  if (cert.status === 'REVOKED') throw new ValidationError('Certificate is already revoked');
  return prisma.certificate.update({
    where: { id },
    data: { status: 'REVOKED', revokedAt: new Date(), revokedReason: reason },
  });
};
