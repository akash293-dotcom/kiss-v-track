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

const assertBatchAccess = (batch: any, actor: Actor) => {
  if (actor.role === UserRole.ADMIN) return;
  if (actor.role === UserRole.CENTRE_ADMIN && batch.campusId === actor.campusId) return;
  if (actor.role === UserRole.TRAINER && batch.trainerId === actor.trainer?.id) return;
  if (actor.role === UserRole.TRAINEE && batch.enrollments?.some((enrollment: any) => enrollment.traineeId === actor.trainee?.id)) return;
  throw new ForbiddenError('You do not have access to this batch');
};

export const list = async (query: any, actor: Actor) => {
  const { campusId, electiveId, trainerId, status } = query;
  const where: any = {};
  if (electiveId) where.electiveId = electiveId;
  if (status) where.status = status;

  if (actor.role === UserRole.TRAINER) where.trainerId = actor.trainer?.id || '__no_trainer_profile__';
  else if (actor.role === UserRole.CENTRE_ADMIN) where.campusId = actor.campusId || '__no_campus__';
  else if (actor.role === UserRole.TRAINEE) where.enrollments = { some: { traineeId: actor.trainee?.id || '__no_trainee_profile__' } };
  else {
    if (campusId) where.campusId = campusId;
    if (trainerId) where.trainerId = trainerId;
  }

  return prisma.trainingBatch.findMany({
    where,
    include: {
      elective: true,
      campus: true,
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { startDate: 'desc' },
  });
};

export const get = async (id: string, actor?: Actor) => {
  const record = await prisma.trainingBatch.findUnique({
    where: { id },
    include: {
      elective: true,
      campus: true,
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
      enrollments: { select: { traineeId: true } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!record) throw new AppError('Batch not found', 404);
  if (actor) assertBatchAccess(record, actor);
  return record;
};

export const create = async (data: any, actor: Actor) => {
  if (actor.role === UserRole.CENTRE_ADMIN) {
    if (!actor.campusId) throw new ForbiddenError('Centre admin is not assigned to a campus');
    data.campusId = actor.campusId;
  }
  if (!data.name?.trim() || !data.code?.trim() || !data.electiveId || !data.campusId || !data.startDate || !data.endDate) {
    throw new AppError('Batch name, code, program, campus, start date and end date are required', 400);
  }
  if (new Date(data.endDate) < new Date(data.startDate)) throw new AppError('End date cannot be before start date', 400);
  return prisma.trainingBatch.create({ data: { ...data, startDate: new Date(data.startDate), endDate: new Date(data.endDate) } });
};

export const update = async (id: string, data: any, actor: Actor) => {
  const batch = await get(id, actor);
  if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.CENTRE_ADMIN) throw new ForbiddenError('Only administrators can update batches');
  if (actor.role === UserRole.CENTRE_ADMIN && data.campusId && data.campusId !== actor.campusId) throw new ForbiddenError('You cannot move a batch outside your campus');
  const { campusId: _campusId, ...safeData } = actor.role === UserRole.CENTRE_ADMIN ? data : { ...data, campusId: undefined };
  if (safeData.startDate) safeData.startDate = new Date(safeData.startDate);
  if (safeData.endDate) safeData.endDate = new Date(safeData.endDate);
  const start = safeData.startDate || batch.startDate;
  const end = safeData.endDate || batch.endDate;
  if (end < start) throw new AppError('End date cannot be before start date', 400);
  return prisma.trainingBatch.update({ where: { id }, data: safeData });
};

// A batch cancellation preserves enrollments, sessions and attendance history.
export const remove = async (id: string, actor: Actor) => {
  await get(id, actor);
  if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.CENTRE_ADMIN) throw new ForbiddenError('Only administrators can cancel batches');
  return prisma.trainingBatch.update({ where: { id }, data: { status: 'CANCELLED' } });
};

export const getEnrollments = async (id: string, actor: Actor) => {
  await get(id, actor);
  return prisma.enrollment.findMany({
    where: { batchId: id },
    include: { trainee: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
  });
};

export const getSessions = async (id: string, actor: Actor) => {
  await get(id, actor);
  return prisma.trainingSession.findMany({
    where: { batchId: id },
    include: { trainer: { include: { user: { select: { firstName: true, lastName: true } } } }, module: true },
    orderBy: { date: 'asc' },
  });
};
