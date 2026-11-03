import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function CertificateDetail() {
  const { id = '' } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['certificate', id],
    queryFn: async () => (await api.get(`/certificates/${id}`)).data?.data,
    enabled: Boolean(id),
  });
  if (isLoading) return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  if (isError || !data) return <Card title="Certificate unavailable"><p className="text-red-600">{(error as any)?.response?.data?.error?.message || 'Unable to load certificate.'}</p><Link className="text-indigo-600" to="/admin/certificates">Back to certificates</Link></Card>;

  const verificationUrl = `${window.location.origin}/verify/certificate/${encodeURIComponent(data.certificateNo)}`;
  return <div className="max-w-3xl mx-auto space-y-5"><div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Certificate details</h1><Link to="/admin/certificates" className="text-sm text-indigo-600">Back to register</Link></div><Card title={data.title} description={data.certificateNo}><div className="space-y-4"><Badge color={data.status === 'ISSUED' ? 'green' : 'red'}>{data.status}</Badge><dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">{[['Trainee', data.trainee ? `${data.trainee.user?.firstName || ''} ${data.trainee.user?.lastName || ''}` : '—'],['Email',data.trainee?.user?.email || '—'],['Training period',data.trainingPeriod || '—'],['Training hours',data.trainingHours ?? '—'],['Issue date',data.issueDate ? new Date(data.issueDate).toLocaleDateString() : '—'],['Signatory',data.signatory || '—']].map(([label,value])=><div key={label}><dt className="text-gray-500">{label}</dt><dd className="font-medium text-gray-900">{value}</dd></div>)}</dl><p className="text-sm text-gray-600">{data.description}</p><a href={verificationUrl} target="_blank" rel="noreferrer"><Button icon={<ExternalLink size={16}/>} variant="secondary">Open public verification page</Button></a></div></Card></div>;
}
