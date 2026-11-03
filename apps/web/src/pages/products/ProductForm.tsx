import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function ProductForm() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [imageUrls, setImageUrls] = useState('');

  const mutation = useMutation({
    mutationFn: async () => api.post('/products', {
      name: name.trim(), category: category || undefined, description: description || undefined,
      materials: materials || undefined, productionDate: productionDate || undefined,
      imageUrls: imageUrls.trim() ? JSON.stringify(imageUrls.split('\n').map((item) => item.trim()).filter(Boolean)) : undefined,
    }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['products'] }); navigate('/trainee/products'); },
  });

  return <div className="max-w-2xl mx-auto space-y-6"><div><h1 className="text-2xl font-bold">Submit a product</h1><p className="mt-1 text-sm text-gray-500">Describe the product you created during your training.</p></div><Card title="Product information">
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
      <FormField label="Product name" required><Input value={name} onChange={(event) => setName(event.target.value)} required maxLength={120}/></FormField>
      <FormField label="Category"><Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. Handicraft, Food processing"/></FormField>
      <FormField label="Description"><textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={4} value={description} onChange={(event) => setDescription(event.target.value)}/></FormField>
      <FormField label="Materials used"><textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={3} value={materials} onChange={(event) => setMaterials(event.target.value)}/></FormField>
      <FormField label="Production date"><Input type="date" value={productionDate} onChange={(event) => setProductionDate(event.target.value)}/></FormField>
      <FormField label="Image URLs (one URL per line)"><textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={3} value={imageUrls} onChange={(event) => setImageUrls(event.target.value)} placeholder="https://…"/></FormField>
      {mutation.isError && <p className="text-sm text-red-600">{(mutation.error as any)?.response?.data?.error?.message || 'Unable to submit product.'}</p>}
      <div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button><Button type="submit" isLoading={mutation.isPending} disabled={!name.trim()}>Submit product</Button></div>
    </form>
  </Card></div>;
}
