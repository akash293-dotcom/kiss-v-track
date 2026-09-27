import React from 'react';
import { Card } from '../../components/ui/Card';

export default function TaskList() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <Card title="Task List">
        <p>List of tasks</p>
      </Card>
    </div>
  );
}
