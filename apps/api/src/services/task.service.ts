import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const { trainerId, batchId, status } = query;
  const where: any = {};
  if (trainerId) where.trainerId = trainerId;
  if (batchId) where.batchId = batchId;
  if (status) where.status = status;

  return prisma.practicalTask.findMany({
    where,
    include: {
      _count: { select: { submissions: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const get = async (id: string) => {
  const record = await prisma.practicalTask.findUnique({
    where: { id },
    include: {
      submissions: { include: { trainee: { include: { user: true } } } }
    }
  });
  if (!record) throw new AppError('Task not found', 404);
  return record;
};

export const create = async (data: any) => {
  return prisma.practicalTask.create({ data });
};

export const update = async (id: string, data: any) => {
  await get(id);
  return prisma.practicalTask.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  await get(id);
  return prisma.practicalTask.delete({ where: { id } });
};

export const submitTask = async (taskId: string, data: any) => {
  const { traineeId, description, fileUrls } = data;
  
  const existing = await prisma.practicalSubmission.findUnique({
    where: { taskId_traineeId: { taskId, traineeId } }
  });
  if (existing) {
    return prisma.practicalSubmission.update({
      where: { id: existing.id },
      data: { description, fileUrls, status: 'SUBMITTED', submittedAt: new Date() }
    });
  }

  return prisma.practicalSubmission.create({
    data: { taskId, traineeId, description, fileUrls, status: 'SUBMITTED' }
  });
};

export const reviewSubmission = async (submissionId: string, data: any) => {
  const { status, feedback, score, maxScore } = data;
  
  return prisma.practicalSubmission.update({
    where: { id: submissionId },
    data: { status, feedback, score, maxScore, reviewedAt: new Date() }
  });
};
