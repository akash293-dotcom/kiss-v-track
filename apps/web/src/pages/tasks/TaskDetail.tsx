import React from 'react';
import { Card } from '../../components/ui/Card';

export default function TaskDetail() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Task Detail</h1>
      <Card title="Task Details">
        <p>View task</p>
      </Card>
    </div>
  );
}
