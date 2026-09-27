import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function CategoryList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', searchTerm],
    queryFn: async () => {
      return [
        { id: '1', code: 'IT', name: 'Information Technology', description: 'Software and Hardware', status: 'ACTIVE' },
        { id: '2', code: 'HC', name: 'Healthcare', description: 'Nursing and care', status: 'ACTIVE' },
      ].filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">Manage training categories</p>
        </div>
        <Link to="/admin/categories/new">
          <Button icon={<Plus size={16} />}>Add Category</Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 w-full max-w-md">
          <SearchInput onSearch={setSearchTerm} placeholder="Search categories..." />
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner /></div>
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
              {categories?.map((cat) => (
                <Table.Row key={cat.id}>
                  <Table.Cell className="font-medium text-gray-900">{cat.code}</Table.Cell>
                  <Table.Cell>{cat.name}</Table.Cell>
                  <Table.Cell>{cat.description}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge status={cat.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-indigo-600">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
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
