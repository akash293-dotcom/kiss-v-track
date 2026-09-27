import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function SkillList() {
  const { data } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => [{ id: '1', name: 'React', category: 'IT', status: 'ACTIVE' }]
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
        <Link to="/admin/skills/new"><Button icon={<Plus size={16}/>}>Add Skill</Button></Link>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Category</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.map(s => (
              <Table.Row key={s.id}>
                <Table.Cell>{s.name}</Table.Cell>
                <Table.Cell>{s.category}</Table.Cell>
                <Table.Cell><StatusBadge status={s.status} /></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
