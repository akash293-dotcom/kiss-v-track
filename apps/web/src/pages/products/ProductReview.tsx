import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export default function ProductReview() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [status, setStatus] = useState('UNDER_REVIEW');
  const [overallScore, setOverallScore] = useState('0');
  const [maxScore, setMaxScore] = useState('100');
  const [feedback, setFeedback] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get(`/products/${id}`)).data?.data,
    enabled: Boolean(id),
  });
  const mutation = useMutation({
    mutationFn: async () => api.post(`/products/${id}/review`, { status, overallScore: Number(overallScore), maxScore: Number(maxScore), feedback, recommendation }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['products'] }); await client.invalidateQueries({ queryKey: ['product', id] }); navigate(`/trainer/products/${id}`); },
  });
  return <div className="max-w-2xl mx-auto space-y-6"><h1 className="text-2xl font-bold">Review product</h1><Card title={product?.name || 'Product review'}>{isLoading ? <p>Loading product…</p> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
    <p className="text-sm text-gray-600">Trainee: {product?.trainee?.user ? `${product.trainee.user.firstName} ${product.trainee.user.lastName}` : '—'}</p>
    <FormField label="Status"><Select value={status} onChange={(event) => setStatus(event.target.value)} options={[{label:'Under review',value:'UNDER_REVIEW'},{label:'Approved',value:'APPROVED'},{label:'Revision required',value:'REVISION_REQUIRED'}]}/></FormField>
    <div className="grid grid-cols-2 gap-4"><FormField label="Score"><Input type="number" min="0" value={overallScore} onChange={(event) => setOverallScore(event.target.value)}/></FormField><FormField label="Maximum score"><Input type="number" min="1" value={maxScore} onChange={(event) => setMaxScore(event.target.value)}/></FormField></div>
    <FormField label="Feedback"><textarea className="w-full rounded-md border border-gray-300 p-3 text-sm" rows={4} value={feedback} onChange={(event) => setFeedback(event.target.value)}/></FormField>
    <FormField label="Recommendation"><Input value={recommendation} onChange={(event) => setRecommendation(event.target.value)}/></FormField>
    {mutation.isError && <p className="text-sm text-red-600">{(mutation.error as any)?.response?.data?.error?.message || 'Unable to save review.'}</p>}
    <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button><Button type="submit" isLoading={mutation.isPending} disabled={!product || Number(maxScore) <= 0 || Number(overallScore) < 0 || Number(overallScore) > Number(maxScore)}>Save review</Button></div>
  </form>}</Card></div>;
}
