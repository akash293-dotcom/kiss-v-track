import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, CheckCircle2, ClipboardList, Users } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function TrainerDashboard() {
  const {data,isLoading,isError,error}=useQuery({queryKey:['trainerDashboard'],queryFn:async()=>(await api.get('/dashboard/trainer')).data?.data,refetchOnWindowFocus:true});
  if(isLoading)return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  if(isError)return <Card title="Dashboard unavailable"><p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message||'Unable to load trainer dashboard.'}</p></Card>;
  const stats=[['Active batches',data?.activeBatches??0,Users],['Upcoming sessions',data?.upcomingSessions??0,CalendarClock],['Completed sessions',data?.completedSessions??0,CheckCircle2],['Pending task reviews',data?.pendingReviews??0,ClipboardList]];
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Trainer dashboard</h1><p className="mt-1 text-sm text-gray-500">Your training workload and upcoming activity.</p></div><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{stats.map(([label,value,Icon]:any)=><Card key={label}><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div><Icon className="text-indigo-600" size={24}/></div></Card>)}</div><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card title="My batches"><p className="text-sm text-gray-600">Review assigned batches and enrolled trainees.</p><Link className="inline-block mt-3 text-sm text-indigo-600" to="/trainer/batches">Open batches →</Link></Card><Card title="My sessions"><p className="text-sm text-gray-600">Review training schedule and mark attendance.</p><Link className="inline-block mt-3 text-sm text-indigo-600" to="/trainer/sessions">Open sessions →</Link></Card><Card title="Practical tasks"><p className="text-sm text-gray-600">Create tasks and review trainee submissions.</p><Link className="inline-block mt-3 text-sm text-indigo-600" to="/trainer/tasks">Open tasks →</Link></Card></div></div>;
}
