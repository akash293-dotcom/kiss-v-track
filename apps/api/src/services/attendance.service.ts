import { AttendanceStatus, UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError, ForbiddenError } from '../lib/errors';

const validStatuses = new Set<string>(Object.values(AttendanceStatus));

const normalizeDay = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(`Invalid date: ${value}`, 400);
  }
  return date;
};

const getDayRange = (from?: string, to?: string) => {
  const start = normalizeDay(from);
  const end = normalizeDay(to);

  if (!start && !end) return undefined;

  if (start && end && start > end) {
    throw new AppError('From date cannot be after To date', 400);
  }

  const range: { gte?: Date; lt?: Date } = {};
  if (start) range.gte = start;
  if (end) {
    const nextDay = new Date(end);
    nextDay.setDate(nextDay.getDate() + 1);
    range.lt = nextDay;
  }
  return range;
};

export const listSessions = async (query: any, user: { id: string; role: UserRole; campusId?: string | null }) => {
  const { batchId, from, to, search } = query;
  const where: any = {};

  if (batchId) where.batchId = batchId;

  const dateRange = getDayRange(from, to);
  if (dateRange) where.date = dateRange;

  if (search) {
    where.OR = [
      { topic: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } },
      { batch: { name: { contains: String(search), mode: 'insensitive' } } },
      { batch: { code: { contains: String(search), mode: 'insensitive' } } },
    ];
  }

  if (user.role === UserRole.TRAINER) {
    where.trainer = { userId: user.id };
  } else if (user.role === UserRole.CENTRE_ADMIN) {
    if (!user.campusId) return [];
    where.batch = { ...(where.batch || {}), campusId: user.campusId };
  } else if (user.role === UserRole.TRAINEE) {
    where.batch = {
      ...(where.batch || {}),
      enrollments: { some: { trainee: { userId: user.id } } },
    };
  }

  return prisma.trainingSession.findMany({
    where,
    include: {
      batch: {
        select: {
          id: true,
          name: true,
          code: true,
          campusId: true,
          _count: { select: { enrollments: true } },
        },
      },
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
      module: { select: { id: true, name: true } },
      _count: { select: { attendances: true } },
    },
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
  });
};

type AttendanceActor = {
  id: string;
  role: UserRole;
  campusId?: string | null;
  trainer?: { id: string } | null;
  trainee?: { id: string } | null;
};

const assertSessionAccess = async (session: any, actor: AttendanceActor) => {
  if (actor.role === UserRole.ADMIN) return;
  if (actor.role === UserRole.CENTRE_ADMIN && session.batch.campusId === actor.campusId) return;
  if (actor.role === UserRole.TRAINER && session.trainerId === actor.trainer?.id) return;
  if (actor.role === UserRole.TRAINEE && actor.trainee?.id) {
    const enrolled = await prisma.enrollment.findFirst({
      where: { traineeId: actor.trainee.id, batchId: session.batchId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (enrolled) return;
  }
  throw new ForbiddenError('You do not have access to this session attendance');
};

export const getSessionAttendance = async (sessionId: string, actor: AttendanceActor) => {
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: {
      batch: { select: { id: true, name: true, code: true, campusId: true } },
      trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
      module: { select: { id: true, name: true } },
    },
  });

  if (!session) throw new AppError('Session not found', 404);
  await assertSessionAccess(session, actor);

  const [enrollments, attendances] = await Promise.all([
    prisma.enrollment.findMany({
      where: { batchId: session.batchId, status: 'ACTIVE' },
      include: {
        trainee: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
            campus: { select: { name: true } },
          },
        },
      },
      orderBy: { trainee: { studentId: 'asc' } },
    }),
    prisma.attendance.findMany({
      where: { sessionId },
      include: {
        trainee: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
            campus: { select: { name: true } },
          },
        },
      },
      orderBy: { trainee: { studentId: 'asc' } },
    }),
  ]);

  const attendanceByTrainee = new Map(attendances.map((item) => [item.traineeId, item]));
  const enrolledIds = new Set(enrollments.map((item) => item.traineeId));

  const records = enrollments.map((enrollment) => {
    const attendance = attendanceByTrainee.get(enrollment.traineeId);
    return {
      attendanceId: attendance?.id ?? null,
      traineeId: enrollment.traineeId,
      studentId: enrollment.trainee.studentId,
      trainee: enrollment.trainee,
      status: attendance?.status ?? null,
      remarks: attendance?.remarks ?? '',
      markedAt: attendance?.markedAt ?? null,
      isMarked: Boolean(attendance),
    };
  });

  // Keep historical attendance visible even when a trainee is no longer actively enrolled.
  for (const attendance of attendances) {
    if (!enrolledIds.has(attendance.traineeId)) {
      records.push({
        attendanceId: attendance.id,
        traineeId: attendance.traineeId,
        studentId: attendance.trainee.studentId,
        trainee: attendance.trainee,
        status: attendance.status,
        remarks: attendance.remarks ?? '',
        markedAt: attendance.markedAt,
        isMarked: true,
      });
    }
  }

  const counts = records.reduce(
    (acc, item) => {
      if (item.status) acc[item.status] += 1;
      else acc.PENDING += 1;
      return acc;
    },
    { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, PENDING: 0 } as Record<string, number>,
  );

  return {
    session,
    records,
    summary: {
      total: records.length,
      ...counts,
      marked: records.length - counts.PENDING,
      attendancePct: records.length > 0 ? ((counts.PRESENT + counts.LATE) / records.length) * 100 : 0,
    },
  };
};

