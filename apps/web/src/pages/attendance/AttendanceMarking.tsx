import React from 'react';
import { Card } from '../../components/ui/Card';

export default function AttendanceMarking() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mark Attendance</h1>
      <Card title="Session Attendance">
        <p>Mobile-friendly layout for selecting PRESENT/ABSENT/LATE/EXCUSED</p>
      </Card>
    </div>
  );
}
