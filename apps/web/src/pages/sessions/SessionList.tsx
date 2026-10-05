import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

export default function SessionList() {
  const {
    data: sessions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await api.get('/sessions');

      const data = response.data?.data;

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data?.sessions)) {
        return data.sessions;
      }

      if (Array.isArray(data?.data)) {
        return data.data;
      }

      if (Array.isArray(data?.items)) {
        return data.items;
      }

      return [];
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load sessions.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Training Sessions
        </h1>

        <Link to="/admin/sessions/new">
          <Button icon={<Plus size={16} />}>
            Add Session
          </Button>
        </Link>
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
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {sessions.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={8}>
                  <div className="text-center py-6 text-gray-500">
                    No sessions found.
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : (
              sessions.map((session: any) => {
                const trainerName = session.trainer?.user
                  ? `${session.trainer.user.firstName || ''} ${session.trainer.user.lastName || ''}`.trim()
                  : session.trainer?.name || '-';

                const batchName =
                  session.batch?.name ||
                  session.batch?.code ||
                  session.batchId ||
                  '-';

                const moduleName =
                  session.module?.name ||
                  session.module?.code ||
                  '-';

                const date = session.date
                  ? new Date(session.date).toLocaleDateString()
                  : '-';

                return (
                  <Table.Row key={session.id}>
                    <Table.Cell>
                      {session.topic || '-'}
                    </Table.Cell>

                    <Table.Cell>
                      {date}
                    </Table.Cell>

                    <Table.Cell>
                      {session.startTime || '-'} - {session.endTime || '-'}
                    </Table.Cell>

                    <Table.Cell>
                      {batchName}
                    </Table.Cell>

                    <Table.Cell>
                      {trainerName}
                    </Table.Cell>

                    <Table.Cell>
                      {moduleName}
                    </Table.Cell>

                    <Table.Cell>
                      <StatusBadge
                        status={session.status || 'SCHEDULED'}
                      />
                    </Table.Cell>

                    <Table.Cell>
                      <Link
                        to={`/admin/sessions/${session.id}/edit`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600"
                          icon={<Pencil size={16} />}
                        >
                          Edit
                        </Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}