import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  title: z.string().min(2),
  date: z.string(),
  batchId: z.string().min(1),
});

export default function SessionForm() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add Session</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(() => navigate('/admin/sessions'))} className="space-y-4">
          <FormField label="Title" required><Input {...register('title')} /></FormField>
          <FormField label="Date" required><Input type="date" {...register('date')} /></FormField>
          <FormField label="Batch ID" required><Input {...register('batchId')} /></FormField>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
