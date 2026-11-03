import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, Layers, Award, CalendarCheck, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function ReportsPage() {
  const {data,isLoading,isError,error}=useQuery({queryKey:['institutionalReport'],queryFn:async()=>(await api.get('/reports/institutional')).data?.data});
  if(isLoading)return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  if(isError)return <Card title="Reports unavailable"><p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message||'Unable to load reports.'}</p></Card>;
  const summary=data?.summary||{};
  const cards=[['Trainees',summary.totalTrainees??0,Users],['Trainers',summary.totalTrainers??0,Building2],['Batches',summary.totalBatches??0,Layers],['Active batches',summary.activeBatches??0,CheckCircle2],['Certificates',summary.totalCertificates??0,Award],['Completed sessions',summary.completedSessions??0,CalendarCheck]];
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Institutional reports</h1><p className="mt-1 text-sm text-gray-500">Live totals from the KISS V-TRACK database.</p></div><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{cards.map(([label,value,Icon]:any)=><Card key={label}><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div><Icon size={24} className="text-indigo-600"/></div></Card>)}</div><Card title="Report metadata"><p className="text-sm text-gray-600">Scope: {data?.campusId?'Current campus':'All campuses'}</p><p className="text-sm text-gray-600 mt-1">Generated: {data?.generatedAt?new Date(data.generatedAt).toLocaleString():'—'}</p><p className="text-sm text-gray-600 mt-1">Recorded attendance entries: {summary.attendanceRecords??0}</p></Card></div>;
}
