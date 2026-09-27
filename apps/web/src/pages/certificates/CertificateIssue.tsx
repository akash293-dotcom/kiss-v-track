import React from 'react';
import { Card } from '../../components/ui/Card';

export default function CertificateIssue() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Issue Certificate</h1>
      <Card title="Issue Form">
        <p>Issue new certificate to trainee</p>
      </Card>
    </div>
  );
}
