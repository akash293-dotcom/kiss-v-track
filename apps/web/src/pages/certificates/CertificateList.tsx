import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, Plus, Eye } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

export default function CertificateList() {
  const { user } = useAuth();
  const canIssue = user?.role === 'ADMIN' || user?.role === 'CENTRE_ADMIN';
  const { data: certificates = [], isLoading, isError, error } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const response = await api.get('/certificates', { params: { page: 1, limit: 100 } });
      return response.data?.data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-gray-900">Certificates</h1><p className="text-sm text-gray-500 mt-1">Issued credentials and verification records</p></div>
        {canIssue && <Link to="/admin/certificates/issue"><Button icon={<Plus size={16} />}>Issue certificate</Button></Link>}
      </div>
      <Card title="Certificate register" description={`${certificates.length} certificate(s)`}>
        {isLoading ? <div className="py-8 flex justify-center"><LoadingSpinner /></div> :
          isError ? <p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message || 'Unable to load certificates.'}</p> :
          certificates.length === 0 ? <div className="py-10 text-center text-gray-500"><Award className="mx-auto mb-2" /><p>No certificates found.</p></div> :
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{['Certificate No.','Trainee','Title','Issue date','Status',''].map(x=><th key={x} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{x}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">
            {certificates.map((item: any)=><tr key={item.id}><td className="px-4 py-3 text-sm font-medium">{item.certificateNo}</td><td className="px-4 py-3 text-sm">{item.trainee?.user ? `${item.trainee.user.firstName} ${item.trainee.user.lastName}` : item.traineeId}</td><td className="px-4 py-3 text-sm">{item.title}</td><td className="px-4 py-3 text-sm">{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '—'}</td><td className="px-4 py-3"><Badge color={item.status === 'ISSUED' ? 'green' : item.status === 'REVOKED' ? 'red' : 'gray'}>{item.status}</Badge></td><td className="px-4 py-3"><Link className="text-indigo-600 hover:text-indigo-800" to={`/admin/certificates/${item.id}`} aria-label="View certificate"><Eye size={17}/></Link></td></tr>)}
          </tbody></table></div>}
      </Card>
    </div>
  );
}
