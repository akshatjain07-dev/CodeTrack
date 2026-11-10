import React from 'react';

export interface LogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showProBadge?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showProBadge = false,
}) => {
  // Dimension tokens
  const sizeMap = {
    sm: {
      icon: 'w-6 h-6',
      text: 'text-sm',
      badge: 'text-[9px] px-1 py-0.2',
      gap: variant === 'vertical' ? 'gap-1.5' : 'gap-2',
    },
    md: {
      icon: 'w-8 h-8',
      text: 'text-lg',
      badge: 'text-[10px] px-1.5 py-0.5',
      gap: variant === 'vertical' ? 'gap-2' : 'gap-2.5',
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-2xl',
      badge: 'text-xs px-2 py-0.5',
      gap: variant === 'vertical' ? 'gap-3' : 'gap-3.5',
    },
  };

  const currentSize = sizeMap[size];

  // The Classic CodeTrack Icon SVG
  // Features:
  // 1. Two sturdy electric indigo (#6366F1) code brackets '< >'
  // 2. Nestled inside: A precise emerald green (#10B981) track path and checkmark graphic with an upward arrow peak
  // 3. Small connecting square data nodes at the base to represent Data Structures & Algorithms
  // 4. Purely 2D, flat, solid design without intense gradient glow for an enterprise-grade feel
  const IconSvg = (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 ${currentSize.icon} group-hover:scale-105 transition-transform duration-200`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Flat squircle container background for contrast & definition */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="9"
          fill="#141417"
          stroke="#27272A"
          strokeWidth="1.2"
        />

        {/* Left Code Bracket '<' in Electric Indigo (#6366F1) */}
        <path
          d="M 12.5 11 L 6 20 L 12.5 29"
          stroke="#6366F1"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Code Bracket '>' in Electric Indigo (#6366F1) */}
        <path
          d="M 27.5 11 L 34 20 L 27.5 29"
          stroke="#6366F1"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Track Path & Checkmark Graphic in Emerald Green (#10B981) */}
        <path
          d="M 15 19.5 L 19.5 24 L 27 12"
          stroke="#10B981"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Upward-pointing trajectory arrow head at checkmark peak */}
        <path
          d="M 22.5 12 H 27 V 16.5"
          stroke="#10B981"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Track link from base data node to checkmark vertex */}
        <line
          x1="19.5"
          y1="24"
          x2="19.5"
          y2="28"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Small Connecting Square Data Nodes at Base (DSA representation) */}
        <line
          x1="14"
          y1="28.5"
          x2="25"
          y2="28.5"
          stroke="#6366F1"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect x="12.5" y="27" width="3" height="3" rx="0.5" fill="#6366F1" />
        <rect x="18" y="27" width="3" height="3" rx="0.5" fill="#10B981" />
        <rect x="23.5" y="27" width="3" height="3" rx="0.5" fill="#6366F1" />
      </svg>
    </div>
  );

  // The "codetrack." Wordmark
  // Modern, futuristic, geometric sans-serif lettering:
  // - "code" in bold, crisp white (#FAFAFA)
  // - "track" in electric indigo (#6366F1)
  // - "." (the ending dot) in emerald green (#10B981)
  const Wordmark = (
    <span
      className={`font-black tracking-tight font-sans select-none flex items-center ${currentSize.text}`}
    >
      <span className="text-[#FAFAFA]">code</span>
      <span className="text-[#6366F1]">track</span>
      <span className="text-[#10B981]">.</span>

      {showProBadge && (
        <span
          className={`ml-1.5 uppercase font-bold rounded bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30 ${currentSize.badge}`}
        >
          Pro
        </span>
      )}
    </span>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{IconSvg}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`inline-flex flex-col items-center ${currentSize.gap} ${className}`}>
        {IconSvg}
        {Wordmark}
      </div>
    );
  }

  // Default: horizontal variant
  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {IconSvg}
      {Wordmark}
    </div>
  );
};

export default Logo;
