import React from 'react';
import { Card } from '../../components/ui/Card';

export default function AssessmentList() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assessments</h1>
      <Card title="Assessment List">
        <p>List of assessments</p>
      </Card>
    </div>
  );
}
