import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const moduleSchema = z.object({
  name: z.string().trim().min(2, 'Enter a module name'),
  sequenceOrder: z.number().int().min(1, 'Order must be at least 1'),
  description: z.string().optional(),
  theoryHours: z.number().int().min(0, 'Theory hours cannot be negative'),
  practicalHours: z.number().int().min(0, 'Practical hours cannot be negative'),
  learningObjectives: z.string().optional(),
  completionCriteria: z.string().optional(),
  isActive: z.enum(['true', 'false']),
});

type ModuleFormValues = z.infer<typeof moduleSchema>;

const asArray = (value: unknown): any[] => Array.isArray(value) ? value : [];

export default function ModuleForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { electiveId = '', moduleId = '' } = useParams<{ electiveId: string; moduleId: string }>();
  const isEdit = Boolean(moduleId);

  const [skillIds, setSkillIds] = useState<string[]>([]);

  const { data: elective, isLoading: electiveLoading, isError: electiveError } = useQuery({
    queryKey: ['elective', electiveId],
    queryFn: async () => (await api.get(`/electives/${electiveId}`)).data?.data,
    enabled: Boolean(electiveId),
  });

  const { data: module, isLoading: moduleLoading, isError: moduleError } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: async () => (await api.get(`/modules/${moduleId}`)).data?.data,
    enabled: isEdit,
  });

  const { data: allSkills = [], isLoading: skillsLoading, isError: skillsError } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => asArray((await api.get('/skills')).data?.data),
  });

  const availableSkills = useMemo(() => {
    if (!elective?.categoryId) return allSkills;
    return allSkills.filter((skill: any) => skill.categoryId === elective.categoryId);
  }, [allSkills, elective?.categoryId]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: '',
      sequenceOrder: 1,
      description: '',
      theoryHours: 0,
      practicalHours: 0,
      learningObjectives: '',
      completionCriteria: '',
      isActive: 'true',
    },
  });

  useEffect(() => {
    if (!module) return;
    reset({
      name: module.name || '',
      sequenceOrder: Number(module.sequenceOrder || 1),
      description: module.description || '',
      theoryHours: Number(module.theoryHours || 0),
      practicalHours: Number(module.practicalHours || 0),
      learningObjectives: module.learningObjectives || '',
      completionCriteria: module.completionCriteria || '',
      isActive: module.isActive === false ? 'false' : 'true',
    });
    setSkillIds(asArray(module.moduleSkills).map((item: any) => item.skillId || item.skill?.id).filter(Boolean));
  }, [module, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: ModuleFormValues) => {
      const payload = {
        electiveId,
        name: values.name.trim(),
        sequenceOrder: values.sequenceOrder,
        description: values.description?.trim() || undefined,
        theoryHours: values.theoryHours,
        practicalHours: values.practicalHours,
        learningObjectives: values.learningObjectives?.trim() || undefined,
        completionCriteria: values.completionCriteria?.trim() || undefined,
        isActive: values.isActive === 'true',
        skillIds,
      };
      return isEdit ? api.patch(`/modules/${moduleId}`, payload) : api.post('/modules', payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['elective', electiveId] }),
        queryClient.invalidateQueries({ queryKey: ['module', moduleId] }),
        queryClient.invalidateQueries({ queryKey: ['modules', electiveId] }),
      ]);
      toast.success(isEdit ? 'Module updated successfully' : 'Module created successfully');
      navigate(`/admin/electives/${electiveId}`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Could not save module. Check that its order number is unique within this elective.'
      );
    },
  });

  if (electiveLoading || (isEdit && moduleLoading) || skillsLoading) {
    return <div className="flex justify-center py-16"><LoadingSpinner size={32} /></div>;
  }

  if (electiveError || !elective || (isEdit && (moduleError || !module))) {
    return (
      <Card title="Module unavailable">
        <p className="text-sm text-red-600">The elective or module could not be loaded.</p>
        <Button className="mt-4" onClick={() => navigate('/admin/electives')}>Back to electives</Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{elective.code}</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{isEdit ? 'Edit module' : 'Add module'}</h1>
        <p className="mt-1 text-sm text-gray-500">{elective.name}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Module name" required error={errors.name?.message}>
              <Input {...register('name')} placeholder="e.g. Introduction to stitching" />
            </FormField>
            <FormField label="Sequence order" required error={errors.sequenceOrder?.message}>
              <Input type="number" min="1" step="1" {...register('sequenceOrder', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Theory hours" required error={errors.theoryHours?.message}>
              <Input type="number" min="0" step="1" {...register('theoryHours', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Practical hours" required error={errors.practicalHours?.message}>
              <Input type="number" min="0" step="1" {...register('practicalHours', { valueAsNumber: true })} />
            </FormField>
          </div>

          <FormField label="Description">
            <TextArea {...register('description')} rows={3} placeholder="Describe what this module covers" />
          </FormField>
          <FormField label="Learning objectives">
            <TextArea {...register('learningObjectives')} rows={3} placeholder="What should trainees learn?" />
          </FormField>
          <FormField label="Completion criteria">
            <TextArea {...register('completionCriteria')} rows={3} placeholder="How will module completion be assessed?" />
          </FormField>
          <FormField label="Status" required error={errors.isActive?.message}>
            <Select {...register('isActive')} options={[{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }]} />
          </FormField>

          <div className="border-t border-gray-100 pt-4">
            <div className="mb-3">
              <h2 className="font-semibold text-gray-900">Skills covered</h2>
              <p className="mt-1 text-xs text-gray-500">Select skills from this elective's category. Skill selection is optional.</p>
            </div>
            {skillsError ? (
              <p className="text-sm text-red-600">The skills catalogue could not be loaded. You can still save the module without linking skills.</p>
            ) : availableSkills.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">No skills are available for this category yet.</p>
            ) : (
              <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-gray-200 p-3 sm:grid-cols-2">
                {availableSkills.map((skill: any) => (
                  <label key={skill.id} className="flex cursor-pointer items-start gap-2 rounded-md p-2 text-sm hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={skillIds.includes(skill.id)}
                      onChange={(event) => setSkillIds((current) => event.target.checked ? [...current, skill.id] : current.filter((id) => id !== skill.id))}
                    />
                    <span><span className="block font-medium text-gray-800">{skill.name}</span><span className="text-xs text-gray-500">{skill.code}</span></span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => navigate(`/admin/electives/${electiveId}`)}>Cancel</Button>
            <Button type="submit" isLoading={saveMutation.isPending}>{isEdit ? 'Update module' : 'Create module'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
