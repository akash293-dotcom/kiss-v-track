import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 24, className = '', fullScreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <Loader2 
      size={size} 
      className={`animate-spin text-indigo-600 ${className}`} 
    />
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
