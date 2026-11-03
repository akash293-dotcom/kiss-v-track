import prisma from '../lib/prisma';

export const getAdminDashboard = async (campusId?: string) => {
  const traineeScope = campusId ? { campusId } : {};
  const batchScope = campusId ? { campusId } : {};
  const sessionScope = campusId ? { batch: { campusId } } : {};
  const attendanceScope = campusId ? { session: { batch: { campusId } } } : {};

  const [
    totalTrainees,
    activePrograms,
    activeBatches,
    totalTrainers,
    totalCampuses,
    totalSkills,
    totalAssessments,
    totalTrainingHoursRaw,
    allAttendance,
    skillsLearned,
    skillsVerified,
    productsCreated,
    certificatesIssued,
  ] = await Promise.all([
    prisma.trainee.count({ where: { ...traineeScope, enrollmentStatus: 'ACTIVE' } }),
    prisma.vocationalElective.count({ where: { status: 'ACTIVE' } }),
    prisma.trainingBatch.count({ where: { ...batchScope, status: 'ACTIVE' } }),
    prisma.trainer.count({ where: { ...traineeScope, isActive: true } }),
    campusId ? Promise.resolve(1) : prisma.campus.count({ where: { isActive: true } }),
    prisma.skill.count({ where: { isActive: true, ...(campusId ? { category: { electives: { some: { trainingBatches: { some: { campusId } } } } } } : {}) } }),
    prisma.assessment.count({ where: campusId ? { trainee: { campusId } } : {} }),
    prisma.trainingSession.aggregate({ where: { ...sessionScope, status: 'COMPLETED' }, _sum: { durationMin: true } }),
    prisma.attendance.findMany({ where: attendanceScope, select: { status: true } }),
    prisma.traineeSkill.count({ where: { ...(campusId ? { trainee: { campusId } } : {}), status: { not: 'NOT_STARTED' } } }),
    prisma.traineeSkill.count({ where: { ...(campusId ? { trainee: { campusId } } : {}), status: 'VERIFIED' } }),
    prisma.product.count({ where: campusId ? { trainee: { campusId } } : {} }),
    prisma.certificate.count({ where: { status: 'ISSUED', ...(campusId ? { trainee: { campusId } } : {}) } }),
  ]);

  const totalTrainingHours = Math.round((totalTrainingHoursRaw._sum.durationMin || 0) / 60);
  const presentCount = allAttendance.filter((attendance) => attendance.status === 'PRESENT' || attendance.status === 'LATE').length;
  const averageAttendance = allAttendance.length > 0
    ? Math.round((presentCount / allAttendance.length) * 1000) / 10
    : 0;

  const categoryCounts = await prisma.vocationalCategory.findMany({
    where: { isActive: true },
    select: { name: true, _count: { select: { electives: true } } },
    orderBy: { name: 'asc' },
  });

  const skillDistribution = categoryCounts.map((category) => ({
    label: category.name,
    value: category._count.electives,
  }));

  return {
    totalTrainees,
    totalCampuses,
    activePrograms,
    activeBatches,
    totalTrainers,
    totalSkills,
    totalAssessments,
    totalTrainingHours,
    averageAttendance,
    skillsLearned,
    skillsVerified,
    productsCreated,
    certificatesIssued,
    skillDistribution,
    trainingTrends: [],
  };
};

export const getTrainerDashboard = async (trainerId: string) => {
  const [trainer, activeBatches, upcomingSessions, completedSessions, pendingReviews] = await Promise.all([
    prisma.trainer.findUnique({
      where: { id: trainerId },
      select: { id: true, employeeId: true, qualification: true, specialization: true, experience: true, isActive: true },
    }),
    prisma.trainingBatch.count({ where: { trainerId, status: 'ACTIVE' } }),
    prisma.trainingSession.count({ where: { trainerId, status: { in: ['SCHEDULED', 'RESCHEDULED'] }, date: { gte: new Date() } } }),
    prisma.trainingSession.count({ where: { trainerId, status: 'COMPLETED' } }),
    prisma.practicalSubmission.count({ where: { task: { trainerId }, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }),
  ]);

  return { trainer, activeBatches, upcomingSessions, completedSessions, pendingReviews };
};

export const getTraineeDashboard = async (traineeId: string) => {
  const [trainee, activeEnrollments, skills, attendance, upcomingSessions, products, certificates] = await Promise.all([
    prisma.trainee.findUnique({
      where: { id: traineeId },
      select: { id: true, studentId: true, className: true, academicYear: true, department: true, enrollmentStatus: true },
    }),
    prisma.enrollment.count({ where: { traineeId, status: 'ACTIVE' } }),
    prisma.traineeSkill.findMany({ where: { traineeId }, select: { status: true, progressPct: true } }),
    prisma.attendance.findMany({ where: { traineeId }, select: { status: true } }),
    prisma.trainingSession.count({
      where: {
        date: { gte: new Date() },
        status: { in: ['SCHEDULED', 'RESCHEDULED'] },
        batch: { enrollments: { some: { traineeId, status: 'ACTIVE' } } },
      },
    }),
    prisma.product.count({ where: { traineeId } }),
    prisma.certificate.count({ where: { traineeId, status: 'ISSUED' } }),
  ]);

  const presentCount = attendance.filter((record) => record.status === 'PRESENT' || record.status === 'LATE').length;
  const attendancePercentage = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 1000) / 10 : 0;
  const skillsLearned = skills.filter((skill) => skill.status !== 'NOT_STARTED').length;
  const skillsVerified = skills.filter((skill) => skill.status === 'VERIFIED').length;
  const averageSkillProgress = skills.length > 0
    ? Math.round((skills.reduce((sum, skill) => sum + skill.progressPct, 0) / skills.length) * 10) / 10
    : 0;

  return { trainee, activeEnrollments, attendancePercentage, skillsLearned, skillsVerified, averageSkillProgress, upcomingSessions, products, certificates };
};
