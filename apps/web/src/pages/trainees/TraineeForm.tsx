import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useNavigate,
  useParams
} from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import api from '../../lib/api';

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  studentId: z.string().min(2, 'Student ID is required'),
  campusId: z.string().min(1, 'Campus is required'),
  password: z.string().optional(),
  phone: z.string().optional()
});

type TraineeFormData = z.infer<typeof schema>;

export default function TraineeForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm<TraineeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      studentId: '',
      campusId: '',
      password: '',
      phone: ''
    }
  });

  const {
    data: campusData,
    isLoading: campusesLoading
  } = useQuery({
    queryKey: ['campuses'],
    queryFn: async () => {
      const response = await api.get('/campuses');

      const raw = response.data?.data;

      if (Array.isArray(raw)) {
        return raw;
      }

      if (Array.isArray(raw?.campuses)) {
        return raw.campuses;
      }

      if (Array.isArray(raw?.data)) {
        return raw.data;
      }

      return [];
    }
  });

  const {
    data: traineeData,
    isLoading: traineeLoading
  } = useQuery({
    queryKey: ['trainee', id],
    enabled: isEdit,
    queryFn: async () => {
      const response = await api.get(`/trainees/${id}`);
      return response.data?.data;
    }
  });

  useEffect(() => {
    if (!traineeData) {
      return;
    }

    reset({
      firstName: traineeData.user?.firstName || '',
      lastName: traineeData.user?.lastName || '',
      email: traineeData.user?.email || '',
      studentId: traineeData.studentId || '',
      campusId: traineeData.campusId || '',
      password: '',
      phone: traineeData.user?.phone || ''
    });
  }, [traineeData, reset]);

  const onSubmit = async (data: TraineeFormData) => {
    if (
      !isEdit &&
      (!data.password || data.password.length < 6)
    ) {
      setError('password', {
        type: 'manual',
        message: 'Password must be at least 6 characters'
      });

      return;
    }

    try {
      if (isEdit) {
        const payload: Record<string, any> = {
          studentId: data.studentId.trim(),
          campusId: data.campusId,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || null
        };

        if (data.password?.trim()) {
          payload.password = data.password.trim();
        }

        await api.patch(
          `/trainees/${id}`,
          payload
        );

        alert('Trainee updated successfully.');
      } else {
        await api.post('/trainees', {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          studentId: data.studentId.trim(),
          campusId: data.campusId,
          password: data.password,
          phone: data.phone?.trim() || null
        });

        alert('Trainee created successfully.');
      }

      navigate('/admin/trainees');
    } catch (error: any) {
      console.error('Save trainee error:', error);

      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        `Failed to ${isEdit ? 'update' : 'create'} trainee.`
      );
    }
  };

  const handleDelete = async () => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this trainee? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);

      await api.delete(`/trainees/${id}`);

      alert('Trainee deleted successfully.');

      navigate('/admin/trainees');
    } catch (error: any) {
      console.error('Delete trainee error:', error);

      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        'Failed to delete trainee.'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isEdit && traineeLoading) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading trainee...
      </div>
    );
  }

  const campusOptions = (campusData || []).map(
    (campus: any) => ({
      label: campus.name,
      value: campus.id
    })
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Trainee' : 'Add Trainee'}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {isEdit
            ? 'Update trainee information'
            : 'Create a new trainee account'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First Name"
              required
              error={errors.firstName?.message}
            >
              <Input
                {...register('firstName')}
                placeholder="First name"
              />
            </FormField>

            <FormField
              label="Last Name"
              required
              error={errors.lastName?.message}
            >
              <Input
                {...register('lastName')}
                placeholder="Last name"
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
              placeholder="Email address"
            />
          </FormField>

          <FormField
            label="Phone"
            error={errors.phone?.message}
          >
            <Input
              type="tel"
              {...register('phone')}
              placeholder="Phone number"
            />
          </FormField>

          <FormField
            label="Student ID"
            required
            error={errors.studentId?.message}
          >
            <Input
              {...register('studentId')}
              placeholder="e.g. STU001"
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
              options={campusOptions}
            />
          </FormField>

          <FormField
            label={isEdit ? 'New Password' : 'Password'}
            required={!isEdit}
            error={errors.password?.message}
          >
            <Input
              type="password"
              {...register('password')}
              placeholder={
                isEdit
                  ? 'Leave blank to keep current password'
                  : 'Minimum 6 characters'
              }
            />
          </FormField>

          <div className="pt-4 border-t flex items-center justify-between">
            {isEdit ? (
              <Button
                type="button"
                variant="danger"
                icon={<Trash2 size={16} />}
                onClick={handleDelete}
                isLoading={deleteLoading}
              >
                Delete Trainee
              </Button>
            ) : (
              <div />
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  navigate('/admin/trainees')
                }
                disabled={deleteLoading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={deleteLoading}
              >
                {isEdit
                  ? 'Update Trainee'
                  : 'Save Trainee'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}