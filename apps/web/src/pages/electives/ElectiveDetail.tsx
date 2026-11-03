import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function ElectiveDetail() {
  const {id=''}=useParams();
  const {data,isLoading,isError,error}=useQuery({queryKey:['elective',id],queryFn:async()=>(await api.get(`/electives/${id}`)).data?.data,enabled:Boolean(id)});
  if(isLoading)return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  if(isError||!data)return <Card title="Program unavailable"><p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message||'Unable to load this program.'}</p><Link to="/admin/electives" className="text-indigo-600">Back to programs</Link></Card>;
  const modules=data.modules||[];
  const rules=data.completionRules||[];
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">{data.name}</h1><p className="text-sm text-gray-500 mt-1">{data.code}</p></div><div className="flex gap-2"><Link to="/admin/electives"><Button variant="ghost">Back</Button></Link><Link to={`/admin/electives/${id}/edit`}><Button icon={<Pencil size={16}/>}>Edit program</Button></Link></div></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card title="Program status"><Badge color={data.status==='ACTIVE'?'green':'gray'}>{data.status}</Badge><p className="text-sm text-gray-500 mt-2">{data.category?.name||'Uncategorized'}</p></Card><Card title="Duration"><p className="text-2xl font-bold">{data.durationWeeks??'—'} <span className="text-sm font-normal text-gray-500">weeks</span></p></Card><Card title="Training hours"><p className="text-2xl font-bold">{data.totalTrainingHours??0} <span className="text-sm font-normal text-gray-500">hours</span></p><p className="text-xs text-gray-500 mt-1">Theory {data.theoryHours??0}h · Practical {data.practicalHours??0}h</p></Card></div>
    <Card title="Overview"><p className="text-sm text-gray-700 whitespace-pre-wrap">{data.description||'No description provided.'}</p>{data.objectives&&<div className="mt-4"><h3 className="font-semibold text-sm">Objectives</h3><p className="text-sm whitespace-pre-wrap text-gray-700 mt-1">{data.objectives}</p></div>}</Card>
    <Card title="Modules" description={`${modules.length} module(s)`}>{modules.length?<div className="divide-y">{modules.map((module:any)=><div key={module.id} className="py-3 flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium text-sm">{module.sequenceOrder}. {module.name}</p><p className="text-xs text-gray-500">{module.description||'No module description'}</p></div><div className="text-xs text-gray-500">{(module.theoryHours||0)+(module.practicalHours||0)} hours · {module.moduleSkills?.length||0} skill(s)</div><Badge color={module.isActive?'green':'gray'}>{module.isActive?'Active':'Inactive'}</Badge></div>)}</div>:<p className="text-sm text-gray-500 py-4">No modules have been added.</p>}</Card>
    <Card title="Completion requirements">{rules.length?<div className="space-y-3">{rules.map((rule:any)=><div key={rule.id} className="flex justify-between items-start gap-3 border-b last:border-0 pb-2"><div><p className="text-sm font-medium">{rule.ruleType.replaceAll('_',' ')}</p><p className="text-xs text-gray-500">{rule.description||'—'}</p></div><div className="text-right"><p className="text-sm font-semibold">{rule.ruleValue}</p><Badge color={rule.isRequired?'blue':'gray'}>{rule.isRequired?'Required':'Optional'}</Badge></div></div>)}</div>:<p className="text-sm text-gray-500 py-4">No completion rules configured.</p>}</Card>
  </div>;
}
