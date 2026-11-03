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

  // The official CodeTrack Icon SVG
  // Features:
  // 1. Left code bracket '<' that seamlessly transitions into a rising analytics trend line ending in an upward arrow '↗'
  // 2. Accented with small glowing circuit / data nodes
  // 3. Electric Indigo (#6366F1) to Emerald Green (#10B981) linear gradient
  const IconSvg = (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 ${currentSize.icon} group-hover:scale-105 transition-transform duration-200`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_10px_rgba(99,102,241,0.35)]"
      >
        <defs>
          {/* Linear gradient: Electric Indigo (#6366F1) -> Emerald Green (#10B981) */}
          <linearGradient id="ctGradientStroke" x1="4" y1="28" x2="36" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="55%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Radial node glow */}
          <radialGradient id="ctNodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="1" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>

          {/* Soft background container gradient */}
          <linearGradient id="ctBgGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#18181B" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>
        </defs>

        {/* Squircle container background */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="10"
          fill="url(#ctBgGradient)"
          stroke="#27272A"
          strokeWidth="1.2"
        />

        {/* Left code bracket '<' merging into rising analytics trend line ending in '↗' */}
        <path
          d="M 14 11 L 7.5 19.5 L 14 27 L 18 22 L 23 25.5 L 32.5 11"
          stroke="url(#ctGradientStroke)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Upward arrow head '↗' at trend line peak */}
        <path
          d="M 26 11 H 32.5 V 17.5"
          stroke="#10B981"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Circuit / Data nodes at inflection vertices */}
        {/* Node 1: Bracket vertex */}
        <circle cx="7.5" cy="19.5" r="1.8" fill="#FAFAFA" />
        <circle cx="7.5" cy="19.5" r="3.2" stroke="#6366F1" strokeWidth="0.8" opacity="0.6" />

        {/* Node 2: Trend valley inflection */}
        <circle cx="18" cy="22" r="1.8" fill="#818CF8" />

        {/* Node 3: Mid-trend surge node */}
        <circle cx="23" cy="25.5" r="1.8" fill="#10B981" />

        {/* Node 4: Glowing peak arrow node */}
        <circle cx="32.5" cy="11" r="2.2" fill="#10B981" />
        <circle cx="32.5" cy="11" r="4.5" fill="url(#ctNodeGlow)" opacity="0.7" />
      </svg>
    </div>
  );

  // The official CodeTrack Wordmark
  // "code" in crisp white (#FAFAFA)
  // "track" in Electric Indigo (#6366F1)
  // "." (the period) in Emerald Green (#10B981)
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
