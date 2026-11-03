import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export default function TaskForm() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [instructions,setInstructions] = useState('');
  const [batchId,setBatchId] = useState('');
  const [moduleId,setModuleId] = useState('');
  const [deadline,setDeadline] = useState('');
  const [status,setStatus] = useState('PUBLISHED');
  const { data: batches = [] } = useQuery({ queryKey:['batches'], queryFn:async()=>{const res=await api.get('/batches');return Array.isArray(res.data?.data)?res.data.data:[];} });
  const { data: modules = [] } = useQuery({ queryKey:['modules'], queryFn:async()=>{const res=await api.get('/modules');return Array.isArray(res.data?.data)?res.data.data:[];} });
  const mutation=useMutation({
    mutationFn:async()=>api.post('/tasks',{title:title.trim(),description:description||undefined,instructions:instructions||undefined,batchId:batchId||undefined,moduleId:moduleId||undefined,deadline:deadline||undefined,status}),
    onSuccess:async()=>{await client.invalidateQueries({queryKey:['tasks']});navigate('/trainer/tasks');},
  });
  return <div className="max-w-2xl mx-auto space-y-6"><h1 className="text-2xl font-bold">Create practical task</h1><Card title="Task details"><form className="space-y-4" onSubmit={(e)=>{e.preventDefault();mutation.mutate();}}>
    <FormField label="Title" required><Input value={title} onChange={e=>setTitle(e.target.value)} required/></FormField>
    <FormField label="Description"><textarea className="w-full rounded-md border border-gray-300 p-3 text-sm" rows={3} value={description} onChange={e=>setDescription(e.target.value)}/></FormField>
    <FormField label="Instructions"><textarea className="w-full rounded-md border border-gray-300 p-3 text-sm" rows={5} value={instructions} onChange={e=>setInstructions(e.target.value)}/></FormField>
    <FormField label="Batch"><Select value={batchId} onChange={e=>setBatchId(e.target.value)} options={[{label:'All eligible trainees',value:''},...batches.map((b:any)=>({label:b.name,value:b.id}))]}/></FormField>
    <FormField label="Module"><Select value={moduleId} onChange={e=>setModuleId(e.target.value)} options={[{label:'No module',value:''},...modules.map((m:any)=>({label:m.name,value:m.id}))]}/></FormField>
    <div className="grid grid-cols-2 gap-4"><FormField label="Deadline"><Input type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)}/></FormField><FormField label="Status"><Select value={status} onChange={e=>setStatus(e.target.value)} options={[{label:'Published',value:'PUBLISHED'},{label:'Draft',value:'DRAFT'},{label:'Active',value:'ACTIVE'}]}/></FormField></div>
    {mutation.isError&&<p className="text-sm text-red-600">{(mutation.error as any)?.response?.data?.error?.message||'Unable to create task.'}</p>}
    <div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="ghost" onClick={()=>navigate(-1)}>Cancel</Button><Button type="submit" isLoading={mutation.isPending} disabled={!title.trim()}>Create task</Button></div>
  </form></Card></div>;
}
