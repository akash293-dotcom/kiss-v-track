import React from 'react';
import { Card } from '../../components/ui/Card';

export default function AssessmentForm() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Assessment</h1>
      <Card title="Assessment Form">
        <p>Create or edit assessment</p>
      </Card>
    </div>
  );
}
