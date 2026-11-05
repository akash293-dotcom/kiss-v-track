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
  name: z.string().trim().min(2, 'Enter a skill name'),
  code: z.string().trim().min(2, 'Enter a unique skill code'),
  categoryId: z.string().min(1, 'Select a category'),
  description: z.string().optional(),
  learningObjectives: z.string().optional(),
  assessmentCriteria: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  isActive: z.enum(['true', 'false']),
});
type FormValues = z.infer<typeof schema>;

const arrayFrom = (response: any): any[] => Array.isArray(response?.data?.data) ? response.data.data : [];

export default function SkillForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', 'skill-form'],
    queryFn: async () => arrayFrom(await api.get('/categories')),
  });
  const { data: skill, isLoading: skillLoading, isError: skillError } = useQuery({
    queryKey: ['skill', id],
    queryFn: async () => (await api.get(`/skills/${id}`)).data?.data,
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', code: '', categoryId: '', description: '', learningObjectives: '', assessmentCriteria: '', difficulty: 'BEGINNER', isActive: 'true' },
  });

  useEffect(() => {
    if (!skill) return;
    reset({
      name: skill.name || '', code: skill.code || '', categoryId: skill.categoryId || '',
      description: skill.description || '', learningObjectives: skill.learningObjectives || '',
      assessmentCriteria: skill.assessmentCriteria || '', difficulty: skill.difficulty || 'BEGINNER',
      isActive: skill.isActive === false ? 'false' : 'true',
    });
  }, [skill, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        name: values.name.trim(), code: values.code.trim(), categoryId: values.categoryId,
        description: values.description?.trim() || undefined,
        learningObjectives: values.learningObjectives?.trim() || undefined,
        assessmentCriteria: values.assessmentCriteria?.trim() || undefined,
        difficulty: values.difficulty, isActive: values.isActive === 'true',
      };
      return isEdit ? api.patch(`/skills/${id}`, payload) : api.post('/skills', payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['skills'] });
      await queryClient.invalidateQueries({ queryKey: ['skill', id] });
      toast.success(isEdit ? 'Skill updated successfully' : 'Skill created successfully');
      navigate('/admin/skills');
    },
    onError: (error: any) => toast.error(error?.response?.data?.error?.message || error?.response?.data?.message || 'Could not save skill'),
  });

  if (isEdit && skillLoading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;
  if (isEdit && (skillError || !skill)) return <Card title="Skill unavailable"><p className="text-sm text-red-600">This skill could not be loaded.</p><Button className="mt-4" onClick={() => navigate('/admin/skills')}>Back to skills</Button></Card>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Skill' : 'Create Skill'}</h1><p className="mt-1 text-sm text-gray-500">Define the competency that trainers assess and verify.</p></div>
      <Card>
        <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Skill name" required error={errors.name?.message}><Input {...register('name')} placeholder="e.g. Basic Stitching" /></FormField>
            <FormField label="Skill code" required error={errors.code?.message}><Input {...register('code')} placeholder="e.g. SKL-STITCH" /></FormField>
          </div>
          <FormField label="Category" required error={errors.categoryId?.message}><Select {...register('categoryId')} disabled={categoriesLoading} options={[{ label: categoriesLoading ? 'Loading categories…' : 'Select category', value: '' }, ...categories.map((category: any) => ({ label: category.name, value: category.id }))]} /></FormField>
          <FormField label="Description"><TextArea {...register('description')} rows={3} /></FormField>
          <FormField label="Learning objectives"><TextArea {...register('learningObjectives')} rows={3} /></FormField>
          <FormField label="Assessment criteria"><TextArea {...register('assessmentCriteria')} rows={3} /></FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Difficulty" required error={errors.difficulty?.message}><Select {...register('difficulty')} options={[
              { label: 'Beginner', value: 'BEGINNER' }, { label: 'Basic', value: 'BASIC' }, { label: 'Intermediate', value: 'INTERMEDIATE' }, { label: 'Advanced', value: 'ADVANCED' }, { label: 'Expert', value: 'EXPERT' },
            ]} /></FormField>
            <FormField label="Status" required error={errors.isActive?.message}><Select {...register('isActive')} options={[{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }]} /></FormField>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/skills')}>Cancel</Button>
            <Button type="submit" isLoading={saveMutation.isPending}>{isEdit ? 'Update skill' : 'Save skill'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
