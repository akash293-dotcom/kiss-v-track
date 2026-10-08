import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import api from '../../lib/api';

export default function TraineeList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['trainees', searchTerm, page],
    queryFn: async () => {
      const response = await api.get('/trainees', {
        params: {
          search: searchTerm || undefined,
          page,
          limit: 10
        }
      });

      return response.data?.data || {
        total: 0,
        page: 1,
        limit: 10,
        trainees: []
      };
    }
  });

  const trainees = data?.trainees || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const getStatus = (trainee: any) => {
    if (trainee.enrollmentStatus) {
      return trainee.enrollmentStatus;
    }

    if (trainee.status) {
      return trainee.status;
    }

    if (trainee.user?.isActive === false) {
      return 'INACTIVE';
    }

    return 'ACTIVE';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Trainees
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage trainees
          </p>
        </div>

        <Button
          icon={<Plus size={16} />}
          onClick={() => navigate('/admin/trainees/new')}
        >
          Add Trainee
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 w-full max-w-md">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Search trainees..."
          />
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-red-600">
            Failed to load trainees.

            <div className="text-sm mt-2">
              {(error as any)?.response?.data?.message ||
                'Please try again.'}
            </div>
          </div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Trainee</Table.Head>
                  <Table.Head>Student ID</Table.Head>
                  <Table.Head>Campus</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {trainees.length > 0 ? (
                  trainees.map((trainee: any) => {
                    const fullName = `${trainee.user?.firstName || ''} ${trainee.user?.lastName || ''}`.trim();

                    return (
                      <Table.Row key={trainee.id}>
                        <Table.Cell>
                          <div className="flex items-center">
                            <Avatar name={fullName || 'Trainee'} />

                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {fullName || 'Unnamed Trainee'}
                              </p>

                              <p className="text-sm text-gray-500">
                                {trainee.user?.email || '-'}
                              </p>
                            </div>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          {trainee.studentId || '-'}
                        </Table.Cell>

                        <Table.Cell>
                          {trainee.campus?.name || '-'}
                        </Table.Cell>

                        <Table.Cell>
                          <StatusBadge
                            status={getStatus(trainee)}
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-indigo-600"
                              onClick={() =>
                                navigate(
                                  `/admin/trainees/${trainee.id}`
                                )
                              }
                              aria-label={`View ${fullName}`}
                            >
                              <Eye size={16} />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-gray-600"
                              onClick={() =>
                                navigate(
                                  `/admin/trainees/${trainee.id}/edit`
                                )
                              }
                              aria-label={`Edit ${fullName}`}
                            >
                              <Edit size={16} />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={5}>
                      <div className="py-10 text-center text-gray-500">
                        No trainees found.
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>

            <Pagination
              currentPage={data?.page || page}
              totalPages={
                Math.ceil(
                  (data?.total || 0) /
                  (data?.limit || 10)
                ) || 1
              }
              onPageChange={setPage}
              totalItems={data?.total || 0}
              itemsPerPage={data?.limit || 10}
            />
          </>
        )}
      </div>
    </div>
  );
}