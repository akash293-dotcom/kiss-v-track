import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const { traineeId, batchId, trainerId } = query;
  const where: any = {};
  if (traineeId) where.traineeId = traineeId;
  if (batchId) where.batchId = batchId;
  if (trainerId) where.trainerId = trainerId;

  return prisma.assessment.findMany({
    where,
    include: {
      trainee: { include: { user: { select: { firstName: true, lastName: true } } } },
      assessmentSkills: { include: { skill: { select: { name: true } } } }
    },
    orderBy: { assessedAt: 'desc' }
  });
};

export const get = async (id: string) => {
  const record = await prisma.assessment.findUnique({
    where: { id },
    include: {
      trainee: { include: { user: true } },
      assessmentSkills: { include: { skill: true } }
    }
  });
  if (!record) throw new AppError('Assessment not found', 404);
  return record;
};

export const create = async (data: any) => {
  const { skillIds, ...assessmentData } = data;

  return prisma.$transaction(async (tx) => {
    const assessment = await tx.assessment.create({ data: assessmentData });

    if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
      await tx.assessmentSkill.createMany({
        data: skillIds.map((skillId: string) => ({ assessmentId: assessment.id, skillId }))
      });
    }

    return assessment;
  });
};

export const update = async (id: string, data: any) => {
  const { skillIds, ...assessmentData } = data;
  await get(id);

  return prisma.$transaction(async (tx) => {
    const assessment = await tx.assessment.update({ where: { id }, data: assessmentData });

    if (skillIds && Array.isArray(skillIds)) {
      await tx.assessmentSkill.deleteMany({ where: { assessmentId: id } });
      if (skillIds.length > 0) {
        await tx.assessmentSkill.createMany({
          data: skillIds.map((skillId: string) => ({ assessmentId: id, skillId }))
        });
      }
    }

    return assessment;
  });
};

export const remove = async (id: string) => {
  await get(id);
  return prisma.assessment.delete({ where: { id } });
};
