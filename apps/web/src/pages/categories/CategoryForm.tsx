import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useNavigate,
  useParams
} from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import api from '../../lib/api';

const categorySchema = z.object({
  code: z.string().min(2, 'Code is required'),
  name: z.string().min(3, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE'])
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      status: 'ACTIVE'
    }
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadCategory = async () => {
      try {
        const response = await api.get(`/categories/${id}`);
        const category = response.data?.data;

        if (!category) {
          throw new Error('Category not found');
        }

        reset({
          code: category.code || '',
          name: category.name || '',
          description: category.description || '',
          status: category.isActive ? 'ACTIVE' : 'INACTIVE'
        });
      } catch (error: any) {
        console.error('Load category error:', error);

        alert(
          error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          'Failed to load category.'
        );

        navigate('/admin/categories');
      }
    };

    loadCategory();
  }, [id, navigate, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const payload = {
        code: data.code.trim(),
        name: data.name.trim(),
        description: data.description?.trim() || null,
        isActive: data.status === 'ACTIVE'
      };

      if (id) {
        await api.patch(`/categories/${id}`, payload);

        alert('Category updated successfully.');
      } else {
        await api.post('/categories', {
          ...payload,
          sortOrder: 0
        });

        alert('Category created successfully.');
      }

      navigate('/admin/categories');
    } catch (error: any) {
      console.error('Save category error:', error);

      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        `Failed to ${id ? 'update' : 'create'} category.`
      );
    }
  };

  const isEdit = Boolean(id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Category' : 'Add New Category'}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {isEdit
            ? 'Update category details'
            : 'Create a new training category'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            label="Category Code"
            required
            error={errors.code?.message}
          >
            <Input
              {...register('code')}
              placeholder="e.g. IT"
            />
          </FormField>

          <FormField
            label="Category Name"
            required
            error={errors.name?.message}
          >
            <Input
              {...register('name')}
              placeholder="e.g. Information Technology"
            />
          </FormField>

          <FormField
            label="Description"
            error={errors.description?.message}
          >
            <TextArea
              {...register('description')}
              rows={3}
              placeholder="Enter category description"
            />
          </FormField>

          <FormField
            label="Status"
            required
            error={errors.status?.message}
          >
            <Select
              {...register('status')}
              options={[
                {
                  label: 'Active',
                  value: 'ACTIVE'
                },
                {
                  label: 'Inactive',
                  value: 'INACTIVE'
                }
              ]}
            />
          </FormField>

          <div className="pt-4 flex justify-end space-x-3 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/categories')}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              {isEdit ? 'Update Category' : 'Save Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}