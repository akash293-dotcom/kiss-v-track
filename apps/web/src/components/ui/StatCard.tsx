import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("flex items-center p-6", className)}>
      <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
        <Icon className="h-8 w-8" />
      </div>
      <div className="ml-5">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className={cn(
              "ml-2 flex items-baseline text-sm font-semibold",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
