import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="absolute left-3 text-zinc-400 pointer-events-none flex items-center">
          {icon}
        </span>
      )}
      <input
        className={`w-full bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 border border-zinc-700/60 rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${
          icon ? 'pl-9' : ''
        } ${className}`}
        {...props}
      />
    </div>
  );
};
