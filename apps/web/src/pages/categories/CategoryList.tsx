import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import api from '../../lib/api';

export default function CategoryList() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: categories,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data?.data || [];
    }
  });

  const filteredCategories = categories?.filter((cat: any) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/categories/${id}`);

      alert('Category deleted successfully.');

      await queryClient.invalidateQueries({
        queryKey: ['categories']
      });
    } catch (error: any) {
      console.error('Delete category error:', error);

      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        'Failed to delete category.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Categories
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage training categories
          </p>
        </div>

        <Button
          icon={<Plus size={16} />}
          onClick={() => navigate('/admin/categories/new')}
        >
          Add Category
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 w-full max-w-md">
          <SearchInput
            onSearch={setSearchTerm}
            placeholder="Search categories..."
          />
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-red-600">
            Failed to load categories.

            <div className="text-sm mt-2">
              {(error as any)?.response?.data?.message ||
                'Please try again.'}
            </div>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Code</Table.Head>
                <Table.Head>Name</Table.Head>
                <Table.Head>Description</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {filteredCategories?.length ? (
                filteredCategories.map((cat: any) => (
                  <Table.Row key={cat.id}>
                    <Table.Cell className="font-medium text-gray-900">
                      {cat.code}
                    </Table.Cell>

                    <Table.Cell>
                      {cat.name}
                    </Table.Cell>

                    <Table.Cell>
                      {cat.description || '-'}
                    </Table.Cell>

                    <Table.Cell>
                      <StatusBadge
                        status={
                          cat.isActive
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
                              `/admin/categories/${cat.id}/edit`
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
                            handleDelete(cat.id, cat.name)
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={5}>
                    <div className="py-8 text-center text-gray-500">
                      No categories found.
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
}