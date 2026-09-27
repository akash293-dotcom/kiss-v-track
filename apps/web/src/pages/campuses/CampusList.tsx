import React, { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function CampusList() {
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['campuses', searchTerm],

    queryFn: async () => {
      const response = await api.get('/campuses', {
        params: {
          search: searchTerm || undefined,
          page: 1,
          limit: 100,
        },
      });

      return response.data.data || [];
    },

    refetchOnWindowFocus: true,
  });

  const campuses = data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/campuses/${id}`);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['campuses'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['adminDashboard'],
      });
    },

    onError: (error: any) => {
      alert(
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to delete campus'
      );
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete "${name}"?`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Campuses
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage all campus locations
          </p>
        </div>

        <Link to="/admin/campuses/new">
          <Button icon={<Plus size={16} />}>
            Add Campus
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">

        <div className="mb-6 w-full max-w-md">
          <SearchInput
            onSearch={setSearchTerm}
            placeholder="Search campuses..."
          />
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <Table>

            <Table.Header>
              <Table.Row>
                <Table.Head>Code</Table.Head>
                <Table.Head>Name</Table.Head>
                <Table.Head>City</Table.Head>
                <Table.Head>State</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {campuses.map((campus: any) => (
                <Table.Row key={campus.id}>

                  <Table.Cell className="font-medium text-gray-900">
                    {campus.code}
                  </Table.Cell>

                  <Table.Cell>
                    {campus.name}
                  </Table.Cell>

                  <Table.Cell>
                    {campus.city || '-'}
                  </Table.Cell>

                  <Table.Cell>
                    {campus.state || '-'}
                  </Table.Cell>

                  <Table.Cell>
                    <StatusBadge
                      status={
                        campus.isActive
                          ? 'ACTIVE'
                          : 'INACTIVE'
                      }
                    />
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex space-x-2">

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600"
                        onClick={() =>
                          navigate(
                            `/admin/campuses/${campus.id}/edit`
                          )
                        }
                      >
                        <Edit size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          handleDelete(
                            campus.id,
                            campus.name
                          )
                        }
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={16} />
                      </Button>

                    </div>
                  </Table.Cell>

                </Table.Row>
              ))}

            </Table.Body>

          </Table>
        )}

      </div>
    </div>
  );
}