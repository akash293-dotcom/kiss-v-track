import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function TrainerList() {
  const { data } = useQuery({
    queryKey: ['trainers'],
    queryFn: async () => [{ id: '1', name: 'John Doe', expertise: 'IT', status: 'ACTIVE' }]
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Trainers</h1>
        <Link to="/admin/trainers/new"><Button icon={<Plus size={16}/>}>Add Trainer</Button></Link>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Expertise</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.map(t => (
              <Table.Row key={t.id}>
                <Table.Cell>{t.name}</Table.Cell>
                <Table.Cell>{t.expertise}</Table.Cell>
                <Table.Cell><StatusBadge status={t.status} /></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
