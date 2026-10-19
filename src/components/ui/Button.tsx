import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantStyles = {
    primary: 'bg-sky-500 text-slate-950 hover:bg-sky-400 font-semibold shadow-sm',
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/60',
    outline: 'bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-zinc-700',
    ghost: 'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40',
    danger: 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
