import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function TaskDetail() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [description,setDescription]=useState('');
  const [fileUrls,setFileUrls]=useState('');
  const base=user?.role==='TRAINEE'?'/trainee':'/trainer';
  const {data:task,isLoading,isError,error}=useQuery({queryKey:['task',id],queryFn:async()=>(await api.get(`/tasks/${id}`)).data?.data,enabled:Boolean(id)});
  const submit=useMutation({mutationFn:async()=>api.post(`/tasks/${id}/submit`,{description,fileUrls:fileUrls.trim()?JSON.stringify(fileUrls.split('\n').map(x=>x.trim()).filter(Boolean)):undefined}),onSuccess:async()=>{await client.invalidateQueries({queryKey:['task',id]});}});
  const review=useMutation({mutationFn:async({submissionId,status,feedback}:{submissionId:string;status:string;feedback:string})=>api.patch(`/tasks/submissions/${submissionId}/review`,{status,feedback}),onSuccess:async()=>{await client.invalidateQueries({queryKey:['task',id]});}});
  if(isLoading)return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  if(isError||!task)return <Card title="Task unavailable"><p className="text-red-600">{(error as any)?.response?.data?.error?.message||'Unable to load task.'}</p></Card>;
  return <div className="max-w-4xl mx-auto space-y-5"><div className="flex justify-between items-center"><h1 className="text-2xl font-bold">{task.title}</h1><Link to={`${base}/tasks`} className="text-sm text-indigo-600">Back to tasks</Link></div>
    <Card title="Task instructions"><div className="space-y-3"><Badge color={task.status==='PUBLISHED'||task.status==='ACTIVE'?'green':'gray'}>{task.status}</Badge><p className="text-sm whitespace-pre-wrap">{task.description||'No description.'}</p><p className="text-sm whitespace-pre-wrap">{task.instructions||''}</p><p className="text-sm text-gray-500">Deadline: {task.deadline?new Date(task.deadline).toLocaleString():'No deadline'}</p></div></Card>
    {user?.role==='TRAINEE'&&<Card title="Submit your work"><form className="space-y-4" onSubmit={e=>{e.preventDefault();submit.mutate();}}><div><label className="block text-sm font-medium mb-1">Submission description</label><textarea className="w-full border border-gray-300 rounded-md p-3 text-sm" rows={4} value={description} onChange={e=>setDescription(e.target.value)}/></div><div><label className="block text-sm font-medium mb-1">File URLs (one per line)</label><textarea className="w-full border border-gray-300 rounded-md p-3 text-sm" rows={3} value={fileUrls} onChange={e=>setFileUrls(e.target.value)}/></div>{submit.isError&&<p className="text-sm text-red-600">{(submit.error as any)?.response?.data?.error?.message||'Unable to submit.'}</p>}<Button type="submit" isLoading={submit.isPending}>Submit work</Button></form></Card>}
    <Card title={user?.role==='TRAINEE'?'Your submission':'Trainee submissions'}><div className="space-y-4">{task.submissions?.length?task.submissions.map((submission:any)=><Submission key={submission.id} submission={submission} canReview={user?.role==='TRAINER'} onReview={(status,feedback)=>review.mutate({submissionId:submission.id,status,feedback})} reviewPending={review.isPending}/>):<p className="text-sm text-gray-500">No submissions yet.</p>}</div>{review.isError&&<p className="text-sm text-red-600 mt-3">{(review.error as any)?.response?.data?.error?.message||'Unable to save review.'}</p>}</Card>
  </div>;
}

function Submission({submission,canReview,onReview,reviewPending}:{submission:any;canReview:boolean;onReview:(status:string,feedback:string)=>void;reviewPending:boolean}){
  const [feedback,setFeedback]=useState(submission.feedback||'');
  const [status,setStatus]=useState(submission.status||'UNDER_REVIEW');
  return <div className="border rounded-lg p-4 space-y-2"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium text-sm">{submission.trainee?.user? `${submission.trainee.user.firstName} ${submission.trainee.user.lastName}`:'Trainee'}</p><Badge color={submission.status==='APPROVED'?'green':'blue'}>{submission.status}</Badge></div><p className="text-sm whitespace-pre-wrap">{submission.description||'No description.'}</p>{submission.fileUrls&&<p className="text-xs text-indigo-600 break-all">{submission.fileUrls}</p>}<p className="text-xs text-gray-500">Submitted {new Date(submission.submittedAt).toLocaleString()}</p>{canReview&&<div className="pt-3 border-t space-y-2"><label className="block text-sm font-medium">Review feedback</label><textarea className="w-full border border-gray-300 rounded-md p-2 text-sm" rows={2} value={feedback} onChange={e=>setFeedback(e.target.value)}/><div className="flex flex-wrap gap-2"><select className="border rounded-md px-2 text-sm" value={status} onChange={e=>setStatus(e.target.value)}><option value="UNDER_REVIEW">Under review</option><option value="APPROVED">Approved</option><option value="REVISION_REQUIRED">Revision required</option><option value="REJECTED">Rejected</option></select><Button size="sm" onClick={()=>onReview(status,feedback)} isLoading={reviewPending}>Save review</Button></div></div>}</div>;
}
