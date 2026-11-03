import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

export default function SessionList() {
  const { user } = useAuth();
  const base = user?.role === 'TRAINER' ? '/trainer' : user?.role === 'TRAINEE' ? '/trainee' : '/admin';
  const canManage = user?.role === 'ADMIN' || user?.role === 'CENTRE_ADMIN' || user?.role === 'TRAINER';

  const { data: sessions = [], isLoading, isError, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await api.get('/sessions');
      const data = response.data?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.sessions)) return data.sessions;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.items)) return data.items;
      return [];
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (isError) return <div className="p-6 text-red-600">{(error as any)?.response?.data?.error?.message || 'Failed to load sessions.'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Sessions</h1>
          <p className="mt-1 text-sm text-gray-500">View scheduled lessons and training activity.</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'CENTRE_ADMIN' || user?.role === 'TRAINER') && (
          <Link to={`${base}/sessions/new`}>
            <Button icon={<Plus size={16} />}>Add Session</Button>
          </Link>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Topic</Table.Head>
              <Table.Head>Date</Table.Head>
              <Table.Head>Time</Table.Head>
              <Table.Head>Batch</Table.Head>
              <Table.Head>Trainer</Table.Head>
              <Table.Head>Module</Table.Head>
              <Table.Head>Status</Table.Head>
              {canManage && <Table.Head>Actions</Table.Head>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sessions.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={canManage ? 8 : 7}>
                  <div className="text-center py-6 text-gray-500">No sessions found.</div>
                </Table.Cell>
              </Table.Row>
            ) : sessions.map((session: any) => {
              const trainerName = session.trainer?.user
                ? `${session.trainer.user.firstName || ''} ${session.trainer.user.lastName || ''}`.trim()
                : session.trainer?.name || '-';
              return (
                <Table.Row key={session.id}>
                  <Table.Cell>{session.topic || session.sessionType || '-'}</Table.Cell>
                  <Table.Cell>{session.date ? new Date(session.date).toLocaleDateString() : '-'}</Table.Cell>
                  <Table.Cell>{session.startTime || '-'} - {session.endTime || '-'}</Table.Cell>
                  <Table.Cell>{session.batch?.name || session.batch?.code || '-'}</Table.Cell>
                  <Table.Cell>{trainerName}</Table.Cell>
                  <Table.Cell>{session.module?.name || '-'}</Table.Cell>
                  <Table.Cell><StatusBadge status={session.status || 'SCHEDULED'} /></Table.Cell>
                  {canManage && (
                    <Table.Cell>
                      <Link to={`${base}/sessions/${session.id}/edit`}>
                        <Button variant="ghost" size="sm" className="text-indigo-600" icon={<Pencil size={16} />}>Edit</Button>
                      </Link>
                    </Table.Cell>
                  )}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
