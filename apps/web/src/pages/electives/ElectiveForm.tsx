import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  code: z.string().min(2, 'Code is required'),
  name: z.string().min(3, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  durationHours: z.number().min(1, 'Duration must be at least 1 hour'),
  status: z.enum(['ACTIVE', 'INACTIVE'])
});

export default function ElectiveForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE' }
  });

  const onSubmit = async () => navigate('/admin/electives');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add Elective</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Code" required error={errors.code?.message as string}>
              <Input {...register('code')} />
            </FormField>
            <FormField label="Name" required error={errors.name?.message as string}>
              <Input {...register('name')} />
            </FormField>
          </div>
          <FormField label="Category" required error={errors.categoryId?.message as string}>
            <Select {...register('categoryId')} options={[{ label: 'IT', value: '1' }]} />
          </FormField>
          <FormField label="Duration (Hours)" required error={errors.durationHours?.message as string}>
            <Input type="number" {...register('durationHours', { valueAsNumber: true })} />
          </FormField>
          <FormField label="Description">
            <TextArea {...register('description')} />
          </FormField>
          <FormField label="Status" required>
            <Select {...register('status')} options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }]} />
          </FormField>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
