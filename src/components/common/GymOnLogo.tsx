import React from 'react';

interface GymOnLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Official GymOn Brand Logo Component
 * Uses the official public/gymon-new-logo.png image (which already includes "PROVIDER PORTAL")
 */
export function GymOnLogo({
  size = 'md',
  onClick,
  className = '',
}: GymOnLogoProps) {
  const heightClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-[34px]',
    lg: 'h-10 sm:h-11',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <img
        src="/gymon-new-logo.png"
        alt="GymOn Provider Portal"
        className={`${heightClasses[size]} w-auto object-contain object-left group-hover:opacity-90 transition-opacity`}
      />
    </div>
  );
}

/**
 * Standalone GymOn Brand Icon (square mark)
 */
export function GymOnIcon({
  className = 'h-9 w-9',
  size,
}: {
  className?: string;
  size?: number | string;
}) {
  return (
    <img
      src="/gymon-icon.png"
      alt="GymOn Icon"
      style={size ? { width: size, height: size } : undefined}
      className={`object-contain rounded-xl ${className}`}
    />
  );
}
