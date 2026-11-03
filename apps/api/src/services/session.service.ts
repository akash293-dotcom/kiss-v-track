import { prisma } from '../lib/prisma';
import { AppError, ForbiddenError } from '../lib/errors';
import { UserRole } from '@prisma/client';

type Actor = {
  id: string;
  role: UserRole;
  campusId?: string | null;
  trainer?: { id: string } | null;
  trainee?: { id: string } | null;
};

const parseTime = (value: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(value || '');
  if (!match) throw new AppError('Session times must use HH:mm format', 400);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new AppError('Invalid session time', 400);
  return hours * 60 + minutes;
};

const validateTimes = (data: any) => {
  if (data.startTime && data.endTime) {
    const start = parseTime(data.startTime);
    const end = parseTime(data.endTime);
    if (end <= start) throw new AppError('End time must be later than start time', 400);
    if (data.durationMin === undefined) data.durationMin = end - start;
  }
  if (data.durationMin !== undefined && Number(data.durationMin) <= 0) {
    throw new AppError('Session duration must be greater than zero', 400);
  }
};

export const list = async (query: any, actor: Actor) => {
  const { batchId, date, status } = query;
  const where: any = {};
  if (batchId) where.batchId = batchId;
  if (status) where.status = status;

  if (actor.role === UserRole.TRAINER) {
    where.trainerId = actor.trainer?.id || '__no_trainer_profile__';
  } else if (actor.role === UserRole.CENTRE_ADMIN) {
    where.batch = { campusId: actor.campusId || '__no_campus__' };
  } else if (actor.role === UserRole.TRAINEE) {
    where.batch = { enrollments: { some: { traineeId: actor.trainee?.id || '__no_trainee_profile__', status: 'ACTIVE' } } };
  }

  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) throw new AppError('Invalid session date filter', 400);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    where.date = { gte: start, lt: end };
  }

  return prisma.trainingSession.findMany({
    where,
    include: {
      batch: { select: { id: true, name: true, code: true, campusId: true, _count: { select: { enrollments: true } } } },
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
      module: { select: { id: true, name: true } },
      _count: { select: { attendances: true } },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
};

export const get = async (id: string, actor?: Actor) => {
  const record = await prisma.trainingSession.findUnique({
    where: { id },
    include: {
      batch: { include: { enrollments: { select: { traineeId: true, status: true } } } },
      trainer: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      module: true,
    },
  });
  if (!record) throw new AppError('Session not found', 404);

  if (actor?.role === UserRole.TRAINER && record.trainerId !== actor.trainer?.id) throw new ForbiddenError('You can only access your assigned sessions');
  if (actor?.role === UserRole.CENTRE_ADMIN && record.batch.campusId !== actor.campusId) throw new ForbiddenError('You cannot access sessions outside your campus');
  if (actor?.role === UserRole.TRAINEE && !record.batch.enrollments.some((enrollment) => enrollment.traineeId === actor.trainee?.id && enrollment.status === 'ACTIVE')) {
    throw new ForbiddenError('This session is not part of your active training batches');
  }
  return record;
};

export const create = async (input: any, actor: Actor) => {
  const data = { ...input };
  validateTimes(data);
  if (!data.batchId || !data.date || !data.startTime || !data.endTime) throw new AppError('Batch, date, start time and end time are required', 400);

  const batch = await prisma.trainingBatch.findUnique({ where: { id: data.batchId }, select: { id: true, trainerId: true, electiveId: true, status: true } });
  if (!batch) throw new AppError('Batch not found', 404);
  if (batch.status === 'CANCELLED' || batch.status === 'COMPLETED') throw new AppError('Cannot schedule sessions for a cancelled or completed batch', 400);

  if (actor.role === UserRole.TRAINER) {
    if (!actor.trainer?.id || batch.trainerId !== actor.trainer.id) throw new ForbiddenError('You can only schedule sessions for batches assigned to you');
    data.trainerId = actor.trainer.id;
  } else if (!data.trainerId) {
    throw new AppError('Trainer is required', 400);
  }

  if (data.moduleId) {
    const module = await prisma.module.findUnique({ where: { id: data.moduleId }, select: { electiveId: true } });
    if (!module || module.electiveId !== batch.electiveId) throw new AppError('The selected module does not belong to the batch program', 400);
  }

  data.date = new Date(data.date);
  if (Number.isNaN(data.date.getTime())) throw new AppError('Invalid session date', 400);
  return prisma.trainingSession.create({ data });
};

export const update = async (id: string, input: any, actor: Actor) => {
  const existing = await get(id, actor);
  if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.TRAINER) throw new ForbiddenError('You cannot update sessions');
  const data = { ...input };
  if (actor.role === UserRole.TRAINER) {
    data.trainerId = actor.trainer!.id;
    if (data.batchId && data.batchId !== existing.batchId) {
      const batch = await prisma.trainingBatch.findUnique({ where: { id: data.batchId }, select: { trainerId: true } });
      if (!batch || batch.trainerId !== actor.trainer!.id) throw new ForbiddenError('You can only move a session to a batch assigned to you');
    }
  }
  validateTimes(data);
  if (data.date) {
    data.date = new Date(data.date);
    if (Number.isNaN(data.date.getTime())) throw new AppError('Invalid session date', 400);
  }
  if (data.moduleId && data.batchId) {
    const [module, batch] = await Promise.all([
      prisma.module.findUnique({ where: { id: data.moduleId }, select: { electiveId: true } }),
      prisma.trainingBatch.findUnique({ where: { id: data.batchId }, select: { electiveId: true } }),
    ]);
    if (!module || !batch || module.electiveId !== batch.electiveId) throw new AppError('The selected module does not belong to the batch program', 400);
  }
  return prisma.trainingSession.update({ where: { id }, data });
};

// Cancelling a session preserves its attendance history and audit trail.
export const remove = async (id: string, actor: Actor) => {
  await get(id, actor);
  if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.TRAINER) throw new ForbiddenError('You cannot cancel sessions');
  return prisma.trainingSession.update({ where: { id }, data: { status: 'CANCELLED', remarks: 'Cancelled by user' } });
};
