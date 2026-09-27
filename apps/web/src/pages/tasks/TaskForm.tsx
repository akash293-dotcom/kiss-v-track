import React from 'react';
import { Card } from '../../components/ui/Card';

export default function TaskForm() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Task</h1>
      <Card title="Task Form">
        <p>Form to create or edit task</p>
      </Card>
    </div>
  );
}
