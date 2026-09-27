import React from 'react';
import { Card } from '../../components/ui/Card';

export default function TrainerDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trainer Dashboard</h1>
      <Card title="Trainer Overview">
        <p>Pending items, today's sessions list</p>
      </Card>
    </div>
  );
}
