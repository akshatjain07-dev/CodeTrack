import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ children, label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-zinc-400 font-medium">{label}</label>}
      <select
        className={`bg-zinc-900/90 text-zinc-200 border border-zinc-700/60 rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};
