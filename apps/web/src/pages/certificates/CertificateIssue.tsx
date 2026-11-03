import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export default function CertificateIssue() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [traineeId, setTraineeId] = useState('');
  const [electiveId, setElectiveId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trainingPeriod, setTrainingPeriod] = useState('');
  const [trainingHours, setTrainingHours] = useState('0');
  const [signatory, setSignatory] = useState('');

  const { data: trainees = [], isLoading: traineesLoading } = useQuery({
    queryKey: ['trainees', 'certificate-issue'],
    queryFn: async () => {
      const response = await api.get('/trainees', { params: { page: 1, limit: 100 } });
      return response.data?.data?.trainees || [];
    },
  });
  const { data: electives = [], isLoading: electivesLoading } = useQuery({
    queryKey: ['electives', 'certificate-issue'],
    queryFn: async () => {
      const response = await api.get('/electives');
      const data = response.data?.data;
      return Array.isArray(data) ? data : data?.electives || [];
    },
  });
  const traineeOptions = useMemo(() => [{ label: traineesLoading ? 'Loading trainees…' : 'Select trainee', value: '' }, ...trainees.map((item: any) => ({ label: `${item.user?.firstName || ''} ${item.user?.lastName || ''} — ${item.studentId}`, value: item.id }))], [trainees, traineesLoading]);
  const electiveOptions = useMemo(() => [{ label: electivesLoading ? 'Loading programs…' : 'No program / standalone certificate', value: '' }, ...electives.map((item: any) => ({ label: item.name, value: item.id }))], [electives, electivesLoading]);

  const mutation = useMutation({
    mutationFn: async () => api.post('/certificates', { traineeId, electiveId: electiveId || undefined, title, description: description || undefined, trainingPeriod: trainingPeriod || undefined, trainingHours: Number(trainingHours) || 0, signatory: signatory || undefined }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['certificates'] }); navigate('/admin/certificates'); },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Issue certificate</h1><p className="mt-1 text-sm text-gray-500">Eligibility is checked by the API when a program is selected.</p></div>
      <Card title="Certificate details">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
          <FormField label="Trainee" required><Select value={traineeId} onChange={(event) => setTraineeId(event.target.value)} options={traineeOptions} disabled={traineesLoading}/></FormField>
          <FormField label="Program"><Select value={electiveId} onChange={(event) => setElectiveId(event.target.value)} options={electiveOptions} disabled={electivesLoading}/></FormField>
          <FormField label="Certificate title" required><Input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={2}/></FormField>
          <FormField label="Description"><Input value={description} onChange={(event) => setDescription(event.target.value)}/></FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Training period"><Input value={trainingPeriod} onChange={(event) => setTrainingPeriod(event.target.value)} placeholder="e.g. Jan–Jun 2026"/></FormField>
            <FormField label="Training hours"><Input type="number" min="0" value={trainingHours} onChange={(event) => setTrainingHours(event.target.value)}/></FormField>
          </div>
          <FormField label="Signatory"><Input value={signatory} onChange={(event) => setSignatory(event.target.value)}/></FormField>
          {mutation.isError && <p className="text-sm text-red-600">{(mutation.error as any)?.response?.data?.error?.message || 'Unable to issue certificate.'}</p>}
          <div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button><Button type="submit" disabled={!traineeId || title.trim().length < 2 || mutation.isPending} isLoading={mutation.isPending}>Issue certificate</Button></div>
        </form>
      </Card>
    </div>
  );
}
