import React from 'react';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd: React.FC<KbdProps> = ({ children, className = '' }) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-secondary bg-surface-subtle border border-subtle rounded shadow-xs select-none ${className}`}
    >
      {children}
    </kbd>
  );
};
