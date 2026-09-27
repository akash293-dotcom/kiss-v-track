import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch: (value: string) => void;
  debounceMs?: number;
}

export function SearchInput({ onSearch, debounceMs = 300, className, ...props }: SearchInputProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [value, onSearch, debounceMs]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="search"
        className="pl-10"
        placeholder="Search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        {...props}
      />
    </div>
  );
}
