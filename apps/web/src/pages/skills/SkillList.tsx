import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface SkillRecord {
  id: string;
  code: string;
  name: string;
  difficulty: string;
  isActive: boolean;
  category?: { name: string } | null;
}

export default function SkillList() {
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const { data: skills = [], isLoading, isError, error } = useQuery<SkillRecord[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await api.get('/skills');
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
  });

  const visibleSkills = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return skills;
    return skills.filter((skill) => skill.name.toLowerCase().includes(term) || skill.code.toLowerCase().includes(term) || (skill.category?.name || '').toLowerCase().includes(term));
  }, [skills, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills Catalogue</h1>
          <p className="mt-1 text-sm text-gray-500">View the skills configured for vocational training programmes.</p>
        </div>
        {isAdmin && <Link to="/admin/skills/new"><Button icon={<Plus size={16} />}>Add Skill</Button></Link>}
      </div>

      <div className="max-w-md"><SearchInput onSearch={setSearch} placeholder="Search skills or category..." /></div>

      {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner /></div> : isError ? (
        <Card title="Unable to load skills"><p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message || 'Could not retrieve the skills catalogue.'}</p></Card>
      ) : visibleSkills.length === 0 ? (
        <Card><div className="flex flex-col items-center py-12 text-center"><ShieldCheck className="h-10 w-10 text-gray-300" /><h2 className="mt-3 font-semibold">No skills found</h2><p className="mt-1 text-sm text-gray-500">Try another search or add a skill as an administrator.</p></div></Card>
      ) : (
        <Card>
          <Table>
            <Table.Header><Table.Row><Table.Head>Code</Table.Head><Table.Head>Skill</Table.Head><Table.Head>Category</Table.Head><Table.Head>Difficulty</Table.Head><Table.Head>Status</Table.Head>{isAdmin && <Table.Head>Action</Table.Head>}</Table.Row></Table.Header>
            <Table.Body>
              {visibleSkills.map((skill) => (
                <Table.Row key={skill.id}>
                  <Table.Cell className="font-medium">{skill.code}</Table.Cell>
                  <Table.Cell>{skill.name}</Table.Cell>
                  <Table.Cell>{skill.category?.name || '—'}</Table.Cell>
                  <Table.Cell>{skill.difficulty.replace(/_/g, ' ')}</Table.Cell>
                  <Table.Cell><StatusBadge status={skill.isActive ? 'ACTIVE' : 'INACTIVE'} /></Table.Cell>
                  {isAdmin && <Table.Cell><Button size="sm" variant="ghost" onClick={() => navigate(`/admin/skills/${skill.id}/edit`)}>Edit</Button></Table.Cell>}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <p className="mt-3 text-xs text-gray-400">Showing {visibleSkills.length} of {skills.length} skills.</p>
        </Card>
      )}
    </div>
  );
}
