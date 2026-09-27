import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export const list = async (query: any) => {
  const { page = 1, limit = 10, campusId, search } = query;
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  if (campusId) where.campusId = campusId;
  if (search) {
    where.OR = [
      { employeeId: { contains: search, mode: 'insensitive' } },
      { user: { firstName: { contains: search, mode: 'insensitive' } } },
      { user: { lastName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, trainers] = await Promise.all([
    prisma.trainer.count({ where }),
    prisma.trainer.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        campus: { select: { name: true } },
        trainerCategories: { include: { category: true } }
      }
    })
  ]);

  return { total, page: Number(page), limit: Number(limit), trainers };
};

export const getProfile = async (id: string) => {
  const trainer = await prisma.trainer.findUnique({
    where: { id },
    include: {
      user: true,
      campus: true,
      trainerCategories: { include: { category: true } }
    }
  });
  if (!trainer) throw new AppError('Trainer not found', 404);
  return trainer;
};

export const create = async (data: any) => {
  const { email, password, firstName, lastName, phone, campusId, employeeId, qualification, specialization, experience } = data;
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('Email already in use', 400);

  const passwordHash = await bcrypt.hash(password, 10);
  const username = employeeId;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email, username, passwordHash, firstName, lastName, phone, role: UserRole.TRAINER, campusId
      }
    });

    const trainer = await tx.trainer.create({
      data: {
        userId: user.id,
        employeeId,
        campusId,
        qualification,
        specialization,
        experience
      }
    });

    return trainer;
  });
};

export const update = async (id: string, data: any) => {
  const trainer = await prisma.trainer.findUnique({ where: { id } });
  if (!trainer) throw new AppError('Trainer not found', 404);

  return prisma.trainer.update({
    where: { id },
    data
  });
};

export const getBatches = async (id: string) => {
  return prisma.trainingBatch.findMany({
    where: { trainerId: id },
    include: { elective: true, campus: true }
  });
};
