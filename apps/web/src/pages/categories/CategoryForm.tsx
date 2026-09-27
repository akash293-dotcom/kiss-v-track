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

const categorySchema = z.object({
  code: z.string().min(2, 'Code is required'),
  name: z.string().min(3, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE'])
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function CategoryForm() {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { status: 'ACTIVE' }
  });

  const onSubmit = async (data: CategoryForm) => {
    navigate('/admin/categories');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Category Code" required error={errors.code?.message}>
            <Input {...register('code')} placeholder="e.g. IT" />
          </FormField>
          
          <FormField label="Category Name" required error={errors.name?.message}>
            <Input {...register('name')} placeholder="e.g. Information Technology" />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <TextArea {...register('description')} rows={3} />
          </FormField>

          <FormField label="Status" required error={errors.status?.message}>
            <Select 
              {...register('status')}
              options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }]}
            />
          </FormField>

          <div className="pt-4 flex justify-end space-x-3 border-t">
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Save Category</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
