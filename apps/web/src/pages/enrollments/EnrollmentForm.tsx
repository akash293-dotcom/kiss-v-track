import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function EnrollmentForm() {
  const navigate=useNavigate();
  const [searchParams]=useSearchParams();
  const client=useQueryClient();
  const [traineeId,setTraineeId]=useState('');
  const [batchId,setBatchId]=useState(searchParams.get('batchId')||'');
  const [remarks,setRemarks]=useState('');

  const {data:trainees=[],isLoading:traineesLoading}=useQuery({queryKey:['trainees','enroll'],queryFn:async()=>{const r=await api.get('/trainees',{params:{page:1,limit:100}});return r.data?.data?.trainees||[];}});
  const {data:batches=[],isLoading:batchesLoading}=useQuery({queryKey:['batches'],queryFn:async()=>{const r=await api.get('/batches');return Array.isArray(r.data?.data)?r.data.data:[];}});
  const mutation=useMutation({mutationFn:async()=>api.post('/enrollments',{traineeId,batchId,remarks:remarks||undefined,status:'ACTIVE'}),onSuccess:async()=>{await client.invalidateQueries({queryKey:['batch-enrollments',batchId]});await client.invalidateQueries({queryKey:['batches']});navigate(batchId?`/admin/batches/${batchId}`:'/admin/batches');}});

  if(traineesLoading||batchesLoading)return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  const availableBatches=batches.filter((batch:any)=>!['COMPLETED','CANCELLED'].includes(batch.status));
  return <div className="max-w-2xl mx-auto space-y-6"><h1 className="text-2xl font-bold">Enroll trainee</h1><Card title="Enrollment details"><form className="space-y-4" onSubmit={e=>{e.preventDefault();mutation.mutate();}}>
    <FormField label="Trainee" required><Select value={traineeId} onChange={e=>setTraineeId(e.target.value)} options={[{label:'Select trainee',value:''},...trainees.map((t:any)=>({label:`${t.user?.firstName||''} ${t.user?.lastName||''} — ${t.studentId}`,value:t.id}))]}/></FormField>
    <FormField label="Batch" required><Select value={batchId} onChange={e=>setBatchId(e.target.value)} options={[{label:'Select batch',value:''},...availableBatches.map((b:any)=>({label:`${b.name} — ${b.code} (${b._count?.enrollments??0}/${b.capacity})`,value:b.id}))]}/></FormField>
    <FormField label="Remarks"><Input value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Optional enrollment note"/></FormField>
    {mutation.isError&&<p className="text-sm text-red-600">{(mutation.error as any)?.response?.data?.error?.message||'Unable to enroll trainee.'}</p>}
    <div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="ghost" onClick={()=>navigate(-1)}>Cancel</Button><Button type="submit" isLoading={mutation.isPending} disabled={!traineeId||!batchId}>Enroll trainee</Button></div>
  </form></Card></div>;
}
