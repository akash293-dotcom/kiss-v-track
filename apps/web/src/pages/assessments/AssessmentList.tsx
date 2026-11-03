import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function AssessmentList() {
  const { user } = useAuth();
  const { data: assessments = [], isLoading, isError, error } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => { const response = await api.get('/assessments'); return Array.isArray(response.data?.data) ? response.data.data : []; },
  });
  return <div className="space-y-6"><div className="flex flex-wrap justify-between items-center gap-3"><div><h1 className="text-2xl font-bold">Assessments</h1><p className="mt-1 text-sm text-gray-500">Assessment records and trainee results</p></div>{user?.role === 'TRAINER' && <Link to="/trainer/assessments/new"><Button icon={<Plus size={16}/>}>New assessment</Button></Link>}</div>
    <Card title="Assessment register" description={`${assessments.length} record(s)`}>{isLoading ? <div className="py-8 flex justify-center"><LoadingSpinner/></div> : isError ? <p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message||'Unable to load assessments.'}</p> : assessments.length === 0 ? <p className="py-8 text-center text-gray-500">No assessment records found.</p> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{['Assessment','Trainee','Type','Score','Result','Date'].map(x=><th key={x} className="px-4 py-3 text-left text-xs uppercase font-semibold text-gray-500">{x}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{assessments.map((a:any)=><tr key={a.id}><td className="px-4 py-3 text-sm font-medium">{a.title}</td><td className="px-4 py-3 text-sm">{a.trainee?.user ? `${a.trainee.user.firstName} ${a.trainee.user.lastName}`:'—'}</td><td className="px-4 py-3 text-sm">{a.type}</td><td className="px-4 py-3 text-sm">{a.score == null ? '—' : `${a.score}/${a.maxScore}`}</td><td className="px-4 py-3"><Badge color={a.result==='PASS'||a.result==='MERIT'||a.result==='DISTINCTION'?'green':a.result==='FAIL'?'red':'gray'}>{a.result}</Badge></td><td className="px-4 py-3 text-sm">{new Date(a.assessedAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</Card>
  </div>;
}
