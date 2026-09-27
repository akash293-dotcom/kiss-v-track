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

export const getTrainerDashboard = async (trainerId: string) => {
  const [trainer, activeBatches, upcomingSessions, completedSessions] =
    await Promise.all([
      prisma.trainer.findUnique({
        where: { id: trainerId },
        select: {
          id: true,
          employeeId: true,
          qualification: true,
          specialization: true,
          experience: true,
          isActive: true,
        },
      }),

      prisma.trainingBatch.count({
        where: {
          trainerId,
          status: 'ACTIVE',
        },
      }),

      prisma.trainingSession.count({
        where: {
          trainerId,
          status: 'SCHEDULED',
          date: {
            gte: new Date(),
          },
        },
      }),

      prisma.trainingSession.count({
        where: {
          trainerId,
          status: 'COMPLETED',
        },
      }),
    ]);

  return {
    trainer,
    activeBatches,
    upcomingSessions,
    completedSessions,
  };
};

export const getTraineeDashboard = async (traineeId: string) => {
  const [trainee, activeEnrollments, skills, attendance] =
    await Promise.all([
      prisma.trainee.findUnique({
        where: { id: traineeId },
        select: {
          id: true,
          studentId: true,
          className: true,
          academicYear: true,
          department: true,
          enrollmentStatus: true,
        },
      }),

      prisma.enrollment.count({
        where: {
          traineeId,
          status: 'ACTIVE',
        },
      }),

      prisma.traineeSkill.findMany({
        where: {
          traineeId,
        },
        select: {
          status: true,
          progressPct: true,
        },
      }),

      prisma.attendance.findMany({
        where: {
          traineeId,
        },
        select: {
          status: true,
        },
      }),
    ]);

  const presentCount = attendance.filter(
    (record) =>
      record.status === 'PRESENT' ||
      record.status === 'LATE'
  ).length;

  const attendancePercentage =
    attendance.length > 0
      ? Math.round(
          (presentCount / attendance.length) * 1000
        ) / 10
      : 0;

  const skillsLearned = skills.filter(
    (skill) => skill.status !== 'NOT_STARTED'
  ).length;

  const skillsVerified = skills.filter(
    (skill) => skill.status === 'VERIFIED'
  ).length;

  const averageSkillProgress =
    skills.length > 0
      ? Math.round(
          (skills.reduce(
            (sum, skill) => sum + skill.progressPct,
            0
          ) /
            skills.length) *
            10
        ) / 10
      : 0;

  return {
    trainee,
    activeEnrollments,
    attendancePercentage,
    skillsLearned,
    skillsVerified,
    averageSkillProgress,
  };
};