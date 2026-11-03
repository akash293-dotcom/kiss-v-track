import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function TaskList() {
  const { user } = useAuth();
  const base = user?.role === 'TRAINEE' ? '/trainee' : '/trainer';
  const { data: tasks = [], isLoading, isError, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks');
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
  });

  return <div className="space-y-6"><div className="flex flex-wrap justify-between items-center gap-3"><div><h1 className="text-2xl font-bold">Practical tasks</h1><p className="mt-1 text-sm text-gray-500">Assignments, trainee submissions and reviews</p></div>{user?.role === 'TRAINER' && <Link to="/trainer/tasks/new"><Button icon={<Plus size={16}/>}>Create task</Button></Link>}</div>
    <Card title="Task register" description={`${tasks.length} task(s)`}>{isLoading ? <div className="py-8 flex justify-center"><LoadingSpinner/></div> : isError ? <p className="text-red-600 text-sm">{(error as any)?.response?.data?.error?.message || 'Unable to load tasks.'}</p> : tasks.length === 0 ? <p className="py-8 text-center text-gray-500">No tasks available.</p> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{['Task','Trainer','Deadline','Submissions','Status',''].map((x)=><th key={x} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{x}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{tasks.map((task: any)=><tr key={task.id}><td className="px-4 py-3 text-sm font-medium">{task.title}</td><td className="px-4 py-3 text-sm">{task.trainer?.user ? `${task.trainer.user.firstName} ${task.trainer.user.lastName}` : '—'}</td><td className="px-4 py-3 text-sm">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</td><td className="px-4 py-3 text-sm">{task._count?.submissions ?? task.submissions?.length ?? 0}</td><td className="px-4 py-3"><Badge color={task.status === 'ACTIVE' || task.status === 'PUBLISHED' ? 'green' : 'gray'}>{task.status}</Badge></td><td className="px-4 py-3"><Link className="text-indigo-600" to={`${base}/tasks/${task.id}`} aria-label="View task"><Eye size={17}/></Link></td></tr>)}</tbody></table></div>}</Card>
  </div>;
}
