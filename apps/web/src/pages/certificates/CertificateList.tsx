import React from 'react';
import { Card } from '../../components/ui/Card';

export default function CertificateList() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Certificates</h1>
      <Card title="Certificate List">
        <p>List of issued certificates</p>
      </Card>
    </div>
  );
}
