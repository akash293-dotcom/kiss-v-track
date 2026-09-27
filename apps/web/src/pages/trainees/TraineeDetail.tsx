import React from 'react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';

export default function TraineeDetail() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trainee Profile</h1>
      <Card title="Overview">
        <p>Details view</p>
      </Card>
      <Card title="Skills Progress">
        <div className="space-y-4">
          <ProgressBar progress={85} label="Web Development" showValue />
          <ProgressBar progress={45} label="React JS" showValue color="warning" />
        </div>
      </Card>
    </div>
  );
}
