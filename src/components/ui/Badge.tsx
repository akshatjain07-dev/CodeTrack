import React from 'react';
import type { Difficulty, Platform, QuestionStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'difficulty' | 'status' | 'platform' | 'mono' | 'neutral';
  difficulty?: Difficulty;
  status?: QuestionStatus;
  platform?: Platform;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  difficulty,
  status,
  platform,
  className = '',
}) => {
  // Difficulty styling
  if (variant === 'difficulty' && difficulty) {
    const diffStyles: Record<Difficulty, string> = {
      Easy: 'text-[#70D6A3] border-[#70D6A3]/30 bg-[#70D6A3]/10 font-medium',
      Medium: 'text-[#FFD447] border-[#FFD447]/30 bg-[#FFD447]/10 font-medium',
      Hard: 'text-[#F04483] border-[#F04483]/30 bg-[#F04483]/10 font-semibold',
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${diffStyles[difficulty]} ${className}`}
      >
        {difficulty}
      </span>
    );
  }

  // Status styling
  if (variant === 'status' && status) {
    const statusStyles: Record<QuestionStatus, string> = {
      Solved: 'text-[#70D6A3] bg-[#70D6A3]/10 border-[#70D6A3]/30 font-medium',
      Attempted: 'text-[#FFD447] bg-[#FFD447]/10 border-[#FFD447]/30 font-medium',
      'Not Started': 'text-secondary bg-surface border-subtle',
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border ${statusStyles[status]} ${className}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === 'Solved'
              ? 'bg-[#70D6A3]'
              : status === 'Attempted'
              ? 'bg-[#FFD447]'
              : 'border border-muted'
          }`}
        />
        {status}
      </span>
    );
  }

  // Platform styling
  if (variant === 'platform' && platform) {
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono text-secondary bg-surface border border-subtle ${className}`}
      >
        {platform}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-secondary bg-surface border border-subtle ${className}`}
    >
      {children}
    </span>
  );
};
