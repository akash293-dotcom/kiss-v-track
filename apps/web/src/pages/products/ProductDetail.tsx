import React from 'react';
import { Card } from '../../components/ui/Card';

export default function ProductDetail() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Product Details</h1>
      <Card title="Overview">
        <p>View product</p>
      </Card>
    </div>
  );
}
