import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';

export default function SessionList() {
  const { data } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => [{ id: '1', title: 'Intro to React', date: '2023-10-01', batch: 'B2023-01' }]
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <Link to="/admin/sessions/new"><Button icon={<Plus size={16}/>}>Add Session</Button></Link>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Title</Table.Head>
              <Table.Head>Date</Table.Head>
              <Table.Head>Batch</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.map(s => (
              <Table.Row key={s.id}>
                <Table.Cell>{s.title}</Table.Cell>
                <Table.Cell>{s.date}</Table.Cell>
                <Table.Cell>{s.batch}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
