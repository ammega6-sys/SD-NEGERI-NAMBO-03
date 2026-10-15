import React, { useState } from 'react';
import officialLogoImg from '../../assets/images/logo_sdn_nambo_03_1792037633557.jpg';
import sealBadgeImg from '../../assets/images/sdn_nambo03_seal_1792035932611.jpg';

interface SchoolLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showBorder?: boolean;
  variant?: 'emblem' | 'seal';
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showBorder = false,
  variant = 'emblem'
}) => {
  const [imageError, setImageError] = useState(false);

  const primarySrc = variant === 'seal' ? sealBadgeImg : officialLogoImg;

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28'
  };

  if (!imageError) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl bg-white flex items-center justify-center ${sizeClasses[size]} ${
          showBorder ? 'ring-2 ring-emerald-500/40 shadow-xs' : ''
        } ${className}`}
      >
        <img
          src={primarySrc}
          alt="Logo Resmi SD Negeri Nambo 03"
          className="w-full h-full object-contain p-0.5"
          onError={() => setImageError(true)}
          loading="eager"
        />
      </div>
    );
  }

  // Styled SVG Fallback with exact visual motif of SDN Nambo 03
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-800 to-blue-950 text-white rounded-xl shadow-xs ${sizeClasses[size]} ${className}`}
      title="Logo SD Negeri Nambo 03"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1"
      >
        {/* Shield background */}
        <path
          d="M50 5 L88 20 C88 55 70 82 50 95 C30 82 12 55 12 20 Z"
          fill="#059669"
          stroke="#1e3a8a"
          strokeWidth="3.5"
        />
        <path
          d="M50 9 L84 22 C84 53 68 78 50 90 C32 78 16 53 16 22 Z"
          fill="#10b981"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        {/* Book */}
        <polygon points="50,42 66,35 66,60 50,67" fill="#0284c7" />
        <polygon points="50,42 34,35 34,60 50,67" fill="#f97316" />
        <line x1="50" y1="42" x2="50" y2="67" stroke="#ffffff" strokeWidth="2" />
        {/* Padi & Kapas Arc */}
        <path
          d="M26 65 C22 45 32 30 46 22"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />
        <path
          d="M74 65 C78 45 68 30 54 22"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />
      </svg>
    </div>
  );
};
