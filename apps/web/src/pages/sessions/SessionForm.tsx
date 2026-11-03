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
import { useAuth } from '../../hooks/useAuth';

const sessionSchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  trainerId: z.string().min(1, 'Trainer is required'),
  moduleId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  durationMin: z.coerce.number().min(1, 'Duration must be greater than 0'),
  location: z.string().optional(),
  sessionType: z.enum([
    'THEORY',
    'PRACTICAL',
    'WORKSHOP',
    'PROJECT',
    'ASSESSMENT',
  ]),
  topic: z.string().optional(),
  description: z.string().optional(),
  status: z.enum([
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'RESCHEDULED',
  ]),
  remarks: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

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

const formatDate = (date: any) => {
  if (!date) {
    return '';
  }

  const value = String(date);

  if (value.length >= 10) {
    return value.substring(0, 10);
  }

  return value;
};

export default function SessionForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);
  const { user } = useAuth();
  const listPath = user?.role === 'TRAINER' ? '/trainer/sessions' : '/admin/sessions';

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      batchId: '',
      trainerId: '',
      moduleId: '',
      date: '',
      startTime: '',
      endTime: '',
      durationMin: 60,
      location: '',
      sessionType: 'THEORY',
      topic: '',
      description: '',
      status: 'SCHEDULED',
      remarks: '',
    },
  });

  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionError,
  } = useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const response = await api.get(`/sessions/${id}`);
      return response.data?.data || response.data;
    },
    enabled: isEditMode,
  });

  const {
    data: batches = [],
    isLoading: batchesLoading,
  } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await api.get('/batches');
      return getArray(response, 'batches');
    },
  });

  const {
    data: trainers = [],
    isLoading: trainersLoading,
  } = useQuery({
    queryKey: ['trainers'],
    enabled: user?.role !== 'TRAINER',
    queryFn: async () => {
      const response = await api.get('/trainers');
      return getArray(response, 'trainers');
    },
  });

  const {
    data: modules = [],
    isLoading: modulesLoading,
  } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const response = await api.get('/modules');
      return getArray(response, 'modules');
    },
  });

  useEffect(() => {
    if (!session) {
      return;
    }

    reset({
      batchId: session.batchId || '',
      trainerId: session.trainerId || user?.trainer?.id || '',
      moduleId: session.moduleId || '',
      date: formatDate(session.date),
      startTime: session.startTime || '',
      endTime: session.endTime || '',
      durationMin: Number(session.durationMin || 60),
      location: session.location || '',
      sessionType: session.sessionType || 'THEORY',
      topic: session.topic || '',
      description: session.description || '',
      status: session.status || 'SCHEDULED',
      remarks: session.remarks || '',
    });
  }, [session, reset, user?.trainer?.id]);

  const saveMutation = useMutation({
    mutationFn: async (data: SessionFormData) => {
      const payload = {
        batchId: data.batchId,
        trainerId: user?.role === 'TRAINER' ? user.trainer?.id : data.trainerId,
        moduleId: data.moduleId || undefined,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMin: Number(data.durationMin),
        location: data.location || undefined,
        sessionType: data.sessionType,
        topic: data.topic || undefined,
        description: data.description || undefined,
        status: data.status,
        remarks: data.remarks || undefined,
      };

      if (isEditMode) {
        return api.patch(`/sessions/${id}`, payload);
      }

      return api.post('/sessions', payload);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['sessions'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['session', id],
      });

      await queryClient.invalidateQueries({
        queryKey: ['adminDashboard'],
      });

      navigate(listPath);
    },

    onError: (error: any) => {
      console.error('Save session error:', error);

      alert(
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to save session'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/sessions/${id}`);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['sessions'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['adminDashboard'],
      });

      navigate(listPath);
    },

    onError: (error: any) => {
      console.error('Delete session error:', error);

      alert(
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to delete session'
      );
    },
  });

  const onSubmit = async (data: SessionFormData) => {
    await saveMutation.mutateAsync(data);
  };

  const handleDelete = () => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      'Cancel this session? Existing attendance history will be preserved.'
    );

    if (confirmed) {
      deleteMutation.mutate();
    }
  };

  if (isEditMode && sessionLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        Loading session...
      </div>
    );
  }

  if (isEditMode && sessionError) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-red-600">
        Failed to load session.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Session' : 'Add New Session'}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? 'Update training session details.'
            : 'Enter details to schedule a new training session.'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          <FormField
            label="Batch"
            required
            error={errors.batchId?.message}
          >
            <Select
              {...register('batchId')}
              disabled={batchesLoading}
              options={[
                {
                  label: batchesLoading
                    ? 'Loading batches...'
                    : 'Select Batch',
                  value: '',
                },
                ...batches.map((batch: any) => ({
                  label: batch.name || batch.code || batch.id,
                  value: batch.id,
                })),
              ]}
            />
          </FormField>

          <FormField
            label="Trainer"
            required
            error={errors.trainerId?.message}
          >
            <Select
              {...register('trainerId')}
              disabled={trainersLoading}
              options={[
                {
                  label: trainersLoading
                    ? 'Loading trainers...'
                    : 'Select Trainer',
                  value: '',
                },
                ...(user?.role === 'TRAINER' ? [{ label: `${user.firstName} ${user.lastName}`, value: user.trainer?.id || '' }] : trainers.map((trainer: any) => ({
                  label: trainer.user
                    ? `${trainer.user.firstName || ''} ${trainer.user.lastName || ''}`.trim()
                    : trainer.name || trainer.id,
                  value: trainer.id,
                })),
              ]}
            />
          </FormField>

          <FormField
            label="Module"
            error={errors.moduleId?.message}
          >
            <Select
              {...register('moduleId')}
              disabled={modulesLoading}
              options={[
                {
                  label: modulesLoading
                    ? 'Loading modules...'
                    : 'Select Module',
                  value: '',
                },
                ...modules.map((module: any) => ({
                  label: module.name || module.code || module.id,
                  value: module.id,
                })),
              ]}
            />
          </FormField>

          <FormField
            label="Date"
            required
            error={errors.date?.message}
          >
            <Input
              type="date"
              {...register('date')}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <FormField
              label="Start Time"
              required
              error={errors.startTime?.message}
            >
              <Input
                type="time"
                {...register('startTime')}
              />
            </FormField>

            <FormField
              label="End Time"
              required
              error={errors.endTime?.message}
            >
              <Input
                type="time"
                {...register('endTime')}
              />
            </FormField>

            <FormField
              label="Duration (min)"
              required
              error={errors.durationMin?.message}
            >
              <Input
                type="number"
                min="1"
                {...register('durationMin', {
                  valueAsNumber: true,
                })}
              />
            </FormField>

          </div>

          <FormField
            label="Location"
            error={errors.location?.message}
          >
            <Input
              {...register('location')}
              placeholder="e.g. Training Room 1"
            />
          </FormField>

          <FormField
            label="Session Type"
            required
            error={errors.sessionType?.message}
          >
            <Select
              {...register('sessionType')}
              options={[
                { label: 'Theory', value: 'THEORY' },
                { label: 'Practical', value: 'PRACTICAL' },
                { label: 'Workshop', value: 'WORKSHOP' },
                { label: 'Project', value: 'PROJECT' },
                { label: 'Assessment', value: 'ASSESSMENT' },
              ]}
            />
          </FormField>

          <FormField
            label="Topic"
            error={errors.topic?.message}
          >
            <Input
              {...register('topic')}
              placeholder="Enter session topic"
            />
          </FormField>

          <FormField
            label="Description"
            error={errors.description?.message}
          >
            <Input
              {...register('description')}
              placeholder="Enter session description"
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
                { label: 'Scheduled', value: 'SCHEDULED' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Cancelled', value: 'CANCELLED' },
                { label: 'Rescheduled', value: 'RESCHEDULED' },
              ]}
            />
          </FormField>

          <FormField
            label="Remarks"
            error={errors.remarks?.message}
          >
            <Input
              {...register('remarks')}
              placeholder="Optional remarks"
            />
          </FormField>

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
                  Cancel Session
                </Button>
              )}
            </div>

            <div className="flex space-x-3">

              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                disabled={
                  isSubmitting ||
                  saveMutation.isPending ||
                  deleteMutation.isPending
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
                {isEditMode ? 'Update Session' : 'Save Session'}
              </Button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}