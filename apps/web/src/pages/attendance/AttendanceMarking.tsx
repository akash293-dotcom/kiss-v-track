import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Info,
  MessageSquareText,
  RotateCcw,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const STATUSES = [
  { key: 'PRESENT', label: 'Present', active: 'border-green-200 bg-green-50 text-green-800', icon: CheckCircle2 },
  { key: 'ABSENT', label: 'Absent', active: 'border-red-200 bg-red-50 text-red-800', icon: UserX },
  { key: 'LATE', label: 'Late', active: 'border-amber-200 bg-amber-50 text-amber-800', icon: Clock3 },
  { key: 'EXCUSED', label: 'Excused', active: 'border-blue-200 bg-blue-50 text-blue-800', icon: Info },
] as const;

type AttendanceStatus = typeof STATUSES[number]['key'];

type RowState = {
  status: AttendanceStatus | null;
  remarks: string;
};

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function getName(value: any) {
  const first = value?.user?.firstName || '';
  const last = value?.user?.lastName || '';
  return `${first} ${last}`.trim() || value?.user?.email || '-';
}

export default function AttendanceMarking() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [state, setState] = useState<Record<string, RowState>>({});

  const reportPath = user?.role === 'TRAINER' ? '/trainer/attendance' : '/admin/attendance';

  const { data: attendanceData, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendance-session', sessionId],
    queryFn: async () => {
      const response = await api.get('/attendance', { params: { sessionId } });
      return {
        session: response.data?.session,
        records: Array.isArray(response.data?.data) ? response.data.data : [],
      };
    },
    enabled: Boolean(sessionId),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    const next: Record<string, RowState> = {};
    (attendanceData?.records || []).forEach((record: any) => {
      next[record.traineeId] = {
        status: record.status || null,
        remarks: record.remarks || '',
      };
    });
    setState(next);
  }, [attendanceData]);

  const records = attendanceData?.records || [];
  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((record: any) => {
      const haystack = [
        getName(record.trainee),
        record.studentId,
        record.trainee?.user?.email,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [records, search]);

  const stats = useMemo(() => {
    return records.reduce((acc: Record<string, number>, record: any) => {
      const status = state[record.traineeId]?.status;
      acc.total += 1;
      if (!status) acc.PENDING += 1;
      else acc[status] += 1;
      return acc;
    }, { total: 0, PENDING: 0, PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 });
  }, [records, state]);

  const allMarked = stats.total > 0 && stats.PENDING === 0;
  const changedCount = records.reduce((count: number, record: any) => {
    const current = state[record.traineeId];
    const saved = record.status || null;
    const savedRemarks = record.remarks || '';
    return count + ((current?.status ?? null) !== saved || (current?.remarks || '') !== savedRemarks ? 1 : 0);
  }, 0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!allMarked) throw new Error('Please mark attendance for every trainee before saving.');
      const payload = records.map((record: any) => ({
        traineeId: record.traineeId,
        status: state[record.traineeId].status,
        remarks: state[record.traineeId].remarks.trim() || undefined,
      }));
      return api.post('/attendance', { sessionId, records: payload });
    },
    onSuccess: async () => {
      toast.success('Attendance saved successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['attendance-session', sessionId] }),
        queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }),
      ]);
      await refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.response?.data?.error?.message || error?.message || 'Failed to save attendance');
    },
  });

  const setAll = (status: AttendanceStatus) => {
    setState((current) => {
      const next = { ...current };
      records.forEach((record: any) => {
        next[record.traineeId] = {
          status,
          remarks: next[record.traineeId]?.remarks || '',
        };
      });
      return next;
    });
  };

  const reset = () => {
    const next: Record<string, RowState> = {};
    records.forEach((record: any) => {
      next[record.traineeId] = { status: record.status || null, remarks: record.remarks || '' };
    });
    setState(next);
  };

  const back = () => {
    if (location.pathname.startsWith('/trainer/')) {
      navigate('/trainer/attendance');
      return;
    }
    navigate(reportPath);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isError || !attendanceData?.session) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={back}>Back to attendance</Button>
        <Card>
          <div className="py-10 text-center text-red-600">Unable to load this attendance register.</div>
        </Card>
      </div>
    );
  }

  const session = attendanceData.session;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={back}>Back</Button>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Attendance register</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{session.topic || session.module?.name || 'Training session'}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>{session.batch?.name || 'Batch'}{session.batch?.code ? ` (${session.batch.code})` : ''}</span>
              <span>{formatDate(session.date)}</span>
              <span>{session.startTime} - {session.endTime}</span>
              {session.trainer?.user && <span>Trainer: {getName(session.trainer)}</span>}
            </div>
          </div>
        </div>
        <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={() => refetch()}>Reload</Button>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm"><Info size={18} /></div>
            <div>
              <p className="font-medium text-indigo-900">Roll-call workflow</p>
              <p className="mt-0.5 text-sm text-indigo-700">Every enrolled trainee must have a status before the register can be saved. Existing records are loaded automatically.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setAll('PRESENT')} icon={<UserCheck size={15} />}>All Present</Button>
            <Button variant="secondary" size="sm" onClick={() => setAll('ABSENT')} icon={<UserX size={15} />}>All Absent</Button>
            <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw size={15} />}>Reset</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ['Total', stats.total, 'text-gray-900', 'bg-gray-50'],
          ['Present', stats.PRESENT, 'text-green-800', 'bg-green-50'],
          ['Absent', stats.ABSENT, 'text-red-800', 'bg-red-50'],
          ['Late', stats.LATE, 'text-amber-800', 'bg-amber-50'],
          ['Excused', stats.EXCUSED, 'text-blue-800', 'bg-blue-50'],
          ['Pending', stats.PENDING, 'text-indigo-800', 'bg-indigo-50'],
        ].map(([label, value, textClass, bgClass]) => (
          <div key={label} className={`rounded-xl border border-gray-200 p-4 ${bgClass}`}>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${textClass}`}>{value}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Trainees</h2>
            <p className="text-sm text-gray-500">{records.length} enrolled trainee{records.length === 1 ? '' : 's'}</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search trainee or student ID" className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredRecords.map((record: any) => {
            const current = state[record.traineeId] || { status: null, remarks: '' };
            return (
              <div key={record.traineeId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 xl:w-72">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-700">
                        {getName(record.trainee).slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{getName(record.trainee)}</p>
                        <p className="mt-0.5 text-sm text-gray-500">Student ID: {record.studentId || '-'}</p>
                        {record.trainee?.user?.email && <p className="truncate text-xs text-gray-400">{record.trainee.user.email}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-wrap gap-2">
                    {STATUSES.map(({ key, label, active, icon: Icon }) => {
                      const selected = current.status === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setState((prev) => ({ ...prev, [record.traineeId]: { ...current, status: key } }))}
                          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${selected ? active : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                        >
                          <Icon size={15} />
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex w-full items-center gap-2 xl:w-80">
                    <MessageSquareText className="h-4 w-4 shrink-0 text-gray-400" />
                    <input
                      value={current.remarks}
                      onChange={(event) => setState((prev) => ({ ...prev, [record.traineeId]: { ...current, remarks: event.target.value } }))}
                      placeholder="Optional remarks"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {!current.status && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700">
                    <Info size={14} /> Attendance not marked yet
                  </div>
                )}
              </div>
            );
          })}

          {filteredRecords.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">No trainees match your search.</div>
          )}
        </div>
      </Card>

      <div className="sticky bottom-4 z-20">
        <div className="rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold text-gray-900">{allMarked ? 'Ready to save' : `${stats.PENDING} trainee${stats.PENDING === 1 ? '' : 's'} still pending`}</p>
              <p className="mt-0.5 text-sm text-gray-500">{changedCount > 0 ? `${changedCount} record${changedCount === 1 ? '' : 's'} changed.` : 'No unsaved changes.'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={back} icon={<X size={16} />}>Cancel</Button>
              <Button
                onClick={() => saveMutation.mutate()}
                isLoading={saveMutation.isPending}
                disabled={!allMarked || changedCount === 0}
                icon={<Check size={16} />}
              >
                Save Attendance
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
