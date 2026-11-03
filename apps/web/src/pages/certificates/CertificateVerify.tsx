import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function CertificateVerify() {
  const { certificateNo = '' } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-certificate-verification', certificateNo],
    queryFn: async () => {
      const response = await api.get(`/certificates/verify/${encodeURIComponent(certificateNo)}`);
      return response.data?.data;
    },
    enabled: Boolean(certificateNo),
    retry: false,
  });

  const isValid = data?.status === 'ISSUED';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <Card className="max-w-xl w-full" title="Certificate Verification" description="Official KISS V-TRACK certificate status lookup">
        {isLoading ? (
          <div className="py-8 flex justify-center"><LoadingSpinner size={32} /></div>
        ) : isError || !data ? (
          <div className="space-y-3">
            <Badge color="red">Not verified</Badge>
            <p className="text-gray-700">No certificate was found for this certificate number. Check the number and try again.</p>
            <p className="text-sm text-gray-500">Certificate No: {certificateNo}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Badge color={isValid ? 'green' : 'red'}>{isValid ? 'Valid certificate' : `Not valid — ${data.status}`}</Badge>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Certificate No.</dt><dd className="font-semibold text-gray-900">{data.certificateNo}</dd></div>
              <div><dt className="text-gray-500">Status</dt><dd className="font-semibold text-gray-900">{data.status}</dd></div>
              <div><dt className="text-gray-500">Trainee</dt><dd className="font-semibold text-gray-900">{data.traineeName}</dd></div>
              <div><dt className="text-gray-500">Program</dt><dd className="font-semibold text-gray-900">{data.programName}</dd></div>
              <div><dt className="text-gray-500">Training period</dt><dd className="font-semibold text-gray-900">{data.trainingPeriod || '—'}</dd></div>
              <div><dt className="text-gray-500">Training hours</dt><dd className="font-semibold text-gray-900">{data.trainingHours ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Issue date</dt><dd className="font-semibold text-gray-900">{data.issueDate ? new Date(data.issueDate).toLocaleDateString() : '—'}</dd></div>
            </dl>
            {Array.isArray(data.verifiedSkills) && data.verifiedSkills.length > 0 && (
              <div><h3 className="text-sm font-semibold text-gray-700 mb-2">Verified skills</h3><div className="flex flex-wrap gap-2">{data.verifiedSkills.map((skill: string) => <Badge key={skill} color="blue">{skill}</Badge>)}</div></div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
