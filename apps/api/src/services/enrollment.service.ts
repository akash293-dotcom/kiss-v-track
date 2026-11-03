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
  const { batchId, traineeId, status } = query;
  const where: any = {};
  if (batchId) where.batchId = batchId;
  if (status) where.status = status;

  if (actor.role === UserRole.TRAINEE) where.traineeId = actor.trainee?.id || '__no_trainee_profile__';
  else if (actor.role === UserRole.TRAINER) where.batch = { trainerId: actor.trainer?.id || '__no_trainer_profile__' };
  else if (actor.role === UserRole.CENTRE_ADMIN) where.batch = { campusId: actor.campusId || '__no_campus__' };
  else if (traineeId) where.traineeId = traineeId;

  return prisma.enrollment.findMany({
    where,
    include: {
      trainee: { include: { user: { select: { firstName: true, lastName: true, email: true, isActive: true } } } },
      batch: { include: { elective: { select: { name: true } }, campus: { select: { name: true } } } },
    },
    orderBy: { enrollmentDate: 'desc' },
  });
};

export const create = async (data: any, actor: Actor) => {
  let { traineeId, batchId } = data;
  if (!traineeId || !batchId) throw new AppError('Trainee and batch are required', 400);

  const batch = await prisma.trainingBatch.findUnique({ where: { id: batchId }, select: { id: true, campusId: true, status: true } });
  if (!batch) throw new AppError('Batch not found', 404);
  if (batch.status === 'CANCELLED' || batch.status === 'COMPLETED') throw new AppError('Cannot enroll in a cancelled or completed batch', 400);
  if (actor.role === UserRole.CENTRE_ADMIN && batch.campusId !== actor.campusId) throw new ForbiddenError('You can only enroll trainees in your campus batches');

  const trainee = await prisma.trainee.findUnique({ where: { id: traineeId }, select: { id: true, campusId: true } });
  if (!trainee) throw new AppError('Trainee not found', 404);
  if (actor.role === UserRole.CENTRE_ADMIN && trainee.campusId !== actor.campusId) throw new ForbiddenError('You can only enroll trainees from your campus');

  const existing = await prisma.enrollment.findUnique({ where: { traineeId_batchId: { traineeId, batchId } } });
  if (existing?.status === 'ACTIVE') throw new AppError('Trainee is already actively enrolled in this batch', 409);
  if (existing) return prisma.enrollment.update({
    where: { id: existing.id },
    data: { status: 'ACTIVE', enrollmentDate: new Date(), completionDate: null, remarks: data.remarks ?? null },
  });

  const activeCount = await prisma.enrollment.count({ where: { batchId, status: 'ACTIVE' } });
  const capacity = await prisma.trainingBatch.findUnique({ where: { id: batchId }, select: { capacity: true } });
  if (capacity && activeCount >= capacity.capacity) throw new AppError('Batch capacity has been reached', 409);

  return prisma.enrollment.create({ data: { traineeId, batchId, status: data.status || 'ACTIVE', remarks: data.remarks } });
};

export const update = async (id: string, data: any, actor: Actor) => {
  const record = await prisma.enrollment.findUnique({ where: { id }, include: { batch: true } });
  if (!record) throw new AppError('Enrollment not found', 404);
  if (actor.role === UserRole.CENTRE_ADMIN && record.batch.campusId !== actor.campusId) throw new ForbiddenError('You cannot change enrollments outside your campus');
  if (data.status === 'ACTIVE') {
    const activeCount = await prisma.enrollment.count({ where: { batchId: record.batchId, status: 'ACTIVE', NOT: { id } } });
    if (activeCount >= record.batch.capacity) throw new AppError('Batch capacity has been reached', 409);
  }
  const allowed = ['ACTIVE', 'COMPLETED', 'DROPPED', 'TRANSFERRED', 'CANCELLED'];
  if (data.status && !allowed.includes(data.status)) throw new AppError('Invalid enrollment status', 400);
  return prisma.enrollment.update({ where: { id }, data: { status: data.status, remarks: data.remarks, completionDate: data.status === 'COMPLETED' ? new Date() : data.completionDate } });
};
