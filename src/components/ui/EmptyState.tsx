import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center border border-zinc-800/80 rounded-lg bg-zinc-900/30 ${className}`}
    >
      {icon && <div className="p-3 text-zinc-500 bg-zinc-800/50 rounded-full mb-3">{icon}</div>}
      <h3 className="text-sm font-semibold text-zinc-200 mb-1">{title}</h3>
      <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
