import React from 'react';
import { Card } from '../../components/ui/Card';

export default function BatchDetail() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Batch Details</h1>
      <Card title="Overview">
        <p>Details view showing enrolled trainees, sessions, overall progress</p>
      </Card>
    </div>
  );
}
