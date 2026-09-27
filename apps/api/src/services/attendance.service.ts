import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const { sessionId } = query;
  if (!sessionId) throw new AppError('sessionId is required', 400);

  return prisma.attendance.findMany({
    where: { sessionId },
    include: {
      trainee: { include: { user: { select: { firstName: true, lastName: true, email: true } } } }
    }
  });
};

export const markBulk = async (sessionId: string, records: { traineeId: string, status: any, remarks?: string }[], markedById: string, trainerId?: string) => {
  const session = await prisma.trainingSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new AppError('Session not found', 404);

  return prisma.$transaction(async (tx) => {
    const results = [];
    for (const record of records) {
      const existing = await tx.attendance.findUnique({
        where: { traineeId_sessionId: { traineeId: record.traineeId, sessionId } }
      });

      if (existing) {
        const updated = await tx.attendance.update({
          where: { id: existing.id },
          data: {
            status: record.status,
            remarks: record.remarks,
            markedById,
            trainerId
          }
        });
        results.push(updated);
      } else {
        const created = await tx.attendance.create({
          data: {
            sessionId,
            traineeId: record.traineeId,
            status: record.status,
            remarks: record.remarks,
            markedById,
            trainerId
          }
        });
        results.push(created);
      }
    }
    
    // Update session status to COMPLETED
    if (session.status !== 'COMPLETED') {
      await tx.trainingSession.update({ where: { id: sessionId }, data: { status: 'COMPLETED' } });
    }
    
    return results;
  });
};

export const getSummary = async (query: { traineeId: string, batchId: string }) => {
  const { traineeId, batchId } = query;
  if (!traineeId || !batchId) throw new AppError('traineeId and batchId are required', 400);

  const attendances = await prisma.attendance.findMany({
    where: { traineeId, session: { batchId } },
    include: { session: true }
  });

  const totalSessions = attendances.length;
  let attended = 0, absent = 0, late = 0, excused = 0;
  let totalAttendedHours = 0, totalScheduledHours = 0;

  attendances.forEach(a => {
    const hours = a.session.durationMin / 60;
    totalScheduledHours += hours;
    
    switch (a.status) {
      case 'PRESENT': attended++; totalAttendedHours += hours; break;
      case 'LATE': late++; totalAttendedHours += hours; break;
      case 'ABSENT': absent++; break;
      case 'EXCUSED': excused++; break;
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
    totalAttendedHours
  };
};
