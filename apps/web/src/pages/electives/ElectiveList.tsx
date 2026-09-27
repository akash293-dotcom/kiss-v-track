import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function ElectiveList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: electives, isLoading } = useQuery({
    queryKey: ['electives', searchTerm, categoryFilter],
    queryFn: async () => {
      return [
        { id: '1', code: 'WEB101', name: 'Web Development Basics', category: 'IT', status: 'ACTIVE', duration: '12 weeks' },
        { id: '2', code: 'NURS200', name: 'Advanced Nursing', category: 'Healthcare', status: 'ACTIVE', duration: '24 weeks' },
      ];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Electives</h1>
          <p className="mt-1 text-sm text-gray-500">Manage training programs and electives</p>
        </div>
        <Link to="/admin/electives/new">
          <Button icon={<Plus size={16} />}>Add Elective</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-64">
          <SearchInput onSearch={setSearchTerm} placeholder="Search electives..." />
        </div>
        <div className="w-full sm:w-48">
          <Select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { label: 'All Categories', value: '' },
              { label: 'IT', value: 'IT' },
              { label: 'Healthcare', value: 'Healthcare' }
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {electives?.map((elective) => (
            <Card key={elective.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link to={`/admin/electives/${elective.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {elective.code}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-gray-900">{elective.name}</h3>
                  </div>
                  <StatusBadge status={elective.status} />
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Category: {elective.category}</p>
                  <p>Duration: {elective.duration}</p>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
