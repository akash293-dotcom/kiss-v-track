import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import api from '../../lib/api';

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.coerce.number().min(0).optional(),
  campusId: z.string().min(1, 'Campus is required'),
  isActive: z.string(),
  password: z.string().optional(),
});

type TrainerFormData = z.infer<typeof schema>;

const getArray = (response: any, key?: string) => {
  const data = response?.data?.data;

  if (key && Array.isArray(data?.[key])) {
    return data[key];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export default function TrainerForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<TrainerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeId: '',
      qualification: '',
      specialization: '',
      experience: 0,
      campusId: '',
      isActive: 'true',
      password: '',
    },
  });

  const {
    data: trainer,
    isLoading: trainerLoading,
    isError: trainerError,
  } = useQuery({
    queryKey: ['trainer', id],
    queryFn: async () => {
      const response = await api.get(`/trainers/${id}`);
      return response.data?.data || response.data;
    },
    enabled: isEditMode,
  });

  const {
    data: campuses = [],
    isLoading: campusesLoading,
  } = useQuery({
    queryKey: ['campuses'],
    queryFn: async () => {
      const response = await api.get('/campuses');
      return getArray(response, 'campuses');
    },
  });

  useEffect(() => {
    if (!trainer) {
      return;
    }

    reset({
      firstName: trainer.user?.firstName || '',
      lastName: trainer.user?.lastName || '',
      email: trainer.user?.email || '',
      phone: trainer.user?.phone || '',
      employeeId: trainer.employeeId || '',
      qualification: trainer.qualification || '',
      specialization: trainer.specialization || '',
      experience: trainer.experience ?? 0,
      campusId: trainer.campusId || '',
      isActive: trainer.isActive === false ? 'false' : 'true',
      password: '',
    });
  }, [trainer, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: TrainerFormData) => {
      if (isEditMode) {
        return api.patch(`/trainers/${id}`, {
          employeeId: data.employeeId,
          qualification: data.qualification || undefined,
          specialization: data.specialization || undefined,
          experience: Number(data.experience || 0),
          campusId: data.campusId,
          isActive: data.isActive === 'true',
        });
      }

      return api.post('/trainers', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        employeeId: data.employeeId,
        qualification: data.qualification || undefined,
        specialization: data.specialization || undefined,
        experience: Number(data.experience || 0),
        campusId: data.campusId,
        password: data.password || 'Trainer@123',
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['trainers'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['trainer', id],
      });

      await queryClient.invalidateQueries({
        queryKey: ['adminDashboard'],
      });

      navigate('/admin/trainers');
    },

    onError: (error: any) => {
      console.error('Save trainer error:', error);

      alert(
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to save trainer'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/trainers/${id}`);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['trainers'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['adminDashboard'],
      });

      navigate('/admin/trainers');
    },

    onError: (error: any) => {
      console.error('Delete trainer error:', error);

      alert(
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to delete trainer'
      );
    },
  });

  const onSubmit = async (data: TrainerFormData) => {
    await saveMutation.mutateAsync(data);
  };

  const handleDelete = () => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this trainer? This action cannot be undone.'
    );

    if (confirmed) {
      deleteMutation.mutate();
    }
  };

  if (isEditMode && trainerLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        Loading trainer...
      </div>
    );
  }

  if (isEditMode && trainerError) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-red-600">
        Failed to load trainer.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Trainer' : 'Add New Trainer'}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? 'Update trainer information.'
            : 'Enter details to register a new trainer.'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <FormField
              label="First Name"
              required
              error={errors.firstName?.message}
            >
              <Input
                {...register('firstName')}
                disabled={isEditMode}
              />
            </FormField>

            <FormField
              label="Last Name"
              required
              error={errors.lastName?.message}
            >
              <Input
                {...register('lastName')}
                disabled={isEditMode}
              />
            </FormField>

          </div>

          <FormField
            label="Email"
            required
            error={errors.email?.message}
          >
            <Input
              type="email"
              {...register('email')}
              disabled={isEditMode}
            />
          </FormField>

          <FormField
            label="Phone"
            error={errors.phone?.message}
          >
            <Input
              {...register('phone')}
              disabled={isEditMode}
            />
          </FormField>

          <FormField
            label="Employee ID"
            required
            error={errors.employeeId?.message}
          >
            <Input
              {...register('employeeId')}
              disabled={isEditMode}
            />
          </FormField>

          <FormField
            label="Qualification"
            error={errors.qualification?.message}
          >
            <Input
              {...register('qualification')}
              placeholder="e.g. B.Tech, MCA"
            />
          </FormField>

          <FormField
            label="Specialization"
            error={errors.specialization?.message}
          >
            <Input
              {...register('specialization')}
              placeholder="e.g. Web Development"
            />
          </FormField>

          <FormField
            label="Experience (years)"
            error={errors.experience?.message}
          >
            <Input
              type="number"
              min="0"
              {...register('experience', {
                valueAsNumber: true,
              })}
            />
          </FormField>

          <FormField
            label="Campus"
            required
            error={errors.campusId?.message}
          >
            <Select
              {...register('campusId')}
              disabled={campusesLoading}
              options={[
                {
                  label: campusesLoading
                    ? 'Loading campuses...'
                    : 'Select Campus',
                  value: '',
                },
                ...campuses.map((campus: any) => ({
                  label: campus.name || campus.code || campus.id,
                  value: campus.id,
                })),
              ]}
            />
          </FormField>

          {isEditMode && (
            <FormField
              label="Status"
              required
              error={errors.isActive?.message}
            >
              <Select
                {...register('isActive')}
                options={[
                  {
                    label: 'Active',
                    value: 'true',
                  },
                  {
                    label: 'Inactive',
                    value: 'false',
                  },
                ]}
              />
            </FormField>
          )}

          {!isEditMode && (
            <FormField
              label="Password"
              error={errors.password?.message}
            >
              <Input
                type="password"
                {...register('password')}
                placeholder="Default: Trainer@123"
              />
            </FormField>
          )}

          <div className="pt-4 flex justify-between items-center border-t">

            <div>
              {isEditMode && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={
                    deleteMutation.isPending ||
                    saveMutation.isPending ||
                    isSubmitting
                  }
                  isLoading={deleteMutation.isPending}
                >
                  Delete Trainer
                </Button>
              )}
            </div>

            <div className="flex space-x-3">

              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                disabled={
                  saveMutation.isPending ||
                  deleteMutation.isPending ||
                  isSubmitting
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                isLoading={
                  isSubmitting ||
                  saveMutation.isPending
                }
                disabled={deleteMutation.isPending}
              >
                {isEditMode ? 'Update Trainer' : 'Save Trainer'}
              </Button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}