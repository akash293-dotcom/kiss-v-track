import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import api from '../../lib/api';

export default function TraineeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: trainee,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['trainee', id],
    queryFn: async () => {
      const response = await api.get(`/trainees/${id}`);
      return response.data?.data;
    }
  });

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !trainee) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Trainee Profile
        </h1>

        <div className="bg-white rounded-lg shadow p-6 text-red-600">
          {(error as any)?.response?.data?.message ||
            'Trainee not found.'}
        </div>

        <Button
          type="button"
          onClick={() =>
            navigate('/admin/trainees')
          }
        >
          Back to Trainees
        </Button>
      </div>
    );
  }

  const fullName = `${trainee.user?.firstName || ''} ${trainee.user?.lastName || ''}`.trim();

  const status =
    trainee.enrollmentStatus ||
    trainee.status ||
    (trainee.user?.isActive === false
      ? 'INACTIVE'
      : 'ACTIVE');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Trainee Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View trainee information
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="ghost"
            icon={<ArrowLeft size={16} />}
            onClick={() =>
              navigate('/admin/trainees')
            }
          >
            Back
          </Button>

          <Button
            type="button"
            icon={<Edit size={16} />}
            onClick={() =>
              navigate(
                `/admin/trainees/${trainee.id}/edit`
              )
            }
          >
            Edit Trainee
          </Button>
        </div>
      </div>

      <Card title="Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">
              Name
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {fullName || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {trainee.user?.email || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Phone
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {trainee.user?.phone || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Student ID
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {trainee.studentId || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Campus
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {trainee.campus?.name || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Gender
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {trainee.gender || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Date of Birth
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {trainee.dateOfBirth
                ? new Date(
                    trainee.dateOfBirth
                  ).toLocaleDateString()
                : '-'}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Skills Progress">
        <div className="py-6 text-sm text-gray-500">
          Use the trainee's skills section to view
          detailed skill progress.
        </div>
      </Card>
    </div>
  );
}