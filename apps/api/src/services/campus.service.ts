import prisma from '../lib/prisma';
import { NotFoundError } from '../lib/errors';
import { createAuditLog } from '../middleware/audit';
import { Request } from 'express';

export const listCampuses = async ({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}) => {
  const where = {
    isActive: true,
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              code: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.campus.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),

    prisma.campus.count({
      where,
    }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCampus = async (id: string) => {
  const campus = await prisma.campus.findUnique({
    where: {
      id,
      isActive: true,
    },
  });

  if (!campus) {
    throw new NotFoundError('Campus not found');
  }

  return campus;
};

export const createCampus = async (
  data: any,
  userId: string,
  req: Request
) => {
  const campus = await prisma.campus.create({
    data,
  });

  await createAuditLog(
    userId,
    'CREATE',
    'Campus',
    campus.id,
    null,
    campus,
    req
  );

  return campus;
};

export const updateCampus = async (
  id: string,
  data: any,
  userId: string,
  req: Request
) => {
  const existing = await prisma.campus.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Campus not found');
  }

  const campus = await prisma.campus.update({
    where: { id },
    data,
  });

  await createAuditLog(
    userId,
    'UPDATE',
    'Campus',
    id,
    existing,
    campus,
    req
  );

  return campus;
};

export const deleteCampus = async (
  id: string,
  userId: string,
  req: Request
) => {
  const existing = await prisma.campus.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Campus not found');
  }

  await prisma.campus.update({
    where: { id },
    data: { isActive: false },
  });

  await createAuditLog(
    userId,
    'DEACTIVATE',
    'Campus',
    id,
    existing,
    null,
    req
  );

  return existing;
};