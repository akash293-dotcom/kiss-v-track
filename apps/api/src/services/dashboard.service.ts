import prisma from '../lib/prisma';

export const getAdminDashboard = async (campusId?: string) => {
  const campusFilter = campusId ? { campusId } : {};

  const [
    totalTrainees,
    activePrograms,
    activeBatches,
    totalTrainers,
    totalCampuses,
  ] = await Promise.all([
    prisma.trainee.count({
      where: {
        ...campusFilter,
        enrollmentStatus: 'ACTIVE',
      },
    }),

    prisma.vocationalElective.count({
      where: {
        status: 'ACTIVE',
      },
    }),

    prisma.trainingBatch.count({
      where: {
        ...campusFilter,
        status: 'ACTIVE',
      },
    }),

    prisma.trainer.count({
      where: {
        ...campusFilter,
        isActive: true,
      },
    }),

    prisma.campus.count(),
  ]);

  const completedSessions = await prisma.trainingSession.findMany({
    where: {
      status: 'COMPLETED',
    },
    select: {
      durationMin: true,
    },
  });

  const totalTrainingHours = Math.round(
    completedSessions.reduce(
      (sum, session) => sum + session.durationMin,
      0
    ) / 60
  );

  const allAttendance = await prisma.attendance.findMany({
    select: {
      status: true,
    },
  });

  const presentCount = allAttendance.filter(
    (attendance) =>
      attendance.status === 'PRESENT' ||
      attendance.status === 'LATE'
  ).length;

  const averageAttendance =
    allAttendance.length > 0
      ? Math.round((presentCount / allAttendance.length) * 1000) / 10
      : 0;

  const [
    skillsLearned,
    skillsVerified,
    productsCreated,
    certificatesIssued,
  ] = await Promise.all([
    prisma.traineeSkill.count({
      where: {
        status: {
          not: 'NOT_STARTED',
        },
      },
    }),

    prisma.traineeSkill.count({
      where: {
        status: 'VERIFIED',
      },
    }),

    prisma.product.count(),

    prisma.certificate.count({
      where: {
        status: 'ISSUED',
      },
    }),
  ]);

  const categoryCounts =
    await prisma.vocationalCategory.findMany({
      where: {
        isActive: true,
      },
      select: {
        name: true,
        _count: {
          select: {
            electives: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

  const skillDistribution = categoryCounts.map(
    (category) => ({
      label: category.name,
      value: category._count.electives,
    })
  );

  return {
    totalTrainees,
    totalCampuses,
    activePrograms,
    activeBatches,
    totalTrainers,
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