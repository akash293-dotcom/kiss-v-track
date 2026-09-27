import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const { batchId, trainerId, date, status } = query;
  const where: any = {};
  if (batchId) where.batchId = batchId;
  if (trainerId) where.trainerId = trainerId;
  if (date) {
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.date = { gte: start, lt: end };
  }
  if (status) where.status = status;

  return prisma.trainingSession.findMany({
    where,
    include: {
      batch: { select: { name: true } },
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
      module: { select: { name: true } }
    },
    orderBy: { date: 'asc' }
  });
};

export const get = async (id: string) => {
  const record = await prisma.trainingSession.findUnique({
    where: { id },
    include: {
      batch: true,
      trainer: { include: { user: true } },
      module: true
    }
  });
  if (!record) throw new AppError('Session not found', 404);
  return record;
};

export const create = async (data: any) => {
  if (data.date) data.date = new Date(data.date);
  return prisma.trainingSession.create({ data });
};

export const update = async (id: string, data: any) => {
  await get(id);
  if (data.date) data.date = new Date(data.date);
  return prisma.trainingSession.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  await get(id);
  return prisma.trainingSession.delete({ where: { id } });
};
