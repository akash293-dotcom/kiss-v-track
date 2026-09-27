import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const { campusId, electiveId, trainerId, status } = query;
  const where: any = {};
  if (campusId) where.campusId = campusId;
  if (electiveId) where.electiveId = electiveId;
  if (trainerId) where.trainerId = trainerId;
  if (status) where.status = status;

  return prisma.trainingBatch.findMany({
    where,
    include: {
      elective: true,
      campus: true,
      trainer: { include: { user: true } },
      _count: { select: { enrollments: true } }
    }
  });
};

export const get = async (id: string) => {
  const record = await prisma.trainingBatch.findUnique({
    where: { id },
    include: {
      elective: true,
      campus: true,
      trainer: { include: { user: true } },
      _count: { select: { enrollments: true } }
    }
  });
  if (!record) throw new AppError('Batch not found', 404);
  return record;
};

export const create = async (data: any) => {
  return prisma.trainingBatch.create({ data });
};

export const update = async (id: string, data: any) => {
  await get(id);
  return prisma.trainingBatch.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  await get(id);
  return prisma.trainingBatch.delete({ where: { id } });
};

export const getEnrollments = async (id: string) => {
  return prisma.enrollment.findMany({
    where: { batchId: id },
    include: { trainee: { include: { user: true } } }
  });
};

export const getSessions = async (id: string) => {
  return prisma.trainingSession.findMany({
    where: { batchId: id },
    include: { trainer: { include: { user: true } }, module: true },
    orderBy: { date: 'asc' }
  });
};
