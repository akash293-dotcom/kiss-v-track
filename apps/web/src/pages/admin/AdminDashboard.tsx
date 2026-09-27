import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Users,
  Building2,
  Layers,
  Award,
  ClipboardCheck,
  UserCheck,
  CalendarCheck,
  BookOpen,
} from 'lucide-react';

import api from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const COLORS = [
  '#4F46E5',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
];

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const {
    data: dashboardResponse,
    isLoading: dashboardLoading,
  } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/admin');
      return response.data.data;
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const {
    data: skillResponse,
    isLoading: skillLoading,
  } = useQuery({
    queryKey: ['dashboardSkills'],
    queryFn: async () => {
      const response = await api.get('/skills', {
        params: {
          page: 1,
          limit: 1,
        },
      });

      return response.data;
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const {
    data: assessmentResponse,
    isLoading: assessmentLoading,
  } = useQuery({
    queryKey: ['dashboardAssessments'],
    queryFn: async () => {
      const response = await api.get('/assessments', {
        params: {
          page: 1,
          limit: 1,
        },
      });

      return response.data;
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  if (
    dashboardLoading ||
    skillLoading ||
    assessmentLoading
  ) {
    return (
      <LoadingSpinner fullScreen />
    );
  }

  const dashboard = dashboardResponse || {};

  const totalSkills =
    skillResponse?.meta?.total || 0;

  const assessmentsConducted =
    assessmentResponse?.meta?.total || 0;

  const skillDistribution =
    dashboard.skillDistribution || [];

  const skillProgress = [
    {
      name: 'Skills Learned',
      value: dashboard.skillsLearned || 0,
    },
    {
      name: 'Skills Verified',
      value: dashboard.skillsVerified || 0,
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of KISS V-TRACK platform metrics.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Trainees"
          value={dashboard.totalTrainees || 0}
          icon={<Users size={22} />}
        />

        <StatCard
          title="Campuses"
          value={dashboard.totalCampuses || 0}
          icon={<Building2 size={22} />}
        />

        <StatCard
          title="Active Batches"
          value={dashboard.activeBatches || 0}
          icon={<Layers size={22} />}
        />

        <StatCard
          title="Skills Tracked"
          value={totalSkills}
          icon={<BookOpen size={22} />}
        />

        <StatCard
          title="Assessments"
          value={assessmentsConducted}
          icon={<ClipboardCheck size={22} />}
        />

        <StatCard
          title="Certificates"
          value={dashboard.certificatesIssued || 0}
          icon={<Award size={22} />}
        />

        <StatCard
          title="Trainers"
          value={dashboard.totalTrainers || 0}
          icon={<UserCheck size={22} />}
        />

        <StatCard
          title="Avg Attendance (%)"
          value={dashboard.averageAttendance || 0}
          icon={<CalendarCheck size={22} />}
        />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Programs by Category */}
        <div className="bg-white p-6 rounded-lg shadow">

          <h3 className="text-xl font-medium text-gray-900 mb-4">
            Programs by Category
          </h3>

          <div className="h-[420px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>

                <Pie
                  data={skillDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={150}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="label"
                  label={false}
                  labelLine={false}
                >

                  {skillDistribution.map(
                    (_entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[
                            index % COLORS.length
                          ]
                        }
                      />
                    )
                  )}

                </Pie>

                {/* Appears ONLY when cursor is over a slice */}
                <Tooltip
                  formatter={(
                    value: number,
                    name: string
                  ) => [
                    `${value} program${
                      value === 1 ? '' : 's'
                    }`,
                    name,
                  ]}
                />

                {/* Category names stay here instead of
                    being drawn over the donut */}
                <Legend
                  verticalAlign="bottom"
                  height={75}
                />

              </PieChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* Skill Progress */}
        <div className="bg-white p-6 rounded-lg shadow">

          <h3 className="text-xl font-medium text-gray-900 mb-4">
            Skill Progress
          </h3>

          <div className="h-[420px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={skillProgress}
                margin={{
                  top: 20,
                  right: 20,
                  left: 10,
                  bottom: 20,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#4F46E5"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  );
}