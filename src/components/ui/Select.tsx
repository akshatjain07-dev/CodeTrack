import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ children, label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-secondary font-medium">{label}</label>}
      <select
        className={`bg-surface text-primary border border-subtle rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-none focus:border-default focus:ring-1 focus:ring-primary cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};
