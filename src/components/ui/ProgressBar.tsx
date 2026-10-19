import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'bg-sky-500',
  size = 'sm',
  className = '',
  showText = false,
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      <div className={`w-full ${height} bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700/30`}>
        <div
          className={`${height} ${color} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showText && (
        <span className="text-xs font-mono font-medium text-zinc-400 shrink-0">
          {clamped}%
        </span>
      )}
    </div>
  );
};
