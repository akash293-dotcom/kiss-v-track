import { prisma } from '../lib/prisma';
import { AppError, ForbiddenError } from '../lib/errors';
import { UserRole } from '@prisma/client';

type Actor = {
  id: string;
  role: UserRole;
  campusId?: string | null;
  trainee?: { id: string } | null;
  trainer?: { id: string } | null;
};

export const list = async (query: any, actor: Actor) => {
  const { traineeId, batchId, trainerId } = query;
  const where: any = {};
  if (batchId) where.batchId = batchId;

  if (actor.role === UserRole.TRAINEE) {
    where.traineeId = actor.trainee?.id || '__no_trainee_profile__';
  } else if (actor.role === UserRole.TRAINER) {
    where.trainerId = actor.trainer?.id || '__no_trainer_profile__';
  } else if (actor.role === UserRole.CENTRE_ADMIN) {
    where.trainee = { campusId: actor.campusId || '__no_campus__' };
  } else if (traineeId) {
    where.traineeId = traineeId;
  }
  if (actor.role === UserRole.ADMIN && trainerId) where.trainerId = trainerId;

  return prisma.assessment.findMany({
    where,
    include: {
      trainee: { include: { user: { select: { firstName: true, lastName: true } } } },
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
      assessmentSkills: { include: { skill: { select: { name: true } } } },
    },
    orderBy: { assessedAt: 'desc' },
  });
};

export const get = async (id: string, actor?: Actor) => {
  const record = await prisma.assessment.findUnique({
    where: { id },
    include: {
      trainee: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
      assessmentSkills: { include: { skill: true } },
    },
  });
  if (!record) throw new AppError('Assessment not found', 404);

  if (actor?.role === UserRole.TRAINEE && record.traineeId !== actor.trainee?.id) throw new ForbiddenError('You can only view your own assessments');
  if (actor?.role === UserRole.TRAINER && record.trainerId !== actor.trainer?.id) throw new ForbiddenError('You can only view assessments you created');
  if (actor?.role === UserRole.CENTRE_ADMIN && record.trainee.campusId !== actor.campusId) throw new ForbiddenError('You cannot access assessments outside your campus');
  return record;
};

export const create = async (data: any) => {
  const { skillIds, ...assessmentData } = data;
  if (!assessmentData.traineeId || !assessmentData.trainerId || !assessmentData.title?.trim()) {
    throw new AppError('Trainee, trainer and assessment title are required', 400);
  }

  return prisma.$transaction(async (tx) => {
    const assessment = await tx.assessment.create({ data: assessmentData });
    if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
      await tx.assessmentSkill.createMany({
        data: [...new Set(skillIds)].map((skillId: string) => ({ assessmentId: assessment.id, skillId })),
      });
    }
    return assessment;
  });
};

export const update = async (id: string, data: any, trainerId: string) => {
  const existing = await prisma.assessment.findUnique({ where: { id } });
  if (!existing) throw new AppError('Assessment not found', 404);
  if (existing.trainerId !== trainerId) throw new ForbiddenError('You can only update assessments you created');

  const { skillIds, trainerId: _ignoredTrainerId, traineeId: _ignoredTraineeId, ...assessmentData } = data;
  return prisma.$transaction(async (tx) => {
    const assessment = await tx.assessment.update({ where: { id }, data: assessmentData });
    if (skillIds && Array.isArray(skillIds)) {
      await tx.assessmentSkill.deleteMany({ where: { assessmentId: id } });
      if (skillIds.length > 0) await tx.assessmentSkill.createMany({
        data: [...new Set(skillIds)].map((skillId: string) => ({ assessmentId: id, skillId })),
      });
    }
    return assessment;
  });
};

export const remove = async (id: string, trainerId: string) => {
  const existing = await prisma.assessment.findUnique({ where: { id } });
  if (!existing) throw new AppError('Assessment not found', 404);
  if (existing.trainerId !== trainerId) throw new ForbiddenError('You can only delete assessments you created');
  return prisma.assessment.delete({ where: { id } });
};
