import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export const list = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    campusId,
    enrollmentStatus,
    search,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (campusId) {
    where.campusId = campusId;
  }

  if (enrollmentStatus) {
    where.enrollmentStatus = enrollmentStatus;
  }

  if (search) {
    where.OR = [
      {
        studentId: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        user: {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
      {
        user: {
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
      {
        user: {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    ];
  }

  const [total, trainees] = await Promise.all([
    prisma.trainee.count({
      where,
    }),

    prisma.trainee.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
        campus: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    trainees,
  };
};

export const getProfile = async (id: string) => {
  const trainee = await prisma.trainee.findUnique({
    where: { id },
    include: {
      user: true,
      campus: true,
      enrollments: {
        include: {
          batch: {
            include: {
              elective: true,
            },
          },
        },
      },
      traineeSkills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!trainee) {
    throw new AppError('Trainee not found', 404);
  }

  return trainee;
};

export const create = async (data: any) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    campusId,
    studentId,
    gender,
    dateOfBirth,
  } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const existingTrainee = await prisma.trainee.findUnique({
    where: { studentId },
  });

  if (existingTrainee) {
    throw new AppError('Student ID already in use', 400);
  }

  if (!password) {
    throw new AppError('Password is required', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const username = studentId;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        username,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: UserRole.TRAINEE,
        campusId,
      },
    });

    const trainee = await tx.trainee.create({
      data: {
        userId: user.id,
        studentId,
        campusId,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    return trainee;
  });
};

export const update = async (id: string, data: any) => {
  const trainee = await prisma.trainee.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  if (!trainee) {
    throw new AppError('Trainee not found', 404);
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    ...traineeData
  } = data;

  return prisma.$transaction(async (tx) => {
    await tx.trainee.update({
      where: { id },
      data: traineeData,
    });

    if (
      firstName !== undefined ||
      lastName !== undefined ||
      email !== undefined ||
      phone !== undefined
    ) {
      await tx.user.update({
        where: { id: trainee.userId },
        data: {
          firstName,
          lastName,
          email,
          phone,
        },
      });
    }

    return tx.trainee.findUnique({
      where: { id },
      include: {
        user: true,
        campus: true,
      },
    });
  });
};

export const getSkills = async (id: string) => {
  return prisma.traineeSkill.findMany({
    where: {
      traineeId: id,
    },
    include: {
      skill: true,
    },
  });
};

export const getAttendanceSummary = async (id: string) => {
  const attendance = await prisma.attendance.findMany({
    where: {
      traineeId: id,
    },
    include: {
      session: true,
    },
    orderBy: {
      markedAt: 'desc',
    },
  });

  const total = attendance.length;

  const present = attendance.filter(
    (item) =>
      item.status === 'PRESENT' ||
      item.status === 'LATE'
  ).length;

  const absent = attendance.filter(
    (item) => item.status === 'ABSENT'
  ).length;

  const attendancePercentage =
    total > 0
      ? Math.round((present / total) * 100)
      : 0;

  return {
    total,
    present,
    absent,
    attendancePercentage,
    attendance,
  };
};

export const getProducts = async (id: string) => {
  return prisma.product.findMany({
    where: {
      traineeId: id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getCertificates = async (id: string) => {
  return prisma.certificate.findMany({
    where: {
      traineeId: id,
    },
  });
};

export const getSkillPassport = async (id: string) => {
  return prisma.traineeSkill.findMany({
    where: {
      traineeId: id,
    },
    include: {
      skill: {
        include: {
          category: true,
        },
      },
    },
  });
};

export const remove = async (id: string) => {
  const trainee = await prisma.trainee.findUnique({
    where: { id },
  });

  if (!trainee) {
    throw new AppError(
      'Trainee not found',
      404
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.trainee.delete({
      where: { id },
    });

    await tx.user.delete({
      where: { id: trainee.userId },
    });

    return true;
  });
};