export const markBulk = async (
  sessionId: string,
  records: { traineeId: string; status: AttendanceStatus; remarks?: string }[],
  markedById: string,
  actor: AttendanceActor,
) => {
  if (!sessionId || !Array.isArray(records) || records.length === 0) {
    throw new AppError('sessionId and at least one attendance record are required', 400);
  }

  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: { id: true, trainerId: true, batchId: true },
  });

  if (!session) throw new AppError('Session not found', 404);

  const uniqueRecords = new Map<string, { traineeId: string; status: AttendanceStatus; remarks?: string }>();
  for (const record of records) {
    if (!record?.traineeId || !validStatuses.has(record.status)) {
      throw new AppError('Every attendance record must contain a valid traineeId and status', 400);
    }
    uniqueRecords.set(record.traineeId, record);
  }

  const traineeIds = [...uniqueRecords.keys()];
  const enrollments = await prisma.enrollment.findMany({
    where: {
      batchId: session.batchId,
      traineeId: { in: traineeIds },
      status: 'ACTIVE',
    },
    select: { traineeId: true },
  });

  const allowedIds = new Set(enrollments.map((item) => item.traineeId));
  const invalidIds = traineeIds.filter((id) => !allowedIds.has(id));
  if (invalidIds.length > 0) {
    throw new AppError('Attendance can only be marked for trainees actively enrolled in this session batch', 400);
  }

  let markerTrainerId: string | undefined;
  if (actor.role === UserRole.TRAINER) {
    if (!actor.trainer?.id || actor.trainer.id !== session.trainerId) {
      throw new ForbiddenError('You can only mark attendance for sessions assigned to you');
    }
    markerTrainerId = actor.trainer.id;
  } else if (actor.role === UserRole.CENTRE_ADMIN) {
    const sessionCampus = await prisma.trainingBatch.findUnique({
      where: { id: session.batchId },
      select: { campusId: true },
    });
    if (!sessionCampus || sessionCampus.campusId !== actor.campusId) {
      throw new ForbiddenError('You can only mark attendance within your campus');
    }
  } else if (actor.role !== UserRole.ADMIN) {
    throw new ForbiddenError('You cannot mark attendance');
  }

  const saved = await prisma.$transaction(async (tx) => {
    const results = [];

    for (const record of uniqueRecords.values()) {
      const result = await tx.attendance.upsert({
        where: { traineeId_sessionId: { traineeId: record.traineeId, sessionId } },
        create: {
          traineeId: record.traineeId,
          sessionId,
          trainerId: markerTrainerId ?? session.trainerId,
          markedById,
          status: record.status,
          remarks: record.remarks || undefined,
        },
        update: {
          trainerId: markerTrainerId ?? session.trainerId,
          markedById,
          status: record.status,
          remarks: record.remarks ?? '',
          markedAt: new Date(),
        },
      });
      results.push(result);
    }

    return results;
  });

  return saved;
};

