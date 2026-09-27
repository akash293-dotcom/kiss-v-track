import React from 'react';
import { Card } from '../../components/ui/Card';

export default function AttendanceReport() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Report</h1>
      <Card title="Overview">
        <p>View attendance summary with stats and pie chart</p>
      </Card>
    </div>
  );
}
