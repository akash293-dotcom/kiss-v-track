import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function BatchDetail() {
  const {id=''}=useParams();
  const {user}=useAuth();
  const base=user?.role==='TRAINER'?'/trainer':user?.role==='TRAINEE'?'/trainee':'/admin';
  const {data:batch,isLoading}=useQuery({queryKey:['batch',id],queryFn:async()=>(await api.get(`/batches/${id}`)).data?.data,enabled:Boolean(id)});
  const {data:enrollments=[]}=useQuery({queryKey:['batch-enrollments',id],queryFn:async()=>(await api.get(`/batches/${id}/enrollments`)).data?.data||[],enabled:Boolean(id)});
  const {data:sessions=[]}=useQuery({queryKey:['batch-sessions',id],queryFn:async()=>(await api.get(`/batches/${id}/sessions`)).data?.data||[],enabled:Boolean(id)});
  if(isLoading)return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  if(!batch)return <Card title="Batch unavailable"><p className="text-gray-600">The batch could not be loaded or you do not have access.</p><Link to={`${base}/batches`} className="text-indigo-600">Back to batches</Link></Card>;
  return <div className="space-y-6"><div className="flex flex-wrap justify-between items-center gap-3"><div><h1 className="text-2xl font-bold">{batch.name}</h1><p className="text-sm text-gray-500">{batch.code}</p></div><div className="flex gap-2"><Link to={`${base}/batches`}><Button variant="ghost">Back</Button></Link>{(user?.role==='ADMIN'||user?.role==='CENTRE_ADMIN')&&<Link to={`/admin/batches/${id}/edit`}><Button>Edit batch</Button></Link>}</div></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card title="Program"><p className="font-semibold">{batch.elective?.name||'—'}</p><p className="text-sm text-gray-500">{batch.campus?.name||'—'}</p></Card><Card title="Trainer"><p className="font-semibold">{batch.trainer?.user?`${batch.trainer.user.firstName} ${batch.trainer.user.lastName}`:'Unassigned'}</p></Card><Card title="Schedule"><p className="font-semibold">{new Date(batch.startDate).toLocaleDateString()} – {new Date(batch.endDate).toLocaleDateString()}</p><Badge color={batch.status==='ACTIVE'?'green':'gray'}>{batch.status}</Badge></Card></div>
    <Card title="Enrollment" description={`${enrollments.length} enrollee(s), capacity ${batch.capacity}`}>{enrollments.length? <div className="overflow-x-auto"><table className="min-w-full"><thead><tr>{['Student ID','Trainee','Status','Enrolled'].map(x=><th key={x} className="text-left text-xs text-gray-500 uppercase px-3 py-2">{x}</th>)}</tr></thead><tbody className="divide-y">{enrollments.map((e:any)=><tr key={e.id}><td className="px-3 py-2 text-sm">{e.trainee?.studentId}</td><td className="px-3 py-2 text-sm">{e.trainee?.user?`${e.trainee.user.firstName} ${e.trainee.user.lastName}`:'—'}</td><td className="px-3 py-2 text-sm">{e.status}</td><td className="px-3 py-2 text-sm">{new Date(e.enrollmentDate).toLocaleDateString()}</td></tr>)}</tbody></table></div>:<p className="text-sm text-gray-500 py-4">No enrollments found.</p>}</Card>
    <Card title="Training sessions" description={`${sessions.length} session(s)`}>{sessions.length?<div className="overflow-x-auto"><table className="min-w-full"><thead><tr>{['Date','Topic','Trainer','Duration','Status'].map(x=><th key={x} className="text-left text-xs text-gray-500 uppercase px-3 py-2">{x}</th>)}</tr></thead><tbody className="divide-y">{sessions.map((s:any)=><tr key={s.id}><td className="px-3 py-2 text-sm">{new Date(s.date).toLocaleDateString()} {s.startTime}</td><td className="px-3 py-2 text-sm">{s.topic||s.sessionType}</td><td className="px-3 py-2 text-sm">{s.trainer?.user?`${s.trainer.user.firstName} ${s.trainer.user.lastName}`:'—'}</td><td className="px-3 py-2 text-sm">{s.durationMin} min</td><td className="px-3 py-2 text-sm">{s.status}</td></tr>)}</tbody></table></div>:<p className="text-sm text-gray-500 py-4">No sessions scheduled.</p>}</Card>
  </div>;
}
