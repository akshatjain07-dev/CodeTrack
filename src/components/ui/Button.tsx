import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer select-none';

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantStyles = {
    primary:
      'bg-[#F04483] text-white hover:bg-[#D83371] font-semibold shadow-xs hover:shadow-md active:scale-[0.98] border border-transparent',
    secondary:
      'bg-surface-elevated text-primary hover:bg-surface-subtle border border-subtle hover:border-default shadow-xs hover:shadow-sm active:scale-[0.98]',
    outline:
      'bg-transparent text-secondary hover:text-primary hover:bg-surface-subtle border border-subtle hover:border-default active:scale-[0.98]',
    ghost:
      'bg-transparent text-secondary hover:text-primary hover:bg-surface-subtle active:scale-[0.98]',
    danger:
      'bg-[#F04483]/15 text-[#F04483] hover:bg-[#F04483]/25 border border-[#F04483]/30 active:scale-[0.98]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="inline-flex shrink-0 transition-transform duration-150 group-hover:scale-105">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
};
