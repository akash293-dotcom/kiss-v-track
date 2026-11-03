import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export default function AssessmentForm() {
  const navigate=useNavigate();
  const client=useQueryClient();
  const [traineeId,setTraineeId]=useState('');
  const [batchId,setBatchId]=useState('');
  const [title,setTitle]=useState('');
  const [type,setType]=useState('PRACTICAL');
  const [description,setDescription]=useState('');
  const [score,setScore]=useState('');
  const [maxScore,setMaxScore]=useState('100');
  const [result,setResult]=useState('PENDING');
  const [feedback,setFeedback]=useState('');
  const {data:trainees=[]}=useQuery({queryKey:['trainees','assessment-form'],queryFn:async()=>{const r=await api.get('/trainees',{params:{page:1,limit:100}});return r.data?.data?.trainees||[];}});
  const {data:batches=[]}=useQuery({queryKey:['batches','assessment-form'],queryFn:async()=>{const r=await api.get('/batches');return Array.isArray(r.data?.data)?r.data.data:[];}});
  const mutation=useMutation({mutationFn:async()=>api.post('/assessments',{traineeId,batchId:batchId||undefined,title:title.trim(),type,description:description||undefined,score:score===''?undefined:Number(score),maxScore:Number(maxScore),result,feedback:feedback||undefined}),onSuccess:async()=>{await client.invalidateQueries({queryKey:['assessments']});navigate('/trainer/assessments');}});
  return <div className="max-w-2xl mx-auto space-y-6"><h1 className="text-2xl font-bold">Create assessment</h1><Card title="Assessment details"><form className="space-y-4" onSubmit={e=>{e.preventDefault();mutation.mutate();}}>
    <FormField label="Trainee" required><Select value={traineeId} onChange={e=>setTraineeId(e.target.value)} options={[{label:'Select trainee',value:''},...trainees.map((t:any)=>({label:`${t.user?.firstName||''} ${t.user?.lastName||''} — ${t.studentId}`,value:t.id}))]}/></FormField>
    <FormField label="Batch"><Select value={batchId} onChange={e=>setBatchId(e.target.value)} options={[{label:'Not linked to a batch',value:''},...batches.map((b:any)=>({label:b.name,value:b.id}))]}/></FormField>
    <FormField label="Title" required><Input value={title} onChange={e=>setTitle(e.target.value)} required/></FormField>
    <FormField label="Assessment type"><Select value={type} onChange={e=>setType(e.target.value)} options={['THEORY','PRACTICAL','PRODUCT','PROJECT','FINAL'].map(x=>({label:x,value:x}))}/></FormField>
    <FormField label="Description"><textarea className="w-full border rounded-md p-3 text-sm" rows={3} value={description} onChange={e=>setDescription(e.target.value)}/></FormField>
    <div className="grid grid-cols-2 gap-4"><FormField label="Score"><Input type="number" min="0" value={score} onChange={e=>setScore(e.target.value)}/></FormField><FormField label="Maximum score"><Input type="number" min="1" value={maxScore} onChange={e=>setMaxScore(e.target.value)}/></FormField></div>
    <FormField label="Result"><Select value={result} onChange={e=>setResult(e.target.value)} options={['PENDING','PASS','FAIL','MERIT','DISTINCTION'].map(x=>({label:x,value:x}))}/></FormField>
    <FormField label="Feedback"><textarea className="w-full border rounded-md p-3 text-sm" rows={3} value={feedback} onChange={e=>setFeedback(e.target.value)}/></FormField>
    {mutation.isError&&<p className="text-sm text-red-600">{(mutation.error as any)?.response?.data?.error?.message||'Unable to create assessment.'}</p>}
    <div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="ghost" onClick={()=>navigate(-1)}>Cancel</Button><Button type="submit" isLoading={mutation.isPending} disabled={!traineeId||!title.trim()||Number(maxScore)<=0||(score!==''&&(Number(score)<0||Number(score)>Number(maxScore)))}>Save assessment</Button></div>
  </form></Card></div>;
}
