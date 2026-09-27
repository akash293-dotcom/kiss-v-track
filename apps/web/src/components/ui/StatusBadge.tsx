import React from 'react';
import { Badge } from './Badge';
import { getStatusColor } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = getStatusColor(status);
  
  return (
    <Badge color={color as any}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
