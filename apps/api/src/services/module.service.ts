import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const { electiveId, isActive } = query;
  const where: any = {};
  if (electiveId) where.electiveId = electiveId;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  return prisma.module.findMany({
    where,
    include: {
      _count: { select: { moduleSkills: true } }
    },
    orderBy: { sequenceOrder: 'asc' }
  });
};

export const get = async (id: string) => {
  const record = await prisma.module.findUnique({
    where: { id },
    include: { 
      moduleSkills: { include: { skill: true } }
    }
  });
  if (!record) throw new AppError('Module not found', 404);
  return record;
};

export const create = async (data: any) => {
  const { skillIds, ...moduleData } = data;
  
  return prisma.$transaction(async (tx) => {
    const module = await tx.module.create({ data: moduleData });
    
    if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
      await tx.moduleSkill.createMany({
        data: skillIds.map((skillId: string) => ({ moduleId: module.id, skillId }))
      });
    }
    
    return tx.module.findUnique({ where: { id: module.id }, include: { moduleSkills: true } });
  });
};

export const update = async (id: string, data: any) => {
  const { skillIds, ...moduleData } = data;
  await get(id);
  
  return prisma.$transaction(async (tx) => {
    const module = await tx.module.update({ where: { id }, data: moduleData });
    
    if (skillIds && Array.isArray(skillIds)) {
      await tx.moduleSkill.deleteMany({ where: { moduleId: id } });
      if (skillIds.length > 0) {
        await tx.moduleSkill.createMany({
          data: skillIds.map((skillId: string) => ({ moduleId: id, skillId }))
        });
      }
    }
    
    return tx.module.findUnique({ where: { id }, include: { moduleSkills: true } });
  });
};

export const remove = async (id: string) => {
  await get(id);
  return prisma.module.update({ where: { id }, data: { isActive: false } });
};
