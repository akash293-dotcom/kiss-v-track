import { prisma } from '../lib/prisma';
import { AppError, ForbiddenError } from '../lib/errors';
import { ProductStatus, UserRole } from '@prisma/client';

const parseOptionalProductDate = (value: unknown): Date | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError('Invalid product production date', 400);
  }
  return parsed;
};

type Actor = {
  id: string;
  role: UserRole;
  campusId?: string | null;
  trainee?: { id: string } | null;
  trainer?: { id: string } | null;
};

const assertProductAccess = (product: any, actor: Actor, allowTraineeEdit = false) => {
  if (actor.role === UserRole.ADMIN) return;
  if (actor.role === UserRole.CENTRE_ADMIN && actor.campusId && product.trainee?.campusId === actor.campusId) return;
  if (actor.role === UserRole.TRAINER && product.batch?.trainerId === actor.trainer?.id) return;
  if (actor.role === UserRole.TRAINEE && product.traineeId === actor.trainee?.id && allowTraineeEdit) return;
  if (actor.role === UserRole.TRAINEE && product.traineeId === actor.trainee?.id && !allowTraineeEdit) return;
  throw new ForbiddenError('You do not have access to this product');
};

export const list = async (query: any, actor: Actor) => {
  const { traineeId, batchId, status } = query;
  const where: any = {};
  if (traineeId) where.traineeId = traineeId;
  if (batchId) where.batchId = batchId;
  if (status) where.status = status;

  if (actor.role === UserRole.TRAINEE) {
    where.traineeId = actor.trainee?.id || '__no_trainee_profile__';
  } else if (actor.role === UserRole.CENTRE_ADMIN) {
    where.trainee = { campusId: actor.campusId || '__no_campus__' };
  } else if (actor.role === UserRole.TRAINER) {
    where.batch = { trainerId: actor.trainer?.id || '__no_trainer_profile__' };
  }

  return prisma.product.findMany({
    where,
    include: {
      trainee: { include: { user: { select: { firstName: true, lastName: true } } } },
      productSkills: { include: { skill: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const get = async (id: string, actor?: Actor) => {
  const record = await prisma.product.findUnique({
    where: { id },
    include: {
      trainee: { select: { id: true, campusId: true, user: { select: { firstName: true, lastName: true } } } },
      batch: { select: { id: true, trainerId: true, name: true } },
      productSkills: { include: { skill: true } },
      productReviews: { include: { trainer: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!record) throw new AppError('Product not found', 404);
  if (actor) assertProductAccess(record, actor);
  return record;
};

export const create = async (data: any) => {
  const { skillIds, traineeId, ...productData } = data;
  if (!traineeId || !productData.name?.trim()) throw new AppError('Product name is required', 400);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: { ...productData, productionDate: parseOptionalProductDate(productData.productionDate), traineeId, status: 'IDEA' },
    });

    if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
      await tx.productSkill.createMany({
        data: [...new Set(skillIds)].map((skillId: string) => ({ productId: product.id, skillId })),
      });
    }

    await tx.productStatusHistory.create({
      data: { productId: product.id, toStatus: 'IDEA', remarks: 'Product created' },
    });

    return product;
  });
};

export const update = async (id: string, data: any, actor: Actor) => {
  const product = await get(id, actor);
  if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.CENTRE_ADMIN && !(actor.role === UserRole.TRAINEE && product.traineeId === actor.trainee?.id)) {
    throw new ForbiddenError('Only the product owner or an administrator can edit this product');
  }

  const { skillIds, status, traineeId: _ignoredTraineeId, batchId: _ignoredBatchId, ...productData } = data;
  if (Object.prototype.hasOwnProperty.call(productData, 'productionDate')) {
    productData.productionDate = parseOptionalProductDate(productData.productionDate);
  }
  return prisma.$transaction(async (tx) => {
    if (status && status !== product.status) {
      const allowed: Record<string, string[]> = {
        IDEA: ['DESIGN'],
        DESIGN: ['IN_PROGRESS', 'IDEA'],
        IN_PROGRESS: ['SUBMITTED', 'DESIGN'],
        SUBMITTED: ['UNDER_REVIEW'],
        UNDER_REVIEW: ['APPROVED', 'REVISION_REQUIRED'],
        REVISION_REQUIRED: ['IN_PROGRESS', 'SUBMITTED'],
        APPROVED: ['COMPLETED'],
        COMPLETED: [],
      };
      if (!allowed[product.status]?.includes(status)) throw new AppError('Invalid product status transition', 400);
      await tx.productStatusHistory.create({
        data: { productId: id, fromStatus: product.status as ProductStatus, toStatus: status as ProductStatus, changedBy: actor.id },
      });
      productData.status = status;
    }

    const updated = await tx.product.update({ where: { id }, data: productData });
    if (skillIds && Array.isArray(skillIds)) {
      await tx.productSkill.deleteMany({ where: { productId: id } });
      if (skillIds.length > 0) await tx.productSkill.createMany({
        data: [...new Set(skillIds)].map((skillId: string) => ({ productId: id, skillId })),
      });
    }
    return tx.product.findUnique({ where: { id }, include: { productSkills: { include: { skill: true } } } });
  });
};

export const remove = async (id: string, actor: Actor) => {
  const product = await get(id, actor);
  if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.CENTRE_ADMIN && !(actor.role === UserRole.TRAINEE && product.traineeId === actor.trainee?.id)) {
    throw new ForbiddenError('Only the product owner or an administrator can delete this product');
  }
  return prisma.product.delete({ where: { id } });
};

export const reviewProduct = async (id: string, data: any, trainerId: string, userId: string) => {
  const product = await get(id);
  const assignedBatch = product.batchId
    ? await prisma.trainingBatch.findFirst({ where: { id: product.batchId, trainerId }, select: { id: true } })
    : await prisma.trainingBatch.findFirst({
        where: { trainerId, enrollments: { some: { traineeId: product.traineeId, status: 'ACTIVE' } } },
        select: { id: true },
      });
  if (!assignedBatch) throw new ForbiddenError('You can only review products from trainees in your assigned batches');

  const { status, criteria, overallScore, maxScore, feedback, recommendation } = data;
  return prisma.$transaction(async (tx) => {
    const review = await tx.productReview.create({
      data: { productId: id, trainerId, criteria: typeof criteria === 'string' ? criteria : criteria ? JSON.stringify(criteria) : undefined, overallScore, maxScore, feedback, recommendation },
    });

    if (status && status !== product.status) {
      const allowed: Record<string, string[]> = {
        SUBMITTED: ['UNDER_REVIEW'],
        UNDER_REVIEW: ['APPROVED', 'REVISION_REQUIRED'],
        REVISION_REQUIRED: ['IN_PROGRESS', 'SUBMITTED'],
        APPROVED: ['COMPLETED'],
      };
      if (!allowed[product.status]?.includes(status)) throw new AppError('Invalid product status transition', 400);
      await tx.productStatusHistory.create({
        data: { productId: id, fromStatus: product.status as ProductStatus, toStatus: status as ProductStatus, changedBy: userId, remarks: 'Status updated via review' },
      });
      await tx.product.update({ where: { id }, data: { status } });
    }
    return review;
  });
};
