'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BotanicalArt } from '@/components/botanical-art';

interface EditorialImageProps {
  src: string;
  alt: string;
  fallbackVariant?:
    | 'hero_wellness'
    | 'weight_kit'
    | 'gummies'
    | 'soap_botanical'
    | 'soap_lavender'
    | 'bundle_ritual'
    | 'daily_supplement'
    | 'philosophy'
    | 'atelier_sanctuary'
    | 'tea_ceremony'
    | 'botanical_press'
    | 'circadian_clock';
  className?: string;
  aspectClassName?: string;
  priority?: boolean;
  caption?: string;
  showOverlay?: boolean;
}

export const EditorialImage: React.FC<EditorialImageProps> = ({
  src,
  alt,
  fallbackVariant = 'hero_wellness',
  className = '',
  aspectClassName = 'aspect-4/3',
  priority = false,
  caption,
  showOverlay = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden bg-[#EFECE5] ${aspectClassName} ${className}`}>
      {!hasError ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            onLoad={() => setIsLoading(false)}
            className={`object-cover transition-all duration-700 ${
              isLoading ? 'opacity-0 scale-102' : 'opacity-100 scale-100'
            }`}
          />
          {showOverlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#203128]/70 via-[#203128]/20 to-transparent pointer-events-none" />
          )}
          {caption && (
            <div className="absolute bottom-3 left-3 right-3 text-[10px] font-mono tracking-widest uppercase text-[#FAF7F2] bg-[#203128]/70 backdrop-blur-xs px-2.5 py-1.5 rounded-sm z-10">
              {caption}
            </div>
          )}
        </>
      ) : (
        <BotanicalArt variant={fallbackVariant} className="w-full h-full object-cover" />
      )}
    </div>
  );
};
