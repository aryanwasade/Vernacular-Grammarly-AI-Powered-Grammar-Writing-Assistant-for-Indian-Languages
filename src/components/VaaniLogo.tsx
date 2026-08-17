import React from 'react';

interface VaaniLogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'icon';
  theme?: 'light' | 'dark' | 'color';
}

export const VaaniLogoMark: React.FC<{ size?: number; className?: string; idPrefix?: string }> = ({ 
  size = 40, 
  className = '',
  idPrefix = 'vaani'
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Modern Vibrant Gradient */}
        <linearGradient id={`${idPrefix}-grad-primary`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" /> {/* Emerald green */}
          <stop offset="50%" stopColor="#0EA5E9" /> {/* Bright cyan/blue */}
          <stop offset="100%" stopColor="#6366F1" /> {/* Indigo */}
        </linearGradient>

        <linearGradient id={`${idPrefix}-grad-accent`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" /> {/* Amber/Saffron */}
          <stop offset="100%" stopColor="#EC4899" /> {/* Pink */}
        </linearGradient>

        <filter id={`${idPrefix}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded Container Base */}
      <rect x="10" y="10" width="180" height="180" rx="48" fill={`url(#${idPrefix}-grad-primary)`} />

      {/* Soft Inner Shadow / Contrast Glow */}
      <rect x="12" y="12" width="176" height="176" rx="46" fill="black" fillOpacity="0.08" />

      {/* Sound Waves & Vernacular Curve Geometry (representing speech & Indian script elegance) */}
      <g transform="translate(100, 100)">
        {/* Central Lotus/Voice Wave Petal 1 */}
        <path
          d="M 0 -52 C 30 -30, 45 0, 45 32 C 45 55, 25 70, 0 70 C -25 70, -45 55, -45 32 C -45 0, -30 -30, 0 -52 Z"
          fill="white"
          fillOpacity="0.22"
        />

        {/* Central Lotus/Voice Wave Petal 2 (Shifted Overlap) */}
        <path
          d="M -15 -35 C 10 -20, 30 10, 30 38 C 30 55, 12 65, -15 65 C -35 65, -50 50, -50 30 C -50 5, -35 -20, -15 -35 Z"
          fill="white"
          fillOpacity="0.35"
        />

        {/* Core Speech Resonance Wave Loop */}
        <path
          d="M -32 10 C -32 -25, -10 -42, 12 -42 C 35 -42, 48 -22, 48 5 C 48 30, 28 48, -2 48 C -22 48, -32 32, -32 10 Z"
          fill="white"
        />

        {/* Dynamic Voice Pulse Bar 1 */}
        <rect x="-18" y="-12" width="8" height="24" rx="4" fill={`url(#${idPrefix}-grad-primary)`} />
        {/* Dynamic Voice Pulse Bar 2 (Taller) */}
        <rect x="-4" y="-22" width="8" height="44" rx="4" fill={`url(#${idPrefix}-grad-primary)`} />
        {/* Dynamic Voice Pulse Bar 3 */}
        <rect x="10" y="-16" width="8" height="32" rx="4" fill={`url(#${idPrefix}-grad-primary)`} />
        {/* Dynamic Voice Pulse Bar 4 */}
        <rect x="24" y="-6" width="8" height="16" rx="4" fill={`url(#${idPrefix}-grad-primary)`} />

        {/* Vernacular Top Matra/Accent Spark Dot */}
        <circle cx="12" cy="-56" r="8" fill={`url(#${idPrefix}-grad-accent)`} />
      </g>
    </svg>
  );
};
