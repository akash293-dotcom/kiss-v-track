import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function ProgressBar({ 
  progress, 
  label, 
  showValue = false, 
  color = 'primary',
  className 
}: ProgressBarProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  const colors = {
    primary: 'bg-indigo-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600'
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
          {label && <span className="text-gray-700">{label}</span>}
          {showValue && <span className="text-gray-900">{Math.round(safeProgress)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={cn("h-2.5 rounded-full transition-all duration-500 ease-out", colors[color])} 
          style={{ width: `${safeProgress}%` }}
        ></div>
      </div>
    </div>
  );
}
