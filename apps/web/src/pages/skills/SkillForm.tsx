import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  name: z.string().min(2),
  categoryId: z.string().min(1),
});

export default function SkillForm() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add Skill</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(() => navigate('/admin/skills'))} className="space-y-4">
          <FormField label="Skill Name" required><Input {...register('name')} /></FormField>
          <FormField label="Category ID" required><Input {...register('categoryId')} /></FormField>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
