import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const statusColor = (status: string) => status === 'APPROVED' || status === 'COMPLETED' ? 'green' : status === 'REJECTED' || status === 'REVISION_REQUIRED' ? 'red' : status === 'SUBMITTED' || status === 'UNDER_REVIEW' ? 'blue' : 'gray';

export default function ProductList() {
  const { user } = useAuth();
  const isTrainee = user?.role === 'TRAINEE';
  const base = isTrainee ? '/trainee' : user?.role === 'TRAINER' ? '/trainer' : '/admin';
  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-gray-900">Products</h1><p className="mt-1 text-sm text-gray-500">Trainee-created products, reviews and progress</p></div>
        {isTrainee && <Link to="/trainee/products/new"><Button icon={<Plus size={16}/>}>Submit product</Button></Link>}
      </div>
      <Card title="Product register" description={`${products.length} product(s)`}>
        {isLoading ? <div className="py-8 flex justify-center"><LoadingSpinner/></div> :
          isError ? <p className="text-sm text-red-600">{(error as any)?.response?.data?.error?.message || 'Unable to load products.'}</p> :
          products.length === 0 ? <p className="py-8 text-center text-gray-500">No products have been submitted yet.</p> :
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{['Product','Trainee','Category','Updated','Status',''].map((x)=><th key={x} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{x}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">
            {products.map((product: any)=><tr key={product.id}><td className="px-4 py-3 text-sm font-medium">{product.name}</td><td className="px-4 py-3 text-sm">{product.trainee?.user ? `${product.trainee.user.firstName} ${product.trainee.user.lastName}` : '—'}</td><td className="px-4 py-3 text-sm">{product.category || '—'}</td><td className="px-4 py-3 text-sm">{new Date(product.updatedAt).toLocaleDateString()}</td><td className="px-4 py-3"><Badge color={statusColor(product.status)}>{product.status}</Badge></td><td className="px-4 py-3"><Link to={`${base}/products/${product.id}`} className="inline-flex text-indigo-600 hover:text-indigo-800" aria-label="View product"><Eye size={17}/></Link></td></tr>)}
          </tbody></table></div>}
      </Card>
    </div>
  );
}
