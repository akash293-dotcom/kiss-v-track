import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function TrainerDetail() {
  const {id=''}=useParams();
  const {user}=useAuth();
  const {data:trainer,isLoading,isError,error}=useQuery({queryKey:['trainer',id],queryFn:async()=>(await api.get(`/trainers/${id}`)).data?.data,enabled:Boolean(id)});
  const {data:batches=[]}=useQuery({queryKey:['trainer-batches',id],queryFn:async()=>(await api.get(`/trainers/${id}/batches`)).data?.data||[],enabled:Boolean(id)});
  if(isLoading)return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  if(isError||!trainer)return <Card title="Trainer unavailable"><p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message||'Unable to load trainer profile.'}</p><Link to="/admin/trainers" className="text-indigo-600">Back to trainers</Link></Card>;
  const displayName=`${trainer.user?.firstName||''} ${trainer.user?.lastName||''}`.trim();
  const canEdit=user?.role==='ADMIN'||user?.role==='CENTRE_ADMIN';
  return <div className="space-y-6"><div className="flex flex-wrap justify-between items-center gap-3"><div><h1 className="text-2xl font-bold">{displayName||trainer.employeeId}</h1><p className="text-sm text-gray-500">{trainer.employeeId}</p></div><div className="flex gap-2"><Link to={user?.role==='TRAINER'?'/trainer/batches':'/admin/trainers'}><Button variant="ghost">Back</Button></Link>{canEdit&&<Link to={`/admin/trainers/${id}/edit`}><Button>Edit trainer</Button></Link>}</div></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card title="Account status"><Badge color={trainer.isActive&&trainer.user?.isActive?'green':'red'}>{trainer.isActive&&trainer.user?.isActive?'Active':'Inactive'}</Badge><p className="text-sm text-gray-500 mt-2">{trainer.campus?.name||'No campus'}</p></Card><Card title="Specialization"><p className="font-semibold">{trainer.specialization||'Not provided'}</p><p className="text-sm text-gray-500 mt-1">{trainer.qualification||'No qualification listed'}</p></Card><Card title="Experience"><p className="text-2xl font-bold">{trainer.experience||'—'}</p><p className="text-xs text-gray-500 mt-1">Experience (as recorded)</p></Card></div>
    <Card title="Contact details"><dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div><dt className="text-gray-500">Email</dt><dd className="font-medium">{trainer.user?.email||'—'}</dd></div><div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{trainer.user?.phone||'—'}</dd></div><div><dt className="text-gray-500">Employee ID</dt><dd className="font-medium">{trainer.employeeId}</dd></div><div><dt className="text-gray-500">Campus</dt><dd className="font-medium">{trainer.campus?.name||'—'}</dd></div></dl></Card>
    <Card title="Assigned batches" description={`${batches.length} batch(es)`}>{batches.length?<div className="overflow-x-auto"><table className="min-w-full"><thead><tr>{['Batch','Program','Period','Status'].map(x=><th key={x} className="text-left text-xs uppercase text-gray-500 px-3 py-2">{x}</th>)}</tr></thead><tbody className="divide-y">{batches.map((b:any)=><tr key={b.id}><td className="px-3 py-2 text-sm"><Link to={`/admin/batches/${b.id}`} className="text-indigo-600">{b.name} ({b.code})</Link></td><td className="px-3 py-2 text-sm">{b.elective?.name||'—'}</td><td className="px-3 py-2 text-sm">{new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}</td><td className="px-3 py-2 text-sm">{b.status}</td></tr>)}</tbody></table></div>:<p className="py-4 text-sm text-gray-500">No batches are currently assigned.</p>}</Card>
  </div>;
}
