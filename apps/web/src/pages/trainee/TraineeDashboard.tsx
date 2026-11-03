import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, BookOpen, CalendarClock, CheckCircle2, ClipboardCheck, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function TraineeDashboard() {
  const {data,isLoading,isError,error}=useQuery({queryKey:['traineeDashboard'],queryFn:async()=>(await api.get('/dashboard/trainee')).data?.data,refetchOnWindowFocus:true});
  if(isLoading)return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  if(isError)return <Card title="Dashboard unavailable"><p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message||'Unable to load trainee dashboard.'}</p></Card>;
  const stats=[['Active enrollments',data?.activeEnrollments??0,BookOpen],['Attendance',`${data?.attendancePercentage??0}%`,CalendarClock],['Skills learned',data?.skillsLearned??0,TrendingUp],['Skills verified',data?.skillsVerified??0,CheckCircle2],['Upcoming sessions',data?.upcomingSessions??0,ClipboardCheck],['Certificates',data?.certificates??0,Award]];
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">My learning dashboard</h1><p className="mt-1 text-sm text-gray-500">Track your attendance, skill progress and training activity.</p></div><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{stats.map(([label,value,Icon]:any)=><Card key={label}><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div><Icon className="text-indigo-600" size={24}/></div></Card>)}</div><Card title="Overall skill progress"><div className="flex items-center justify-between text-sm mb-2"><span>Average progress</span><strong>{data?.averageSkillProgress??0}%</strong></div><div className="h-3 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-indigo-600 rounded-full" style={{width:`${Math.min(100,Math.max(0,data?.averageSkillProgress||0))}%`}}/></div></Card><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card title="My schedule"><p className="text-sm text-gray-600">Check upcoming lessons and training sessions.</p><Link className="inline-block mt-3 text-sm text-indigo-600" to="/trainee/schedule">View schedule →</Link></Card><Card title="Skill passport"><p className="text-sm text-gray-600">View skills recorded and verified by trainers.</p><Link className="inline-block mt-3 text-sm text-indigo-600" to="/trainee/skill-passport">Open skill passport →</Link></Card><Card title="My tasks"><p className="text-sm text-gray-600">View tasks and submit your practical work.</p><Link className="inline-block mt-3 text-sm text-indigo-600" to="/trainee/tasks">Open tasks →</Link></Card></div></div>;
}
