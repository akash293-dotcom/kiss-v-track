import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const { batchId, traineeId, status } = query;
  const where: any = {};
  if (batchId) where.batchId = batchId;
  if (traineeId) where.traineeId = traineeId;
  if (status) where.status = status;

  return prisma.enrollment.findMany({
    where,
    include: {
      trainee: { include: { user: true } },
      batch: true
    }
  });
};

export const create = async (data: any) => {
  const { traineeId, batchId } = data;
  
  // Check for duplicate active enrollment
  const existing = await prisma.enrollment.findFirst({
    where: { traineeId, batchId, status: 'ACTIVE' }
  });
  
  if (existing) {
    throw new AppError('Trainee is already actively enrolled in this batch', 400);
  }

  return prisma.enrollment.create({ data });
};

export const update = async (id: string, data: any) => {
  const record = await prisma.enrollment.findUnique({ where: { id } });
  if (!record) throw new AppError('Enrollment not found', 404);
  
  return prisma.enrollment.update({ where: { id }, data });
};
