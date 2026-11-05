import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function ElectiveDetail() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['elective', id],
    queryFn: async () => (await api.get(`/electives/${id}`)).data?.data,
    enabled: Boolean(id),
  });

  const deactivateModule = useMutation({
    mutationFn: async (moduleId: string) => api.delete(`/modules/${moduleId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['elective', id] });
      toast.success('Module deactivated. Its history has been preserved.');
    },
    onError: (mutationError: any) => toast.error(
      mutationError?.response?.data?.error?.message ||
      mutationError?.response?.data?.message ||
      'Could not deactivate module'
    ),
  });

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size={32} /></div>;
  if (isError || !data) return <Card title="Program unavailable"><p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message || 'Unable to load this program.'}</p><Link to="/admin/electives" className="text-indigo-600">Back to programs</Link></Card>;

  const modules = data.modules || [];
  const rules = data.completionRules || [];

  const handleDeactivate = (module: any) => {
    if (!window.confirm(`Deactivate module "${module.name}"? Existing training records will be preserved.`)) return;
    deactivateModule.mutate(module.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">{data.name}</h1><p className="mt-1 text-sm text-gray-500">{data.code}</p></div>
        <div className="flex gap-2"><Link to="/admin/electives"><Button variant="ghost">Back</Button></Link><Link to={`/admin/electives/${id}/edit`}><Button icon={<Pencil size={16} />}>Edit program</Button></Link></div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Program status"><Badge color={data.status === 'ACTIVE' ? 'green' : 'gray'}>{data.status}</Badge><p className="mt-2 text-sm text-gray-500">{data.category?.name || 'Uncategorized'}</p></Card>
        <Card title="Duration"><p className="text-2xl font-bold">{data.durationWeeks ?? '—'} <span className="text-sm font-normal text-gray-500">weeks</span></p></Card>
        <Card title="Training hours"><p className="text-2xl font-bold">{data.totalTrainingHours ?? 0} <span className="text-sm font-normal text-gray-500">hours</span></p><p className="mt-1 text-xs text-gray-500">Theory {data.theoryHours ?? 0}h · Practical {data.practicalHours ?? 0}h</p></Card>
      </div>

      <Card title="Overview">
        <p className="whitespace-pre-wrap text-sm text-gray-700">{data.description || 'No description provided.'}</p>
        {data.objectives && <div className="mt-4"><h3 className="text-sm font-semibold">Objectives</h3><p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{data.objectives}</p></div>}
      </Card>

      <Card title="Modules" description={`${modules.length} module(s)`}>
        {isAdmin && <div className="mb-4 flex justify-end"><Link to={`/admin/electives/${id}/modules/new`}><Button icon={<Plus size={16} />}>Add module</Button></Link></div>}
        {modules.length ? (
          <div className="divide-y">
            {modules.map((module: any) => (
              <div key={module.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{module.sequenceOrder}. {module.name}</p>
                  <p className="text-xs text-gray-500">{module.description || 'No module description'}</p>
                  <p className="mt-1 text-xs text-gray-500">{(module.theoryHours || 0) + (module.practicalHours || 0)} training hours</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={module.isActive ? 'green' : 'gray'}>{module.isActive ? 'Active' : 'Inactive'}</Badge>
                  {isAdmin && <Link to={`/admin/electives/${id}/modules/${module.id}/edit`}><Button variant="ghost" size="sm" icon={<Pencil size={14} />}>Edit</Button></Link>}
                  {isAdmin && module.isActive && <Button type="button" variant="ghost" size="sm" icon={<Power size={14} />} disabled={deactivateModule.isPending} onClick={() => handleDeactivate(module)}>Deactivate</Button>}
                </div>
              </div>
            ))}
          </div>
        ) : <p className="py-4 text-sm text-gray-500">No modules have been added.</p>}
      </Card>

      <Card title="Completion requirements">
        {rules.length ? (
          <div className="space-y-3">
            {rules.map((rule: any) => (
              <div key={rule.id} className="flex items-start justify-between gap-3 border-b pb-2 last:border-0">
                <div><p className="text-sm font-medium">{String(rule.ruleType).replace(/_/g, ' ')}</p><p className="text-xs text-gray-500">{rule.description || '—'}</p></div>
                <div className="text-right"><p className="text-sm font-semibold">{rule.ruleValue}</p><Badge color={rule.isRequired ? 'blue' : 'gray'}>{rule.isRequired ? 'Required' : 'Optional'}</Badge></div>
              </div>
            ))}
          </div>
        ) : <p className="py-4 text-sm text-gray-500">No completion rules configured.</p>}
      </Card>
    </div>
  );
}
