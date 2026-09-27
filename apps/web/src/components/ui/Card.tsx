import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ className, title, description, footer, children, ...props }: CardProps) {
  return (
    <div className={cn("bg-white shadow rounded-lg overflow-hidden", className)} {...props}>
      {(title || description) && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          {title && <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>}
          {description && <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
      {footer && <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">{footer}</div>}
    </div>
  );
}
