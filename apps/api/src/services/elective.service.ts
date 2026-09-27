import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const { categoryId, status } = query;
  const where: any = {};
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;

  return prisma.vocationalElective.findMany({
    where,
    include: {
      category: { select: { name: true } },
      _count: { select: { modules: true } }
    }
  });
};

export const get = async (id: string) => {
  const record = await prisma.vocationalElective.findUnique({
    where: { id },
    include: { 
      category: true,
      modules: { orderBy: { sequenceOrder: 'asc' } },
      completionRules: true
    }
  });
  if (!record) throw new AppError('Elective not found', 404);
  return record;
};

export const create = async (data: any) => {
  return prisma.vocationalElective.create({ data });
};

export const update = async (id: string, data: any) => {
  await get(id);
  return prisma.vocationalElective.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  await get(id);
  return prisma.vocationalElective.delete({ where: { id } });
};
