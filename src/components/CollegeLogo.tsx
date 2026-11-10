import React from 'react';
import Image from 'next/image';

interface CollegeLogoProps {
  size?: number;
  className?: string;
  alt?: string;
}

export default function CollegeLogo({
  size = 48,
  className = '',
  alt = 'MKR College Logo',
}: CollegeLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.avif"
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-contain mix-blend-multiply pointer-events-none select-none transition-transform"
        loading="eager"
      />
    </div>
  );
}
