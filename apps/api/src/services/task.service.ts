import { prisma } from '../lib/prisma';
import { AppError, ForbiddenError } from '../lib/errors';
import { TaskStatus, SubmissionStatus, UserRole } from '@prisma/client';

type Actor = {
  id: string;
  role: UserRole;
  trainee?: { id: string } | null;
  trainer?: { id: string } | null;
};

export const list = async (query: any, actor: Actor) => {
  const { trainerId, batchId, status } = query;
  const where: any = {};
  if (batchId) where.batchId = batchId;
  if (status) where.status = status;

  if (actor.role === UserRole.TRAINER) {
    where.trainerId = actor.trainer?.id || '__no_trainer_profile__';
  } else if (actor.role === UserRole.TRAINEE) {
    const traineeId = actor.trainee?.id;
    if (!traineeId) return [];
    const enrollments = await prisma.enrollment.findMany({
      where: { traineeId, status: 'ACTIVE' },
      select: { batchId: true },
    });
    where.OR = [
      { batchId: null },
      { batchId: { in: enrollments.map((item) => item.batchId) } },
    ];
    where.status = { in: [TaskStatus.PUBLISHED, TaskStatus.ACTIVE, TaskStatus.CLOSED] };
  } else if (actor.role === UserRole.CENTRE_ADMIN) {
    where.trainer = { campusId: actor.campusId || '__no_campus__' };
  }

  return prisma.practicalTask.findMany({
    where,
    include: {
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const get = async (id: string, actor?: Actor) => {
  const record = await prisma.practicalTask.findUnique({
    where: { id },
    include: {
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
      submissions: { include: { trainee: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } } },
    },
  });
  if (!record) throw new AppError('Task not found', 404);

  if (actor?.role === UserRole.TRAINER && record.trainerId !== actor.trainer?.id) {
    throw new ForbiddenError('You can only access tasks assigned to you');
  }
  if (actor?.role === UserRole.TRAINEE) {
    const traineeId = actor.trainee?.id;
    if (!traineeId) throw new ForbiddenError('Trainee profile not found');
    if (record.batchId) {
      const enrollment = await prisma.enrollment.findFirst({ where: { traineeId, batchId: record.batchId, status: 'ACTIVE' } });
      if (!enrollment) throw new ForbiddenError('This task is not assigned to your batch');
    }
    record.submissions = record.submissions.filter((submission) => submission.traineeId === traineeId);
  }
  if (actor?.role === UserRole.CENTRE_ADMIN && record.trainer.campusId !== actor.campusId) {
    throw new ForbiddenError('You cannot access tasks outside your campus');
  }
  return record;
};

export const create = async (data: any) => {
  if (!data.title?.trim()) throw new AppError('Task title is required', 400);
  return prisma.practicalTask.create({ data });
};

export const update = async (id: string, data: any, trainerId: string) => {
  const task = await prisma.practicalTask.findUnique({ where: { id } });
  if (!task) throw new AppError('Task not found', 404);
  if (task.trainerId !== trainerId) throw new ForbiddenError('You can only update your own tasks');
  const { trainerId: _ignored, ...safeData } = data;
  return prisma.practicalTask.update({ where: { id }, data: safeData });
};

export const remove = async (id: string, trainerId: string) => {
  const task = await prisma.practicalTask.findUnique({ where: { id } });
  if (!task) throw new AppError('Task not found', 404);
  if (task.trainerId !== trainerId) throw new ForbiddenError('You can only delete your own tasks');
  return prisma.practicalTask.delete({ where: { id } });
};

export const submitTask = async (taskId: string, data: any) => {
  const { traineeId, description, fileUrls } = data;
  const task = await prisma.practicalTask.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found', 404);
  if (![TaskStatus.PUBLISHED, TaskStatus.ACTIVE].includes(task.status)) throw new AppError('This task is not accepting submissions', 400);
  if (task.deadline && task.deadline < new Date()) throw new AppError('The submission deadline has passed', 400);

  if (task.batchId) {
    const enrollment = await prisma.enrollment.findFirst({ where: { batchId: task.batchId, traineeId, status: 'ACTIVE' } });
    if (!enrollment) throw new ForbiddenError('You are not actively enrolled in the batch assigned to this task');
  }

  const existing = await prisma.practicalSubmission.findUnique({
    where: { taskId_traineeId: { taskId, traineeId } },
  });
  if (existing) {
    if (existing.status === SubmissionStatus.APPROVED) throw new AppError('An approved submission cannot be replaced', 400);
    return prisma.practicalSubmission.update({
      where: { id: existing.id },
      data: { description, fileUrls, status: SubmissionStatus.SUBMITTED, submittedAt: new Date(), feedback: null, score: null, reviewedAt: null },
    });
  }

  return prisma.practicalSubmission.create({
    data: { taskId, traineeId, description, fileUrls, status: SubmissionStatus.SUBMITTED },
  });
};

export const reviewSubmission = async (submissionId: string, data: any, trainerId: string) => {
  const submission = await prisma.practicalSubmission.findUnique({
    where: { id: submissionId },
    include: { task: { select: { trainerId: true } } },
  });
  if (!submission) throw new AppError('Submission not found', 404);
  if (submission.task.trainerId !== trainerId) throw new ForbiddenError('You can only review submissions for your own tasks');

  const { status, feedback, score, maxScore } = data;
  if (!Object.values(SubmissionStatus).includes(status)) throw new AppError('Invalid submission status', 400);
  if (score != null && (Number(score) < 0 || Number(score) > Number(maxScore ?? 100))) {
    throw new AppError('Score must be between zero and the maximum score', 400);
  }

  return prisma.practicalSubmission.update({
    where: { id: submissionId },
    data: { status, feedback, score, maxScore, reviewedAt: new Date() },
  });
};
