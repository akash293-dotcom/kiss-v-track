import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const dateInput = (value?: string) => value ? new Date(value).toISOString().slice(0,10) : '';

export default function BatchForm() {
  const navigate=useNavigate();
  const client=useQueryClient();
  const {id=''}=useParams();
  const isEdit=Boolean(id);
  const [name,setName]=useState('');
  const [code,setCode]=useState('');
  const [electiveId,setElectiveId]=useState('');
  const [campusId,setCampusId]=useState('');
  const [trainerId,setTrainerId]=useState('');
  const [startDate,setStartDate]=useState('');
  const [endDate,setEndDate]=useState('');
  const [capacity,setCapacity]=useState('30');
  const [status,setStatus]=useState('DRAFT');
  const [description,setDescription]=useState('');

  const {data:batch,isLoading:batchLoading}=useQuery({queryKey:['batch',id],queryFn:async()=>(await api.get(`/batches/${id}`)).data?.data,enabled:isEdit});
  const {data:electives=[]}=useQuery({queryKey:['electives'],queryFn:async()=>{const r=await api.get('/electives');return Array.isArray(r.data?.data)?r.data.data:[];}});
  const {data:campuses=[]}=useQuery({queryKey:['campuses'],queryFn:async()=>{const r=await api.get('/campuses',{params:{page:1,limit:100}});return Array.isArray(r.data?.data)?r.data.data:[];}});
  const {data:trainerResponse}=useQuery({queryKey:['trainers'],queryFn:async()=>(await api.get('/trainers',{params:{page:1,limit:100}})).data?.data});
  const trainers=trainerResponse?.trainers||[];
  useEffect(()=>{if(!batch)return;setName(batch.name||'');setCode(batch.code||'');setElectiveId(batch.electiveId||'');setCampusId(batch.campusId||'');setTrainerId(batch.trainerId||'');setStartDate(dateInput(batch.startDate));setEndDate(dateInput(batch.endDate));setCapacity(String(batch.capacity||30));setStatus(batch.status||'DRAFT');setDescription(batch.description||'');},[batch]);
  const mutation=useMutation({mutationFn:async()=>{const payload={name:name.trim(),code:code.trim(),electiveId,campusId,trainerId:trainerId||null,startDate,endDate,capacity:Number(capacity),status,description:description||undefined};return isEdit?api.patch(`/batches/${id}`,payload):api.post('/batches',payload);},onSuccess:async()=>{await client.invalidateQueries({queryKey:['batches']});await client.invalidateQueries({queryKey:['batch',id]});navigate('/admin/batches');}});
  if(isEdit&&batchLoading)return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  return <div className="max-w-2xl mx-auto space-y-6"><h1 className="text-2xl font-bold">{isEdit?'Edit batch':'Create batch'}</h1><Card title="Batch details"><form className="space-y-4" onSubmit={e=>{e.preventDefault();mutation.mutate();}}>
    <FormField label="Batch name" required><Input value={name} onChange={e=>setName(e.target.value)} required/></FormField>
    <FormField label="Batch code" required><Input value={code} onChange={e=>setCode(e.target.value)} required/></FormField>
    <FormField label="Program" required><Select value={electiveId} onChange={e=>setElectiveId(e.target.value)} options={[{label:'Select program',value:''},...electives.map((x:any)=>({label:x.name,value:x.id}))]}/></FormField>
    <FormField label="Campus" required><Select value={campusId} onChange={e=>setCampusId(e.target.value)} options={[{label:'Select campus',value:''},...campuses.map((x:any)=>({label:x.name,value:x.id}))]}/></FormField>
    <FormField label="Assigned trainer"><Select value={trainerId} onChange={e=>setTrainerId(e.target.value)} options={[{label:'Unassigned',value:''},...trainers.map((x:any)=>({label:x.user?`${x.user.firstName} ${x.user.lastName}`:x.employeeId,value:x.id}))]}/></FormField>
    <div className="grid grid-cols-2 gap-4"><FormField label="Start date" required><Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} required/></FormField><FormField label="End date" required><Input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} required min={startDate||undefined}/></FormField></div>
    <div className="grid grid-cols-2 gap-4"><FormField label="Capacity"><Input type="number" min="1" max="1000" value={capacity} onChange={e=>setCapacity(e.target.value)}/></FormField><FormField label="Status"><Select value={status} onChange={e=>setStatus(e.target.value)} options={['DRAFT','UPCOMING','ACTIVE','COMPLETED','CANCELLED'].map(x=>({label:x,value:x}))}/></FormField></div>
    <FormField label="Description"><textarea className="w-full border border-gray-300 rounded-md p-3 text-sm" rows={3} value={description} onChange={e=>setDescription(e.target.value)}/></FormField>
    {mutation.isError&&<p className="text-sm text-red-600">{(mutation.error as any)?.response?.data?.error?.message||'Unable to save batch.'}</p>}
    <div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="ghost" onClick={()=>navigate(-1)}>Cancel</Button><Button type="submit" isLoading={mutation.isPending} disabled={!name.trim()||!code.trim()||!electiveId||!campusId||!startDate||!endDate||!capacity||Number(capacity)<1||new Date(endDate)<new Date(startDate)}>{isEdit?'Update batch':'Create batch'}</Button></div>
  </form></Card></div>;
}
