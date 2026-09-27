import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const { isActive } = query;
  const where: any = {};
  if (isActive !== undefined) where.isActive = isActive === 'true';

  return prisma.vocationalCategory.findMany({
    where,
    include: {
      _count: {
        select: { electives: true }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });
};

export const get = async (id: string) => {
  const record = await prisma.vocationalCategory.findUnique({
    where: { id },
    include: { electives: true }
  });
  if (!record) throw new AppError('Category not found', 404);
  return record;
};

export const create = async (data: any) => {
  return prisma.vocationalCategory.create({ data });
};

export const update = async (id: string, data: any) => {
  await get(id);
  return prisma.vocationalCategory.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  await get(id);
  return prisma.vocationalCategory.delete({ where: { id } });
};
