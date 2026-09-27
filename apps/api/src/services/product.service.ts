import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { ProductStatus } from '@prisma/client';

export const list = async (query: any) => {
  const { traineeId, batchId, status } = query;
  const where: any = {};
  if (traineeId) where.traineeId = traineeId;
  if (batchId) where.batchId = batchId;
  if (status) where.status = status;

  return prisma.product.findMany({
    where,
    include: {
      trainee: { include: { user: { select: { firstName: true, lastName: true } } } },
      productSkills: { include: { skill: { select: { name: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const get = async (id: string) => {
  const record = await prisma.product.findUnique({
    where: { id },
    include: {
      productSkills: { include: { skill: true } },
      productReviews: { include: { trainer: { include: { user: true } } } },
      statusHistory: { orderBy: { createdAt: 'desc' } }
    }
  });
  if (!record) throw new AppError('Product not found', 404);
  return record;
};

export const create = async (data: any) => {
  const { skillIds, traineeId, ...productData } = data;

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: { ...productData, traineeId, status: 'IDEA' }
    });

    if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
      await tx.productSkill.createMany({
        data: skillIds.map((skillId: string) => ({ productId: product.id, skillId }))
      });
    }

    await tx.productStatusHistory.create({
      data: {
        productId: product.id,
        toStatus: 'IDEA',
        remarks: 'Product created'
      }
    });

    return product;
  });
};

export const update = async (id: string, data: any, userId: string) => {
  const { skillIds, status, ...productData } = data;
  const product = await get(id);

  return prisma.$transaction(async (tx) => {
    if (status && status !== product.status) {
      await tx.productStatusHistory.create({
        data: {
          productId: id,
          fromStatus: product.status as ProductStatus,
          toStatus: status as ProductStatus,
          changedBy: userId
        }
      });
      productData.status = status;
    }

    const updated = await tx.product.update({ where: { id }, data: productData });

    if (skillIds && Array.isArray(skillIds)) {
      await tx.productSkill.deleteMany({ where: { productId: id } });
      if (skillIds.length > 0) {
        await tx.productSkill.createMany({
          data: skillIds.map((skillId: string) => ({ productId: id, skillId }))
        });
      }
    }

    return tx.product.findUnique({ where: { id }, include: { productSkills: true } });
  });
};

export const remove = async (id: string) => {
  await get(id);
  return prisma.product.delete({ where: { id } });
};

export const reviewProduct = async (id: string, data: any, trainerId: string, userId: string) => {
  const { status, criteria, overallScore, maxScore, feedback, recommendation } = data;
  const product = await get(id);

  return prisma.$transaction(async (tx) => {
    const review = await tx.productReview.create({
      data: {
        productId: id,
        trainerId,
        criteria,
        overallScore,
        maxScore,
        feedback,
        recommendation
      }
    });

    if (status && status !== product.status) {
      await tx.productStatusHistory.create({
        data: {
          productId: id,
          fromStatus: product.status as ProductStatus,
          toStatus: status as ProductStatus,
          changedBy: userId,
          remarks: 'Status updated via review'
        }
      });
      await tx.product.update({ where: { id }, data: { status } });
    }

    return review;
  });
};
