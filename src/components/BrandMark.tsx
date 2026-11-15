import React, { useState } from 'react';
import { Zap } from 'lucide-react';

export function GoFastLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-sm shadow-blue-950/60 border border-[#3B82F6]/30">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-white"
        >
          <path
            d="M13 2L4.5 13.5H11.5L10.5 22L19.5 10.5H12.5L13 2Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
          Go<span className="text-[#3B82F6]">Fast</span>
        </span>
      )}
    </div>
  );
}

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function SafeImage({ src, alt, className = '' }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1222] via-[#101D38] to-[#070B14] text-[#94A3B8] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Zap className="w-6 h-6 text-[#3B82F6]/70 mb-1" />
        <span className="text-[11px] font-medium px-2 text-center line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
