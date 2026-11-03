import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export const list = async (query: any) => {
  const { page = 1, limit = 10, campusId, search } = query;
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (safePage - 1) * safeLimit;

  const where: any = {};
  if (campusId) where.campusId = campusId;
  if (search) {
    where.OR = [
      { employeeId: { contains: String(search), mode: 'insensitive' } },
      { user: { firstName: { contains: String(search), mode: 'insensitive' } } },
      { user: { lastName: { contains: String(search), mode: 'insensitive' } } },
    ];
  }

  const [total, trainers] = await Promise.all([
    prisma.trainer.count({ where }),
    prisma.trainer.findMany({
      where,
      skip,
      take: safeLimit,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, isActive: true } },
        campus: { select: { name: true } },
        trainerCategories: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { total, page: safePage, limit: safeLimit, trainers };
};

export const getProfile = async (id: string) => {
  const trainer = await prisma.trainer.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          profilePhoto: true,
          campusId: true,
          isActive: true,
        },
      },
      campus: true,
      trainerCategories: { include: { category: true } },
    },
  });
  if (!trainer) throw new AppError('Trainer not found', 404);
  return trainer;
};

export const create = async (data: any) => {
  const { email, password, firstName, lastName, phone, campusId, employeeId, qualification, specialization, experience } = data;
  if (!email || !password || !employeeId || !campusId) {
    throw new AppError('Email, password, employee ID and campus are required', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('Email already in use', 400);
  const existingTrainer = await prisma.trainer.findUnique({ where: { employeeId } });
  if (existingTrainer) throw new AppError('Employee ID already in use', 400);

  const passwordHash = await bcrypt.hash(password, 10);
  const username = employeeId;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        username,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: UserRole.TRAINER,
        campusId,
      },
    });

    const trainer = await tx.trainer.create({
      data: {
        userId: user.id,
        employeeId,
        campusId,
        qualification,
        specialization,
        experience: experience === undefined || experience === null || experience === '' ? null : String(experience),
      },
    });

    return trainer;
  });
};

export const update = async (id: string, data: any) => {
  const trainer = await prisma.trainer.findUnique({ where: { id } });
  if (!trainer) throw new AppError('Trainer not found', 404);

  const { isActive, experience, ...trainerData } = data;
  const updateData: any = { ...trainerData };
  if (experience !== undefined) {
    updateData.experience = experience === null || experience === '' ? null : String(experience);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.trainer.update({ where: { id }, data: updateData });
    if (isActive !== undefined) {
      await tx.user.update({
        where: { id: trainer.userId },
        data: { isActive: Boolean(isActive) },
      });
      return tx.trainer.update({
        where: { id },
        data: { isActive: Boolean(isActive) },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true, isActive: true } },
          campus: { select: { name: true } },
        },
      });
    }
    return updated;
  });
};

// Preserve training history and foreign-key relationships by deactivating
// both the trainer record and its login account instead of hard deleting them.
export const remove = async (id: string) => {
  const trainer = await prisma.trainer.findUnique({ where: { id } });
  if (!trainer) throw new AppError('Trainer not found', 404);

  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: trainer.userId }, data: { isActive: false } });
    return tx.trainer.update({ where: { id }, data: { isActive: false } });
  });
};

export const getBatches = async (id: string) => {
  return prisma.trainingBatch.findMany({
    where: { trainerId: id },
    include: { elective: true, campus: true },
  });
};
