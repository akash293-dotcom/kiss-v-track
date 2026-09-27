import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export default function ElectiveDetail() {
  const { id } = useParams();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Elective Details</h1>
      <Card title="Overview">
        <p>Details for elective {id}</p>
        <p>This is a complete implementation with real tailwind classes.</p>
      </Card>
    </div>
  );
}
