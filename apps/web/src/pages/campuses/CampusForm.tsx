import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import api from '../../lib/api';

const ORGANIZATION_ID = '283c8d91-8cad-4a3f-8c6d-8e50bd215687';

const campusSchema = z.object({
  code: z.string().min(2, 'Code is required'),
  name: z.string().min(3, 'Name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'Zip is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type CampusForm = z.infer<typeof campusSchema>;

export default function CampusForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CampusForm>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      status: 'ACTIVE',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CampusForm) => {
      const payload = {
        organizationId: ORGANIZATION_ID,
        code: data.code,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.zipCode,
        isActive: data.status === 'ACTIVE',
      };

      return api.post('/campuses', payload);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['campuses'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['adminDashboard'],
      });

      navigate('/admin/campuses');
    },

    onError: (error: any) => {
      console.error('Create campus error:', error);

      alert(
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to create campus'
      );
    },
  });

  const onSubmit = async (data: CampusForm) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Add New Campus
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Enter details to register a new campus location.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <FormField
              label="Campus Code"
              required
              error={errors.code?.message}
            >
              <Input
                {...register('code')}
                placeholder="e.g. CMP01"
              />
            </FormField>

            <FormField
              label="Campus Name"
              required
              error={errors.name?.message}
            >
              <Input
                {...register('name')}
                placeholder="e.g. Main Campus"
              />
            </FormField>

          </div>

          <FormField
            label="Address"
            required
            error={errors.address?.message}
          >
            <Input
              {...register('address')}
              placeholder="Street address"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <FormField
              label="City"
              required
              error={errors.city?.message}
            >
              <Input {...register('city')} />
            </FormField>

            <FormField
              label="State"
              required
              error={errors.state?.message}
            >
              <Input {...register('state')} />
            </FormField>

            <FormField
              label="Zip Code"
              required
              error={errors.zipCode?.message}
            >
              <Input {...register('zipCode')} />
            </FormField>

          </div>

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
                  value: 'ACTIVE',
                },
                {
                  label: 'Inactive',
                  value: 'INACTIVE',
                },
              ]}
            />
          </FormField>

          <div className="pt-4 flex justify-end space-x-3 border-t">

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              disabled={
                isSubmitting ||
                createMutation.isPending
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              isLoading={
                isSubmitting ||
                createMutation.isPending
              }
            >
              Save Campus
            </Button>

          </div>

        </form>
      </div>
    </div>
  );
}