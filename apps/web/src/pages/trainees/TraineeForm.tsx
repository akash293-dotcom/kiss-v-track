import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  studentId: z.string().min(2),
  campusId: z.string().min(1),
  status: z.enum(['ACTIVE', 'INACTIVE'])
});

export default function TraineeForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE' }
  });

  const onSubmit = () => navigate('/admin/trainees');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add Trainee</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required error={errors.firstName?.message as string}>
              <Input {...register('firstName')} />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName?.message as string}>
              <Input {...register('lastName')} />
            </FormField>
          </div>
          <FormField label="Email" required error={errors.email?.message as string}>
            <Input type="email" {...register('email')} />
          </FormField>
          <FormField label="Student ID" required error={errors.studentId?.message as string}>
            <Input {...register('studentId')} />
          </FormField>
          <FormField label="Campus" required error={errors.campusId?.message as string}>
            <Select {...register('campusId')} options={[{label: 'Main', value: '1'}]} />
          </FormField>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
