import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, Pencil } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function BatchList() {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'CENTRE_ADMIN';
  const base = user?.role === 'TRAINER' ? '/trainer' : user?.role === 'TRAINEE' ? '/trainee' : '/admin';
  const { data: batches = [], isLoading, isError, error } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await api.get('/batches');
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
  });

  return <div className="space-y-6"><div className="flex flex-wrap justify-between items-center gap-3"><div><h1 className="text-2xl font-bold text-gray-900">Training batches</h1><p className="text-sm text-gray-500 mt-1">Programs, trainers, campuses and enrollment</p></div>{canManage && <Link to="/admin/batches/new"><Button icon={<Plus size={16}/>}>Add batch</Button></Link>}</div>
    <Card title="Batch register" description={`${batches.length} batch(es)`}>{isLoading ? <div className="py-8 flex justify-center"><LoadingSpinner/></div> : isError ? <p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message||'Unable to load batches.'}</p> : batches.length===0 ? <p className="py-8 text-center text-gray-500">No batches found.</p> : <Table><Table.Header><Table.Row><Table.Head>Code</Table.Head><Table.Head>Batch</Table.Head><Table.Head>Program</Table.Head><Table.Head>Campus</Table.Head><Table.Head>Trainer</Table.Head><Table.Head>Dates</Table.Head><Table.Head>Enrollment</Table.Head><Table.Head>Status</Table.Head><Table.Head>Actions</Table.Head></Table.Row></Table.Header><Table.Body>{batches.map((batch:any)=><Table.Row key={batch.id}><Table.Cell className="font-medium">{batch.code}</Table.Cell><Table.Cell>{batch.name}</Table.Cell><Table.Cell>{batch.elective?.name||'—'}</Table.Cell><Table.Cell>{batch.campus?.name||'—'}</Table.Cell><Table.Cell>{batch.trainer?.user ? `${batch.trainer.user.firstName} ${batch.trainer.user.lastName}` : 'Unassigned'}</Table.Cell><Table.Cell>{new Date(batch.startDate).toLocaleDateString()} – {new Date(batch.endDate).toLocaleDateString()}</Table.Cell><Table.Cell>{batch._count?.enrollments??0}/{batch.capacity}</Table.Cell><Table.Cell><StatusBadge status={batch.status}/></Table.Cell><Table.Cell><div className="flex gap-2"><Link className="text-indigo-600" to={`${base}/batches/${batch.id}`} aria-label="View batch"><Eye size={16}/></Link>{canManage&&<Link className="text-indigo-600" to={`/admin/batches/${batch.id}/edit`} aria-label="Edit batch"><Pencil size={16}/></Link>}</div></Table.Cell></Table.Row>)}</Table.Body></Table>}</Card>
  </div>;
}
