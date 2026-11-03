import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function ProductDetail() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const base = user?.role === 'TRAINEE' ? '/trainee' : user?.role === 'TRAINER' ? '/trainer' : '/admin';
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get(`/products/${id}`)).data?.data,
    enabled: Boolean(id),
  });
  const remove = useMutation({
    mutationFn: async () => api.delete(`/products/${id}`),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['products'] }); navigate(`${base}/products`); },
  });

  if (isLoading) return <div className="py-12 flex justify-center"><LoadingSpinner size={32}/></div>;
  if (isError || !data) return <Card title="Product unavailable"><p className="text-red-600">{(error as any)?.response?.data?.error?.message || 'Unable to load this product.'}</p><Link className="text-indigo-600" to={`${base}/products`}>Back to products</Link></Card>;

  const isOwner = user?.role === 'TRAINEE';
  return <div className="max-w-4xl mx-auto space-y-5"><div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-bold">{data.name}</h1><p className="text-sm text-gray-500 mt-1">{data.category || 'Uncategorized'}</p></div><div className="flex gap-2"><Link to={`${base}/products`}><Button variant="ghost">Back</Button></Link>{user?.role === 'TRAINER' && <Link to={`/trainer/products/${id}/review`}><Button>Review product</Button></Link>}{isOwner && <Button variant="danger" onClick={() => { if (window.confirm('Delete this product?')) remove.mutate(); }} isLoading={remove.isPending}>Delete</Button>}</div></div>
    <Card title="Product information"><div className="space-y-3"><Badge color={data.status === 'APPROVED' || data.status === 'COMPLETED' ? 'green' : 'blue'}>{data.status}</Badge><p className="whitespace-pre-wrap text-sm text-gray-700">{data.description || 'No description provided.'}</p><p className="text-sm"><strong>Materials:</strong> {data.materials || '—'}</p><p className="text-sm"><strong>Production date:</strong> {data.productionDate ? new Date(data.productionDate).toLocaleDateString() : '—'}</p>{Array.isArray(JSON.parse(data.imageUrls || '[]')) && JSON.parse(data.imageUrls || '[]').map((url: string)=><a key={url} href={url} target="_blank" rel="noreferrer" className="block text-sm text-indigo-600 underline">{url}</a>)}</div></Card>
    <Card title="Skills"><div className="flex flex-wrap gap-2">{data.productSkills?.length ? data.productSkills.map((item: any)=><Badge key={item.id} color="blue">{item.skill?.name || 'Skill'}</Badge>) : <p className="text-sm text-gray-500">No linked skills.</p>}</div></Card>
    <Card title="Review history"><div className="space-y-3">{data.productReviews?.length ? data.productReviews.map((review: any)=><div key={review.id} className="border-b pb-3 last:border-0"><p className="font-medium text-sm">{review.trainer?.user ? `${review.trainer.user.firstName} ${review.trainer.user.lastName}` : 'Trainer'} · {new Date(review.reviewedAt).toLocaleDateString()}</p><p className="text-sm text-gray-700 mt-1">{review.feedback || 'No feedback provided.'}</p>{review.overallScore != null && <p className="text-sm text-gray-500">Score: {review.overallScore}/{review.maxScore ?? 100}</p>}</div>) : <p className="text-sm text-gray-500">No reviews yet.</p>}</div></Card>
    <Card title="Status history"><div className="space-y-2">{data.statusHistory?.length ? data.statusHistory.map((item: any)=><div key={item.id} className="flex justify-between gap-3 text-sm"><span>{item.fromStatus ? `${item.fromStatus} → ` : ''}{item.toStatus}</span><span className="text-gray-500">{new Date(item.createdAt).toLocaleString()}</span></div>) : <p className="text-sm text-gray-500">No status history.</p>}</div></Card>
    {remove.isError && <p className="text-sm text-red-600">{(remove.error as any)?.response?.data?.error?.message || 'Unable to delete product.'}</p>}
  </div>;
}
