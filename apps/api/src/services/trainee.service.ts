import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export const list = async (query: any) => {
  const { page = 1, limit = 10, campusId, enrollmentStatus, search } = query;
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  if (campusId) where.campusId = campusId;
  if (enrollmentStatus) where.enrollmentStatus = enrollmentStatus;
  if (search) {
    where.OR = [
      { studentId: { contains: search, mode: 'insensitive' } },
      { user: { firstName: { contains: search, mode: 'insensitive' } } },
      { user: { lastName: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, trainees] = await Promise.all([
    prisma.trainee.count({ where }),
    prisma.trainee.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        campus: { select: { name: true } }
      }
    })
  ]);

  return { total, page: Number(page), limit: Number(limit), trainees };
};

export const getProfile = async (id: string) => {
  const trainee = await prisma.trainee.findUnique({
    where: { id },
    include: {
      user: true,
      campus: true,
      enrollments: { include: { batch: { include: { elective: true } } } },
      traineeSkills: { include: { skill: true } }
    }
  });
  if (!trainee) throw new AppError('Trainee not found', 404);
  return trainee;
};

export const create = async (data: any) => {
  const { email, password, firstName, lastName, phone, campusId, studentId, gender, dateOfBirth } = data;
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('Email already in use', 400);

  const passwordHash = await bcrypt.hash(password, 10);
  
  const username = studentId;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email, username, passwordHash, firstName, lastName, phone, role: UserRole.TRAINEE, campusId
      }
    });

    const trainee = await tx.trainee.create({
      data: {
        userId: user.id,
        studentId,
        campusId,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
      }
    });

    return trainee;
  });
};

export const update = async (id: string, data: any) => {
  const trainee = await prisma.trainee.findUnique({ where: { id } });
  if (!trainee) throw new AppError('Trainee not found', 404);

  return prisma.trainee.update({
    where: { id },
    data
  });
};

export const getSkills = async (id: string) => {
  return prisma.traineeSkill.findMany({
    where: { traineeId: id },
    include: { skill: { include: { category: true } } }
  });
};

export const getAttendanceSummary = async (id: string) => {
  const attendances = await prisma.attendance.findMany({ where: { traineeId: id } });
  const total = attendances.length;
  const present = attendances.filter(a => a.status === 'PRESENT').length;
  const late = attendances.filter(a => a.status === 'LATE').length;
  const absent = attendances.filter(a => a.status === 'ABSENT').length;
  const excused = attendances.filter(a => a.status === 'EXCUSED').length;

  const attendancePct = total > 0 ? (present / total) * 100 : 0;
  
  return { total, present, late, absent, excused, attendancePct };
};

export const getProducts = async (id: string) => {
  return prisma.product.findMany({ where: { traineeId: id } });
};

export const getCertificates = async (id: string) => {
  return prisma.certificate.findMany({ where: { traineeId: id } });
};

export const getSkillPassport = async (id: string) => {
  const profile = await getProfile(id);
  const skills = await getSkills(id);
  const products = await getProducts(id);
  const certificates = await getCertificates(id);
  
  return { profile, skills, products, certificates };
};
