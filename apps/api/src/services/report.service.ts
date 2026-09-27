import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const getTraineeReport = async (id: string) => {
  const trainee = await prisma.trainee.findUnique({
    where: { id },
    include: { user: true, campus: true }
  });
  if (!trainee) throw new AppError('Trainee not found', 404);

  const skills = await prisma.traineeSkill.findMany({
    where: { traineeId: id },
    include: { skill: { include: { category: true } } }
  });

  const attendances = await prisma.attendance.findMany({ where: { traineeId: id } });
  const present = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendancePct = attendances.length > 0 ? (present / attendances.length) * 100 : 0;

  return {
    trainee,
    attendance: { total: attendances.length, present, percentage: attendancePct },
    skills: {
      total: skills.length,
      verified: skills.filter(s => s.status === 'VERIFIED').length,
      details: skills
    }
  };
};

export const getBatchReport = async (id: string) => {
  const batch = await prisma.trainingBatch.findUnique({
    where: { id },
    include: { elective: true, trainer: { include: { user: true } } }
  });
  if (!batch) throw new AppError('Batch not found', 404);

  const enrollments = await prisma.enrollment.findMany({
    where: { batchId: id, status: 'ACTIVE' },
    include: { trainee: { include: { user: true } } }
  });

  const sessions = await prisma.trainingSession.findMany({
    where: { batchId: id },
    include: { attendances: true }
  });

  let totalScheduledHours = sessions.reduce((acc, s) => acc + (s.durationMin / 60), 0);
  
  return {
    batch,
    enrollmentsCount: enrollments.length,
    sessionsCount: sessions.length,
    totalScheduledHours,
    trainees: enrollments.map(e => e.trainee)
  };
};

export const getInstitutionalReport = async () => {
  const totalTrainees = await prisma.trainee.count();
  const totalTrainers = await prisma.trainer.count();
  const totalBatches = await prisma.trainingBatch.count();
  const totalCertificates = await prisma.certificate.count();

  return {
    summary: {
      totalTrainees,
      totalTrainers,
      totalBatches,
      totalCertificates
    },
    generatedAt: new Date()
  };
};
