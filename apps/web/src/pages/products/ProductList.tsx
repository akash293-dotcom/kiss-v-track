import React from 'react';
import { Card } from '../../components/ui/Card';

export default function ProductList() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <Card title="Product List">
        <p>List of trainee products</p>
      </Card>
    </div>
  );
}
