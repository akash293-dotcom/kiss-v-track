import React from 'react';
import { getInitials, cn } from '../../lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base'
  };

  const baseClasses = "rounded-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold overflow-hidden";
  
  if (src) {
    return (
      <img 
        src={src} 
        alt={name} 
        className={cn(baseClasses, sizes[size], "object-cover", className)} 
      />
    );
  }

  return (
    <div className={cn(baseClasses, sizes[size], className)}>
      {getInitials(name)}
    </div>
  );
}
