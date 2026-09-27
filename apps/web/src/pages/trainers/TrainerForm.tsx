import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
});

export default function TrainerForm() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add Trainer</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(() => navigate('/admin/trainers'))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required><Input {...register('firstName')} /></FormField>
            <FormField label="Last Name" required><Input {...register('lastName')} /></FormField>
          </div>
          <FormField label="Email" required><Input {...register('email')} /></FormField>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
