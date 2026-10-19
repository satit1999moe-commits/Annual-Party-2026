import React from 'react';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  inverted?: boolean;
}

/**
 * Modern Solid Navy Wordmark (School Crest removed as requested)
 */
export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  inverted = false,
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7 text-xs', textTitle: 'text-sm', textSubtitle: 'text-[10px]' },
    md: { box: 'w-8 h-8 text-sm', textTitle: 'text-base', textSubtitle: 'text-xs' },
    lg: { box: 'w-10 h-10 text-base', textTitle: 'text-lg', textSubtitle: 'text-xs' },
    xl: { box: 'w-12 h-12 text-lg', textTitle: 'text-xl', textSubtitle: 'text-sm' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Clean Solid Navy Badge (No School Crest Logo) */}
      <div
        className={`${current.box} rounded-lg ${
          inverted ? 'bg-white text-[#0f223d]' : 'bg-[#0f223d] text-white'
        } font-bold font-mono flex items-center justify-center shrink-0 shadow-2xs border ${
          inverted ? 'border-white/20' : 'border-[#183153]'
        }`}
      >
        <span>S</span>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-bold tracking-tight ${
              inverted ? 'text-white' : 'text-[#0f223d]'
            } ${current.textTitle}`}
          >
            ระบบจองโต๊ะและที่นั่ง
          </span>
          <span
            className={`font-medium tracking-wide ${
              inverted ? 'text-slate-300' : 'text-slate-500'
            } ${current.textSubtitle}`}
          >
            โรงเรียนสาธิตอุดมศึกษา
          </span>
        </div>
      )}
    </div>
  );
};
