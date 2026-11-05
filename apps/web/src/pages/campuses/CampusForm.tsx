import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

const campusSchema = z.object({
  code: z.string().trim().min(2, 'Code is required'),
  name: z.string().trim().min(3, 'Name is required'),
  address: z.string().trim().min(5, 'Address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z.string().trim().min(4, 'Pincode is required'),
});
type CampusFormValues = z.infer<typeof campusSchema>;

export default function CampusForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { data: campus, isLoading: campusLoading, isError: campusError } = useQuery({
    queryKey: ['campus', id],
    queryFn: async () => (await api.get(`/campuses/${id}`)).data?.data,
    enabled: isEdit,
  });

  // Campus creation needs the organisation foreign key. Reuse the organisation
  // attached to an existing campus instead of relying on a hard-coded UUID.
  const { data: existingCampuses = [], isLoading: campusesLoading } = useQuery({
    queryKey: ['campuses', 'organization-lookup'],
    queryFn: async () => {
      const response = await api.get('/campuses', { params: { page: 1, limit: 1 } });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: !isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CampusFormValues>({
    resolver: zodResolver(campusSchema),
    defaultValues: { code: '', name: '', address: '', city: '', state: '', pincode: '' },
  });

  useEffect(() => {
    if (!campus) return;
    reset({ code: campus.code || '', name: campus.name || '', address: campus.address || '', city: campus.city || '', state: campus.state || '', pincode: campus.pincode || '' });
  }, [campus, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: CampusFormValues) => {
      const payload = { ...values };
      if (isEdit) return api.patch(`/campuses/${id}`, payload);
      const organizationId = existingCampuses[0]?.organizationId;
      if (!organizationId) throw new Error('No organisation is linked to an existing campus. Initialise the KISS organisation before adding another campus.');
      return api.post('/campuses', { ...payload, organizationId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['campuses'] });
      await queryClient.invalidateQueries({ queryKey: ['campus', id] });
      await queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      navigate('/admin/campuses');
    },
    onError: (error: any) => alert(error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Failed to save campus'),
  });

  if ((isEdit && campusLoading) || (!isEdit && campusesLoading)) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;
  if (isEdit && (campusError || !campus)) return <Card title="Campus unavailable"><p className="text-sm text-red-600">This campus could not be loaded.</p><Button className="mt-4" onClick={() => navigate('/admin/campuses')}>Back to campuses</Button></Card>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Campus' : 'Add New Campus'}</h1><p className="mt-1 text-sm text-gray-500">{isEdit ? 'Update campus location details.' : 'Register a campus under the existing KISS organisation.'}</p></div>
      <Card>
        <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Campus code" required error={errors.code?.message}><Input {...register('code')} placeholder="e.g. KISS-BBSR" /></FormField>
            <FormField label="Campus name" required error={errors.name?.message}><Input {...register('name')} placeholder="Campus name" /></FormField>
          </div>
          <FormField label="Address" required error={errors.address?.message}><Input {...register('address')} placeholder="Street address" /></FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="City" required error={errors.city?.message}><Input {...register('city')} /></FormField>
            <FormField label="State" required error={errors.state?.message}><Input {...register('state')} /></FormField>
            <FormField label="Pincode" required error={errors.pincode?.message}><Input {...register('pincode')} /></FormField>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/campuses')}>Cancel</Button>
            <Button type="submit" isLoading={saveMutation.isPending}>{isEdit ? 'Update Campus' : 'Save Campus'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
