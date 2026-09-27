import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function BatchList() {
  const { data } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => [{ id: '1', code: 'B2023-01', course: 'Web Dev', startDate: '2023-01-01', status: 'ACTIVE' }]
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
        <Link to="/admin/batches/new"><Button icon={<Plus size={16}/>}>Add Batch</Button></Link>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Code</Table.Head>
              <Table.Head>Course</Table.Head>
              <Table.Head>Start Date</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.map(b => (
              <Table.Row key={b.id}>
                <Table.Cell>{b.code}</Table.Cell>
                <Table.Cell>{b.course}</Table.Cell>
                <Table.Cell>{b.startDate}</Table.Cell>
                <Table.Cell><StatusBadge status={b.status} /></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
