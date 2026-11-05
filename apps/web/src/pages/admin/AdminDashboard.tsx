import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
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

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const item = payload[0];

  const name =
    item.payload?.label ||
    item.payload?.name ||
    item.name ||
    'Value';

  const value = item.value;

  const isSkill =
    name === 'Skills Learned' ||
    name === 'Skills Verified';

  const itemColor =
    item.color ||
    item.payload?.fill ||
    '#4F46E5';

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
        padding: '16px 22px 16px 20px',
        minWidth: '300px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      <div
        style={{
          width: '7px',
          height: '42px',
          borderRadius: '999px',
          background: itemColor,
          flexShrink: 0,
        }}
      />

      <div
        style={{
          fontSize: '18px',
          fontWeight: 500,
          color: '#111827',
        }}
      >
        {name} : {value}{' '}
        {isSkill
          ? value === 1
            ? 'skill'
            : 'skills'
          : value === 1
            ? 'program'
            : 'programs'}
      </div>
    </div>
  );
}

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

  if (
    dashboardLoading
  ) {
    return (
      <LoadingSpinner fullScreen />
    );
  }

  const dashboard = dashboardResponse || {};

  const totalSkills = dashboard.totalSkills || 0;

  const assessmentsConducted = dashboard.totalAssessments || 0;

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
        <div className="min-w-0 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-medium text-gray-900">
            Programs by Category
          </h3>

          <div className="h-[320px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={118}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="label"
                  label={false}
                  labelLine={false}
                >
                  {skillDistribution.map((_entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Responsive legend: labels wrap and the card grows to fit every category. */}
          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            {skillDistribution.map((entry: any, index: number) => (
              <div
                key={`legend-${entry.label ?? index}`}
                className="flex min-w-0 items-start gap-2 text-sm leading-5"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="min-w-0 break-words text-gray-600">
                  {entry.label}
                </span>
              </div>
            ))}
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

                <Tooltip
                  content={<CustomTooltip />}
                />

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