import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const getTraineeReport = async (id: string) => {
  const trainee = await prisma.trainee.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      campus: { select: { name: true, city: true, state: true } },
    },
  });
  if (!trainee) throw new AppError('Trainee not found', 404);

  const [skills, attendances] = await Promise.all([
    prisma.traineeSkill.findMany({
      where: { traineeId: id },
      include: { skill: { include: { category: true } } },
    }),
    prisma.attendance.findMany({
      where: { traineeId: id },
      include: { session: { select: { date: true, topic: true, durationMin: true } } },
      orderBy: { markedAt: 'desc' },
    }),
  ]);

  const present = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendancePct = attendances.length > 0 ? (present / attendances.length) * 100 : 0;
  return {
    trainee,
    attendance: { total: attendances.length, present, absent: attendances.filter((a) => a.status === 'ABSENT').length, percentage: attendancePct, records: attendances },
    skills: {
      total: skills.length,
      verified: skills.filter((s) => s.status === 'VERIFIED').length,
      details: skills,
    },
  };
};

export const getBatchReport = async (id: string) => {
  const batch = await prisma.trainingBatch.findUnique({
    where: { id },
    include: {
      elective: true,
      campus: { select: { id: true, name: true } },
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!batch) throw new AppError('Batch not found', 404);

  const [enrollments, sessions] = await Promise.all([
    prisma.enrollment.findMany({
      where: { batchId: id, status: 'ACTIVE' },
      include: {
        trainee: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    }),
    prisma.trainingSession.findMany({
      where: { batchId: id },
      include: { attendances: true },
    }),
  ]);

  const totalScheduledHours = sessions.reduce((acc, session) => acc + session.durationMin / 60, 0);
  const attendanceRecords = sessions.flatMap((session) => session.attendances);
  const attended = attendanceRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;

  return {
    batch,
    enrollmentsCount: enrollments.length,
    sessionsCount: sessions.length,
    totalScheduledHours,
    attendancePercentage: attendanceRecords.length > 0 ? (attended / attendanceRecords.length) * 100 : 0,
    trainees: enrollments.map((enrollment) => enrollment.trainee),
  };
};

export const getInstitutionalReport = async (campusId?: string) => {
  const traineeWhere = campusId ? { campusId } : {};
  const batchWhere = campusId ? { campusId } : {};
  const certificateWhere = campusId ? { trainee: { campusId } } : {};

  const [totalTrainees, totalTrainers, totalBatches, totalCertificates, activeBatches, completedSessions, attendanceCount] = await Promise.all([
    prisma.trainee.count({ where: traineeWhere }),
    prisma.trainer.count({ where: traineeWhere }),
    prisma.trainingBatch.count({ where: batchWhere }),
    prisma.certificate.count({ where: certificateWhere }),
    prisma.trainingBatch.count({ where: { ...batchWhere, status: 'ACTIVE' } }),
    prisma.trainingSession.count({ where: { ...(campusId ? { batch: { campusId } } : {}), status: 'COMPLETED' } }),
    prisma.attendance.count({ where: campusId ? { session: { batch: { campusId } } } : {} }),
  ]);

  return {
    summary: { totalTrainees, totalTrainers, totalBatches, totalCertificates, activeBatches, completedSessions, attendanceRecords: attendanceCount },
    campusId: campusId || null,
    generatedAt: new Date(),
  };
};
