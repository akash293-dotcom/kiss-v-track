import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

const schema = z.object({
  code: z.string().trim().min(2, 'Enter an elective code'),
  name: z.string().trim().min(3, 'Enter an elective name'),
  categoryId: z.string().min(1, 'Select a category'),
  description: z.string().optional(),
  objectives: z.string().optional(),
  durationWeeks: z.string().optional(),
  totalTrainingHours: z.number().int().min(1, 'Total hours must be at least 1'),
  theoryHours: z.number().int().min(0, 'Theory hours cannot be negative'),
  practicalHours: z.number().int().min(0, 'Practical hours cannot be negative'),
  requiredAttendancePct: z.number().min(0).max(100),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'DISCONTINUED']),
});

type FormValues = z.infer<typeof schema>;

const arrayFrom = (response: any): any[] => {
  const data = response?.data?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export default function ElectiveForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', 'elective-form'],
    queryFn: async () => arrayFrom(await api.get('/categories')),
  });

  const { data: elective, isLoading: electiveLoading, isError: electiveError } = useQuery({
    queryKey: ['elective', id],
    queryFn: async () => (await api.get(`/electives/${id}`)).data?.data,
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '', name: '', categoryId: '', description: '', objectives: '', durationWeeks: '',
      totalTrainingHours: 1, theoryHours: 0, practicalHours: 1, requiredAttendancePct: 80, status: 'DRAFT',
    },
  });

  useEffect(() => {
    if (!elective) return;
    reset({
      code: elective.code || '',
      name: elective.name || '',
      categoryId: elective.categoryId || '',
      description: elective.description || '',
      objectives: elective.objectives || '',
      durationWeeks: elective.durationWeeks ? String(elective.durationWeeks) : '',
      totalTrainingHours: Number(elective.totalTrainingHours || 1),
      theoryHours: Number(elective.theoryHours || 0),
      practicalHours: Number(elective.practicalHours || 0),
      requiredAttendancePct: Number(elective.requiredAttendancePct ?? 80),
      status: elective.status || 'DRAFT',
    });
  }, [elective, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        code: values.code.trim(),
        name: values.name.trim(),
        categoryId: values.categoryId,
        description: values.description?.trim() || undefined,
        objectives: values.objectives?.trim() || undefined,
        durationWeeks: values.durationWeeks ? Number(values.durationWeeks) : null,
        totalTrainingHours: values.totalTrainingHours,
        theoryHours: values.theoryHours,
        practicalHours: values.practicalHours,
        requiredAttendancePct: values.requiredAttendancePct,
        status: values.status,
      };
      return isEdit ? api.patch(`/electives/${id}`, payload) : api.post('/electives', payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['electives'] });
      await queryClient.invalidateQueries({ queryKey: ['elective', id] });
      toast.success(isEdit ? 'Elective updated successfully' : 'Elective created successfully');
      navigate('/admin/electives');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || error?.response?.data?.message || 'Could not save elective');
    },
  });

  if (isEdit && electiveLoading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;
  if (isEdit && (electiveError || !elective)) return <Card title="Elective unavailable"><p className="text-sm text-red-600">This elective could not be loaded.</p><Button className="mt-4" onClick={() => navigate('/admin/electives')}>Back to electives</Button></Card>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Elective' : 'Create Elective'}</h1>
        <p className="mt-1 text-sm text-gray-500">Enter the programme details used by batches, modules and completion tracking.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Elective code" required error={errors.code?.message}><Input {...register('code')} placeholder="e.g. TEXT-101" /></FormField>
            <FormField label="Elective name" required error={errors.name?.message}><Input {...register('name')} placeholder="e.g. Appliqué and Embroidery" /></FormField>
          </div>
          <FormField label="Vocational category" required error={errors.categoryId?.message}>
            <Select {...register('categoryId')} disabled={categoriesLoading} options={[
              { label: categoriesLoading ? 'Loading categories…' : 'Select category', value: '' },
              ...categories.map((category: any) => ({ label: category.name, value: category.id })),
            ]} />
          </FormField>
          <FormField label="Description"><TextArea {...register('description')} rows={3} placeholder="Brief programme description" /></FormField>
          <FormField label="Learning objectives"><TextArea {...register('objectives')} rows={3} placeholder="What will trainees learn?" /></FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Duration (weeks)"><Input type="number" min="1" {...register('durationWeeks')} /></FormField>
            <FormField label="Total training hours" required error={errors.totalTrainingHours?.message}><Input type="number" min="1" {...register('totalTrainingHours', { valueAsNumber: true })} /></FormField>
            <FormField label="Theory hours" required error={errors.theoryHours?.message}><Input type="number" min="0" {...register('theoryHours', { valueAsNumber: true })} /></FormField>
            <FormField label="Practical hours" required error={errors.practicalHours?.message}><Input type="number" min="0" {...register('practicalHours', { valueAsNumber: true })} /></FormField>
            <FormField label="Required attendance (%)" required error={errors.requiredAttendancePct?.message}><Input type="number" min="0" max="100" step="0.5" {...register('requiredAttendancePct', { valueAsNumber: true })} /></FormField>
            <FormField label="Status" required error={errors.status?.message}>
              <Select {...register('status')} options={[
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Archived', value: 'ARCHIVED' },
                { label: 'Discontinued', value: 'DISCONTINUED' },
              ]} />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/electives')}>Cancel</Button>
            <Button type="submit" isLoading={saveMutation.isPending}>{isEdit ? 'Update elective' : 'Save elective'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