export const getSummary = async (query: { traineeId: string; batchId: string }, actor: AttendanceActor) => {
  const { traineeId, batchId } = query;
  if (!traineeId || !batchId) throw new AppError('traineeId and batchId are required', 400);

  const batch = await prisma.trainingBatch.findUnique({
    where: { id: batchId },
    select: { id: true, campusId: true, trainerId: true },
  });
  if (!batch) throw new AppError('Batch not found', 404);

  if (actor.role === UserRole.TRAINEE) {
    if (traineeId !== actor.trainee?.id) throw new ForbiddenError('You can only view your own attendance');
    const enrolled = await prisma.enrollment.findFirst({ where: { traineeId, batchId, status: 'ACTIVE' }, select: { id: true } });
    if (!enrolled) throw new ForbiddenError('You are not enrolled in this batch');
  } else if (actor.role === UserRole.TRAINER) {
    if (!actor.trainer?.id || batch.trainerId !== actor.trainer.id) throw new ForbiddenError('You can only view attendance for batches assigned to you');
  } else if (actor.role === UserRole.CENTRE_ADMIN) {
    if (batch.campusId !== actor.campusId) throw new ForbiddenError('You cannot view attendance outside your campus');
  } else if (actor.role !== UserRole.ADMIN) {
    throw new ForbiddenError('You cannot view this attendance summary');
  }

  const attendances = await prisma.attendance.findMany({
    where: { traineeId, session: { batchId } },
    include: { session: true },
  });

  const totalSessions = attendances.length;
  let attended = 0;
  let absent = 0;
  let late = 0;
  let excused = 0;
  let totalAttendedHours = 0;
  let totalScheduledHours = 0;

  attendances.forEach((attendance) => {
    const hours = attendance.session.durationMin / 60;
    totalScheduledHours += hours;

    switch (attendance.status) {
      case AttendanceStatus.PRESENT:
        attended++;
        totalAttendedHours += hours;
        break;
      case AttendanceStatus.LATE:
        late++;
        totalAttendedHours += hours;
        break;
      case AttendanceStatus.ABSENT:
        absent++;
        break;
      case AttendanceStatus.EXCUSED:
        excused++;
        break;
    }
  });

  const attendancePct = totalSessions > 0 ? ((attended + late) / totalSessions) * 100 : 0;

  return {
    totalSessions,
    attended,
    absent,
    late,
    excused,
    attendancePct,
    totalScheduledHours,
    totalAttendedHours,
  };
};

export const getMyReport = async (userId: string) => {
  const trainee = await prisma.trainee.findUnique({
    where: { userId },
    select: {
      id: true,
      studentId: true,
      enrollmentStatus: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!trainee) throw new AppError('Trainee profile not found', 404);

  const attendances = await prisma.attendance.findMany({
    where: { traineeId: trainee.id },
    include: {
      session: {
        include: {
          batch: { select: { name: true, code: true } },
          module: { select: { name: true } },
        },
      },
    },
    orderBy: [{ session: { date: 'desc' } }, { markedAt: 'desc' }],
  });

  const summary = attendances.reduce(
    (acc, attendance) => {
      acc.totalSessions += 1;
      const hours = attendance.session.durationMin / 60;
      acc.totalScheduledHours += hours;

      if (attendance.status === AttendanceStatus.PRESENT) {
        acc.attended += 1;
        acc.totalAttendedHours += hours;
      } else if (attendance.status === AttendanceStatus.LATE) {
        acc.late += 1;
        acc.totalAttendedHours += hours;
      } else if (attendance.status === AttendanceStatus.ABSENT) {
        acc.absent += 1;
      } else if (attendance.status === AttendanceStatus.EXCUSED) {
        acc.excused += 1;
      }
      return acc;
    },
    { totalSessions: 0, attended: 0, absent: 0, late: 0, excused: 0, totalScheduledHours: 0, totalAttendedHours: 0 },
  );

  return {
    trainee,
    summary: {
      ...summary,
      attendancePct: summary.totalSessions > 0 ? ((summary.attended + summary.late) / summary.totalSessions) * 100 : 0,
    },
    records: attendances,
  };
};
