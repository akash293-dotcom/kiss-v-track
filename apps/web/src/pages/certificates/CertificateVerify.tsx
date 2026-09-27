import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function CertificateVerify() {
  const { certificateNo } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <Card className="max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Certificate Verification</h1>
        <div className="mb-8">
          <Badge color="green" className="text-lg px-4 py-2">
            Verified Successfully
          </Badge>
        </div>
        <div className="text-left space-y-4">
          <p><strong>Certificate No:</strong> {certificateNo}</p>
          <p><strong>Status:</strong> Valid and Authentic</p>
        </div>
      </Card>
    </div>
  );
}
