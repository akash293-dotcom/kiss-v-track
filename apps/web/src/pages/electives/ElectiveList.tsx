import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, BookOpen } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface ElectiveRecord {
  id: string;
  code: string;
  name: string;
  status: string;
  durationWeeks?: number | null;
  totalTrainingHours: number;
  category?: { name: string } | null;
  _count?: { modules?: number };
}

export default function ElectiveList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: electives = [], isLoading, isError, error } = useQuery<ElectiveRecord[]>({
    queryKey: ['electives'],
    queryFn: async () => {
      const response = await api.get('/electives');
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    },
  });

  const filteredElectives = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return electives.filter((elective) => {
      const matchesSearch = !term ||
        elective.name.toLowerCase().includes(term) ||
        elective.code.toLowerCase().includes(term) ||
        (elective.category?.name || '').toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || elective.category?.name === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [electives, searchTerm, categoryFilter]);

  const categories = useMemo(() => [...new Set(electives.map((item) => item.category?.name).filter(Boolean))] as string[], [electives]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vocational Electives</h1>
          <p className="mt-1 text-sm text-gray-500">Manage vocational programmes, modules and completion requirements.</p>
        </div>
        <Link to="/admin/electives/new"><Button icon={<Plus size={16} />}>Add Elective</Button></Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <SearchInput onSearch={setSearchTerm} placeholder="Search by elective, code or category..." />
        <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} options={[
          { label: 'All categories', value: '' },
          ...categories.map((category) => ({ label: category, value: category })),
        ]} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : isError ? (
        <Card title="Unable to load electives"><p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message || 'Could not retrieve electives from the server.'}</p></Card>
      ) : filteredElectives.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-12 text-center">
            <BookOpen className="h-10 w-10 text-gray-300" />
            <h2 className="mt-3 font-semibold text-gray-900">No electives found</h2>
            <p className="mt-1 text-sm text-gray-500">Create an elective or change your search filters.</p>
            <Link to="/admin/electives/new" className="mt-4"><Button icon={<Plus size={16} />}>Add Elective</Button></Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredElectives.map((elective) => (
            <Card key={elective.id} className="transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{elective.code}</p>
                  <h2 className="mt-2 text-lg font-semibold text-gray-900">{elective.name}</h2>
                </div>
                <StatusBadge status={elective.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="mt-1 font-medium text-gray-800">{elective.category?.name || 'Unassigned'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Modules</p>
                  <p className="mt-1 font-medium text-gray-800">{elective._count?.modules ?? 0}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="mt-1 font-medium text-gray-800">{elective.durationWeeks ? `${elective.durationWeeks} weeks` : 'Not set'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Training hours</p>
                  <p className="mt-1 font-medium text-gray-800">{elective.totalTrainingHours} hrs</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-3">
                <Link to={`/admin/electives/${elective.id}`} className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">View programme details →</Link>
              </div>
            </Card>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400">Showing {filteredElectives.length} of {electives.length} electives.</p>
    </div>
  );
}
