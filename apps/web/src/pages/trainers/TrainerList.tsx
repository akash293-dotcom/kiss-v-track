import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

export default function TrainerList() {
  const {
    data: trainers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const response = await api.get('/trainers');
      return response.data?.data?.trainers || [];
    },
    refetchOnMount: 'always',
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
        Failed to load trainers.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Trainers
        </h1>

        <Link to="/admin/trainers/new">
          <Button icon={<Plus size={16} />}>
            Add Trainer
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Employee ID</Table.Head>
              <Table.Head>Specialization</Table.Head>
              <Table.Head>Campus</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {trainers.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6}>
                  <div className="text-center py-6 text-gray-500">
                    No trainers found.
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : (
              trainers.map((trainer: any) => {
                const name = trainer.user
                  ? `${trainer.user.firstName || ''} ${trainer.user.lastName || ''}`.trim()
                  : trainer.name || trainer.id;

                return (
                  <Table.Row key={trainer.id}>
                    <Table.Cell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {name}
                        </div>
                        {trainer.user?.email && (
                          <div className="text-sm text-gray-500">
                            {trainer.user.email}
                          </div>
                        )}
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      {trainer.employeeId || '-'}
                    </Table.Cell>

                    <Table.Cell>
                      {trainer.specialization || '-'}
                    </Table.Cell>

                    <Table.Cell>
                      {trainer.campus?.name || '-'}
                    </Table.Cell>

                    <Table.Cell>
                      <StatusBadge
                        status={trainer.isActive ? 'ACTIVE' : 'INACTIVE'}
                      />
                    </Table.Cell>

                    <Table.Cell>
                      <Link to={`/admin/trainers/${trainer.id}/edit`}>
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