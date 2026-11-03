import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="absolute left-3 text-muted pointer-events-none flex items-center">
          {icon}
        </span>
      )}
      <input
        className={`w-full bg-surface text-primary placeholder-muted border border-subtle rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-none focus:border-default focus:ring-1 focus:ring-primary ${
          icon ? 'pl-9' : ''
        } ${className}`}
        {...props}
      />
    </div>
  );
};
