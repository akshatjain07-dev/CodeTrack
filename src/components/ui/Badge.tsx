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
      Easy: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      Medium: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
      Hard: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${diffStyles[difficulty]} ${className}`}
      >
        {difficulty}
      </span>
    );
  }

  // Status styling
  if (variant === 'status' && status) {
    const statusStyles: Record<QuestionStatus, string> = {
      Solved: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40',
      Attempted: 'text-amber-400 bg-amber-950/30 border-amber-800/40',
      'Not Started': 'text-zinc-400 bg-zinc-800/30 border-zinc-700/40',
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${statusStyles[status]} ${className}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === 'Solved'
              ? 'bg-emerald-400'
              : status === 'Attempted'
              ? 'bg-amber-400 animate-pulse'
              : 'bg-zinc-500'
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
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono text-zinc-400 bg-zinc-800/60 border border-zinc-700/50 ${className}`}
      >
        {platform}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-zinc-300 bg-zinc-800/50 border border-zinc-700/40 ${className}`}
    >
      {children}
    </span>
  );
};
