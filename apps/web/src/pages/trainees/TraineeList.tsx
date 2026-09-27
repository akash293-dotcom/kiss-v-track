import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';

export default function TraineeList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['trainees', searchTerm, page],
    queryFn: async () => {
      // Mock data
      const items = Array.from({ length: 10 }).map((_, i) => ({
        id: `TRN${i}`,
        firstName: `Trainee ${i}`,
        lastName: 'Student',
        email: `trainee${i}@example.com`,
        studentId: `STU00${i}`,
        campus: 'Main Campus',
        status: 'ACTIVE'
      }));
      return { data: items, meta: { total: 50, page, lastPage: 5 } };
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainees</h1>
        </div>
        <Link to="/admin/trainees/new">
          <Button icon={<Plus size={16} />}>Add Trainee</Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 w-full max-w-md">
          <SearchInput onSearch={setSearchTerm} placeholder="Search trainees..." />
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner /></div>
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
                {data?.data.map((trainee) => (
                  <Table.Row key={trainee.id}>
                    <Table.Cell>
                      <div className="flex items-center">
                        <Avatar name={`${trainee.firstName} ${trainee.lastName}`} />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{trainee.firstName} {trainee.lastName}</p>
                          <p className="text-sm text-gray-500">{trainee.email}</p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{trainee.studentId}</Table.Cell>
                    <Table.Cell>{trainee.campus}</Table.Cell>
                    <Table.Cell><StatusBadge status={trainee.status} /></Table.Cell>
                    <Table.Cell>
                      <div className="flex space-x-2">
                        <Link to={`/admin/trainees/${trainee.id}`}>
                          <Button variant="ghost" size="sm" className="text-indigo-600"><Eye size={16} /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-gray-600"><Edit size={16} /></Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <Pagination 
              currentPage={page} 
              totalPages={data?.meta.lastPage || 1} 
              onPageChange={setPage} 
              totalItems={data?.meta.total}
              itemsPerPage={10}
            />
          </>
        )}
      </div>
    </div>
  );
}
