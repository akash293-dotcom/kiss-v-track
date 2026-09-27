import React from 'react';
import { Card } from '../../components/ui/Card';

export default function TraineeDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trainee Dashboard</h1>
      <Card title="Overall Progress">
        <p>Overall progress, attendance, skills, upcoming sessions</p>
      </Card>
    </div>
  );
}
