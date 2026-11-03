import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color,
  size = 'sm',
  className = '',
  showText = false,
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  const fillColor = color || (clamped >= 100 ? 'bg-[#70D6A3]' : 'bg-[#FFD447]');
  const [renderedWidth, setRenderedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderedWidth(clamped);
    }, 50);
    return () => clearTimeout(timer);
  }, [clamped]);

  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      <div className={`w-full ${height} bg-surface-subtle rounded-full overflow-hidden border border-subtle`}>
        <div
          className={`${height} ${fillColor} transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${renderedWidth}%` }}
        />
      </div>
      {showText && (
        <span className="text-xs font-mono font-medium text-secondary shrink-0">
          {clamped}%
        </span>
      )}
    </div>
  );
};
