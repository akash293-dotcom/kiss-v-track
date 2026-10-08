import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Timer,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Table } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';

const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  EXCUSED: 'Excused',
};

const STATUS_COLORS: Record<string, string> = {
  PRESENT: '#16a34a',
  ABSENT: '#dc2626',
  LATE: '#d97706',
  EXCUSED: '#2563eb',
};

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value?: string | null) {
  if (!value) return '-';
  return value;
}

function getName(value: any) {
  const first = value?.user?.firstName || '';
  const last = value?.user?.lastName || '';
  return `${first} ${last}`.trim() || value?.name || value?.email || '-';
}

function StatCard({
  label,
  value,
  subtitle,
  icon,
  iconClass = 'bg-indigo-50 text-indigo-600',
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconClass?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function percentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function AttendanceReport() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isTrainee = user?.role === 'TRAINEE';

  const [batchId, setBatchId] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const {
    data: myReport,
    isLoading: myReportLoading,
    isError: myReportError,
    refetch: refetchMyReport,
  } = useQuery({
    queryKey: ['attendance-my-report'],
    queryFn: async () => {
      const response = await api.get('/attendance/my');
      return response.data?.data;
    },
    enabled: isTrainee,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['attendance-sessions', batchId, from, to],
    queryFn: async () => {
      const response = await api.get('/attendance/sessions', {
        params: {
          ...(batchId ? { batchId } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          limit: 500,
        },
      });
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !isTrainee,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const filteredSessions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sessions;

    return sessions.filter((session: any) => {
      const haystack = [
        session.topic,
        session.description,
        session.batch?.name,
        session.batch?.code,
        session.module?.name,
        getName(session.trainer),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [sessions, search]);

  const batches = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((session: any) => {
      if (session.batch?.id) {
        map.set(session.batch.id, `${session.batch.name}${session.batch.code ? ` (${session.batch.code})` : ''}`);
      }
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [sessions]);

  useEffect(() => {
    if (!selectedSessionId && filteredSessions.length > 0) {
      setSelectedSessionId(filteredSessions[0].id);
      return;
    }

    if (selectedSessionId && !filteredSessions.some((session: any) => session.id === selectedSessionId)) {
      setSelectedSessionId(filteredSessions[0]?.id || '');
    }
  }, [filteredSessions, selectedSessionId]);

  const {
    data: selectedAttendance,
    isLoading: attendanceLoading,
    isError: attendanceError,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ['attendance-session', selectedSessionId],
    queryFn: async () => {
      const response = await api.get('/attendance', { params: { sessionId: selectedSessionId } });
      return {
        records: Array.isArray(response.data?.data) ? response.data.data : [],
        meta: response.data?.meta || {},
        session: response.data?.session || null,
      };
    },
    enabled: !isTrainee && Boolean(selectedSessionId),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const currentSession = selectedAttendance?.session || filteredSessions.find((session: any) => session.id === selectedSessionId);
  const currentRecords = selectedAttendance?.records || [];
  const currentMeta = selectedAttendance?.meta || {};

  const chartData = useMemo(() => {
    if (isTrainee) {
      const summary = myReport?.summary || {};
      return ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']
        .map((key) => ({
          name: STATUS_LABELS[key],
          value: Number(summary[key === 'PRESENT' ? 'attended' : key.toLowerCase()] || 0),
          key,
        }))
        .filter((item) => item.value > 0);
    }

    return ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']
      .map((key) => ({
        name: STATUS_LABELS[key],
        value: Number(currentMeta[key] || 0),
        key,
      }))
      .filter((item) => item.value > 0);
  }, [currentMeta, isTrainee, myReport]);

  const adminTotals = useMemo(() => {
    const total = Number(currentMeta.total || 0);
    const marked = Number(currentMeta.marked || 0);
    return {
      total,
      marked,
      pending: Math.max(total - marked, 0),
      attendancePct: Number(currentMeta.attendancePct || 0),
    };
  }, [currentMeta]);

  const handleRefresh = async () => {
    if (isTrainee) {
      await refetchMyReport();
      return;
    }
    await Promise.all([refetchSessions(), selectedSessionId ? refetchAttendance() : Promise.resolve()]);
  };

  if (isTrainee && myReportLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isTrainee && sessionsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if ((isTrainee && myReportError) || (!isTrainee && sessionsError)) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
        <Card>
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Unable to load attendance data.</p>
              <p className="mt-1 text-sm text-red-600">Check your connection and try again.</p>
            </div>
          </div>
          <div className="mt-4">
            <Button icon={<RefreshCw size={16} />} onClick={handleRefresh}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isTrainee) {
    const summary = myReport?.summary || {};
    const records = myReport?.records || [];

    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">My learning record</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Attendance Report</h1>
            <p className="mt-1 text-sm text-gray-500">Your attendance history, participation rate, and training hours.</p>
          </div>
          <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={handleRefresh}>Refresh</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Attendance rate" value={percentage(Number(summary.attendancePct || 0))} subtitle="Present + late" icon={<ClipboardCheck size={22} />} />
          <StatCard label="Sessions attended" value={Number(summary.attended || 0)} subtitle={`${Number(summary.totalSessions || 0)} recorded sessions`} icon={<UserCheck size={22} />} iconClass="bg-emerald-50 text-emerald-600" />
          <StatCard label="Late" value={Number(summary.late || 0)} subtitle="Late arrivals" icon={<Timer size={22} />} iconClass="bg-amber-50 text-amber-600" />
          <StatCard label="Training hours" value={Number(summary.totalAttendedHours || 0).toFixed(1)} subtitle="Attended training time" icon={<Clock3 size={22} />} iconClass="bg-blue-50 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card title="Attendance distribution" description="Your recorded attendance by status" className="xl:col-span-1">
            <div className="h-72">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">No attendance records yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={3}>
                      {chartData.map((entry) => <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={42} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card title="Attendance history" description="Most recent recorded sessions" className="xl:col-span-2">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Date</Table.Head>
                  <Table.Head>Session</Table.Head>
                  <Table.Head>Batch</Table.Head>
                  <Table.Head>Time</Table.Head>
                  <Table.Head>Status</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {records.length === 0 ? (
                  <Table.Row><Table.Cell colSpan={5}><div className="py-8 text-center text-sm text-gray-500">No attendance records found.</div></Table.Cell></Table.Row>
                ) : (
                  records.slice(0, 25).map((record: any) => (
                    <Table.Row key={record.id}>
                      <Table.Cell>{formatDate(record.session?.date)}</Table.Cell>
                      <Table.Cell>
                        <div className="font-medium text-gray-900">{record.session?.topic || record.session?.module?.name || 'Training session'}</div>
                        {record.session?.sessionType && <div className="mt-0.5 text-xs text-gray-500">{record.session.sessionType}</div>}
                      </Table.Cell>
                      <Table.Cell>{record.session?.batch?.name || record.session?.batch?.code || '-'}</Table.Cell>
                      <Table.Cell>{formatTime(record.session?.startTime)} - {formatTime(record.session?.endTime)}</Table.Cell>
                      <Table.Cell><StatusBadge status={record.status} /></Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Operations</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Attendance Report</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor session attendance, completion, and trainee participation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={handleRefresh}>Refresh</Button>
          {currentSession && (
            <Button icon={<ClipboardCheck size={16} />} onClick={() => navigate(`${location.pathname}/${currentSession.id}`)}>
              Mark Attendance
            </Button>
          )}
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-indigo-50 p-4 text-indigo-600"><CalendarDays size={28} /></div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">No training sessions found</h2>
            <p className="mt-1 max-w-md text-sm text-gray-500">Create a training session first, then attendance can be recorded and reported here.</p>
            <Link to={user?.role === 'TRAINER' ? '/trainer/sessions' : '/admin/sessions'} className="mt-5">
              <Button>Open Sessions</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Enrolled trainees" value={adminTotals.total} subtitle="Selected session" icon={<Users size={22} />} />
            <StatCard label="Marked" value={adminTotals.marked} subtitle={`${adminTotals.pending} pending`} icon={<CheckCircle2 size={22} />} iconClass="bg-emerald-50 text-emerald-600" />
            <StatCard label="Attendance rate" value={percentage(adminTotals.attendancePct)} subtitle="Present + late" icon={<BarChart3 size={22} />} iconClass="bg-blue-50 text-blue-600" />
            <StatCard label="Absent / late" value={Number(currentMeta.ABSENT || 0) + Number(currentMeta.LATE || 0)} subtitle={`${Number(currentMeta.ABSENT || 0)} absent · ${Number(currentMeta.LATE || 0)} late`} icon={<AlertCircle size={22} />} iconClass="bg-amber-50 text-amber-600" />
          </div>

          <Card title="Filters" description="Narrow the session list, then select a session to inspect its attendance.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label className="block xl:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-700">Search</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Topic, batch, trainer..." className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Batch</span>
                <select value={batchId} onChange={(event) => setBatchId(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                  <option value="">All batches</option>
                  {batches.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">From</span>
                <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">To</span>
                <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </label>
            </div>
            {(search || batchId || from || to) && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500"><Filter size={14} /> {filteredSessions.length} matching sessions</div>
                <Button variant="ghost" size="sm" icon={<XCircle size={15} />} onClick={() => { setSearch(''); setBatchId(''); setFrom(''); setTo(''); }}>Clear filters</Button>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <Card title="Training sessions" description={`${filteredSessions.length} session${filteredSessions.length === 1 ? '' : 's'} available`} className="xl:col-span-3">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Date</Table.Head>
                    <Table.Head>Session</Table.Head>
                    <Table.Head>Batch</Table.Head>
                    <Table.Head>Attendance</Table.Head>
                    <Table.Head>Action</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredSessions.length === 0 ? (
                    <Table.Row><Table.Cell colSpan={5}><div className="py-8 text-center text-sm text-gray-500">No sessions match your filters.</div></Table.Cell></Table.Row>
                  ) : (
                    filteredSessions.map((session: any) => {
                      const enrolled = Number(session.batch?._count?.enrollments || 0);
                      const marked = Number(session._count?.attendances || 0);
                      const isSelected = session.id === selectedSessionId;
                      return (
                        <Table.Row key={session.id} className={isSelected ? 'bg-indigo-50/60' : ''}>
                          <Table.Cell>
                            <div className="font-medium text-gray-900">{formatDate(session.date)}</div>
                            <div className="mt-0.5 text-xs text-gray-500">{formatTime(session.startTime)} - {formatTime(session.endTime)}</div>
                          </Table.Cell>
                          <Table.Cell>
                            <button type="button" className="text-left" onClick={() => setSelectedSessionId(session.id)}>
                              <div className="font-medium text-indigo-700 hover:text-indigo-900">{session.topic || session.module?.name || 'Training session'}</div>
                              <div className="mt-0.5 text-xs text-gray-500">{getName(session.trainer)}</div>
                            </button>
                          </Table.Cell>
                          <Table.Cell>
                            <div>{session.batch?.name || '-'}</div>
                            {session.batch?.code && <div className="mt-0.5 text-xs text-gray-500">{session.batch.code}</div>}
                          </Table.Cell>
                          <Table.Cell>
                            <div className="text-sm font-medium text-gray-900">{marked} / {enrolled}</div>
                            <StatusBadge status={session.status || 'SCHEDULED'} />
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" icon={<Eye size={15} />} onClick={() => setSelectedSessionId(session.id)}>View</Button>
                              <Button variant="ghost" size="sm" icon={<ClipboardCheck size={15} />} onClick={() => navigate(`${location.pathname}/${session.id}`)}>Mark</Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  )}
                </Table.Body>
              </Table>
            </Card>

            <Card title="Selected session" description={currentSession ? `${formatDate(currentSession.date)} · ${formatTime(currentSession.startTime)} - ${formatTime(currentSession.endTime)}` : 'Select a session'} className="xl:col-span-2">
              {currentSession ? (
                <div className="space-y-5">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 text-white">
                    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-200">{currentSession.batch?.name || 'Batch'}</div>
                    <h2 className="mt-1 text-xl font-bold">{currentSession.topic || currentSession.module?.name || 'Training session'}</h2>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-indigo-100">
                      <span className="inline-flex items-center gap-1.5"><Users size={14} /> {adminTotals.total} trainees</span>
                      <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(currentSession.date)}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> {formatTime(currentSession.startTime)} - {formatTime(currentSession.endTime)}</span>
                    </div>
                  </div>

                  {attendanceLoading ? (
                    <div className="flex justify-center py-10"><LoadingSpinner /></div>
                  ) : attendanceError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Unable to load this session's attendance.</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-green-100 bg-green-50 p-3"><p className="text-xs font-medium text-green-700">Present</p><p className="mt-1 text-xl font-bold text-green-800">{Number(currentMeta.PRESENT || 0)}</p></div>
                        <div className="rounded-lg border border-red-100 bg-red-50 p-3"><p className="text-xs font-medium text-red-700">Absent</p><p className="mt-1 text-xl font-bold text-red-800">{Number(currentMeta.ABSENT || 0)}</p></div>
                        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3"><p className="text-xs font-medium text-amber-700">Late</p><p className="mt-1 text-xl font-bold text-amber-800">{Number(currentMeta.LATE || 0)}</p></div>
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3"><p className="text-xs font-medium text-blue-700">Excused</p><p className="mt-1 text-xl font-bold text-blue-800">{Number(currentMeta.EXCUSED || 0)}</p></div>
                      </div>

                      <div className="h-64">
                        {chartData.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-sm text-gray-500">No attendance has been marked.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={88} paddingAngle={3}>
                                {chartData.map((entry) => <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />)}
                              </Pie>
                              <Tooltip />
                              <Legend verticalAlign="bottom" height={38} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-900">Trainee attendance</p>
                        <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
                          {currentRecords.map((record: any) => (
                            <div key={record.traineeId} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900">{getName(record.trainee)}</p>
                                <p className="text-xs text-gray-500">{record.studentId || '-'}</p>
                              </div>
                              <div className="ml-3 shrink-0">
                                {record.status ? <StatusBadge status={record.status} /> : <span className="text-xs font-medium text-amber-600">Not marked</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full" icon={<ClipboardCheck size={16} />} onClick={() => navigate(`${location.pathname}/${currentSession.id}`)}>Open attendance register</Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex min-h-96 flex-col items-center justify-center text-center text-sm text-gray-500">
                  <ClipboardCheck size={30} className="text-gray-300" />
                  <p className="mt-3">Select a session from the table.</p>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
