import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const { categoryId, difficulty, search } = query;
  const where: any = {};
  if (categoryId) where.categoryId = categoryId;
  if (difficulty) where.difficulty = difficulty;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } }
    ];
  }

  return prisma.skill.findMany({ where, include: { category: true } });
};

export const get = async (id: string) => {
  const record = await prisma.skill.findUnique({ where: { id }, include: { category: true } });
  if (!record) throw new AppError('Skill not found', 404);
  return record;
};

export const create = async (data: any) => {
  return prisma.skill.create({ data });
};

export const update = async (id: string, data: any) => {
  await get(id);
  return prisma.skill.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  await get(id);
  return prisma.skill.delete({ where: { id } });
};

export const verifySkill = async (data: { traineeId: string, skillId: string, assessmentNotes?: string }, trainerId: string) => {
  const { traineeId, skillId, assessmentNotes } = data;
  
  const existing = await prisma.traineeSkill.findUnique({
    where: { traineeId_skillId: { traineeId, skillId } }
  });

  if (existing) {
    return prisma.traineeSkill.update({
      where: { id: existing.id },
      data: {
        status: 'VERIFIED',
        dateVerified: new Date(),
        verifiedById: trainerId,
        assessmentNotes,
        progressPct: 100
      }
    });
  }

  return prisma.traineeSkill.create({
    data: {
      traineeId,
      skillId,
      status: 'VERIFIED',
      dateVerified: new Date(),
      verifiedById: trainerId,
      assessmentNotes,
      progressPct: 100
    }
  });
};

export const getTraineeSkill = async (traineeId: string, skillId: string) => {
  return prisma.traineeSkill.findUnique({
    where: { traineeId_skillId: { traineeId, skillId } },
    include: { skill: true, verifiedBy: { include: { user: true } } }
  });
};

export const updateTraineeSkill = async (traineeId: string, skillId: string, data: any) => {
  const existing = await prisma.traineeSkill.findUnique({
    where: { traineeId_skillId: { traineeId, skillId } }
  });

  if (existing) {
    return prisma.traineeSkill.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.traineeSkill.create({
    data: { traineeId, skillId, ...data }
  });
};
