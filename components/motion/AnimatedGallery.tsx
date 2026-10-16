'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Share2, Sparkles } from 'lucide-react';
import { EditorialImage } from '@/components/editorial-image';
import { VideoPlayer } from '@/components/video/VideoPlayer';

export interface GalleryMediaItem {
  type: 'image' | 'video';
  url: string;
  posterUrl?: string;
  title?: string;
  alt: string;
}

interface AnimatedGalleryProps {
  media: GalleryMediaItem[];
  fallbackVariant?: any;
  badge?: string;
  onShare?: () => void;
}

export const AnimatedGallery: React.FC<AnimatedGalleryProps> = ({
  media,
  fallbackVariant,
  badge,
  onShare,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentItem = media[activeIndex] || media[0];

  return (
    <div className="space-y-4">
      {/* Main Media Stage */}
      <div className="relative rounded-3xl overflow-hidden border border-[#30473B]/10 bg-[#FAF7F2] shadow-xl aspect-4/3 flex items-center justify-center group">
        <AnimatePresence mode="wait">
          {currentItem.type === 'video' ? (
            <motion.div
              key={`video-${activeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <VideoPlayer
                src={currentItem.url}
                poster={currentItem.posterUrl || ''}
                title={currentItem.title || currentItem.alt}
                aspectRatio="4:3"
                autoplayInViewport={true}
                className="w-full h-full rounded-none"
              />
            </motion.div>
          ) : (
            <motion.div
              key={`image-${activeIndex}`}
              initial={{ opacity: 0, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              <EditorialImage
                src={currentItem.url}
                alt={currentItem.alt}
                fallbackVariant={fallbackVariant}
                aspectClassName="w-full h-full"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                priority={activeIndex === 0}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        {badge && (
          <span className="absolute top-4 left-4 bg-[#FFFEFA]/92 backdrop-blur-xs text-[#30473B] text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-sm border border-[#30473B]/10 shadow-xs z-10 pointer-events-none">
            {badge}
          </span>
        )}

        {/* Action icons */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {onShare && (
            <button
              onClick={onShare}
              className="p-2.5 rounded-full bg-[#FFFEFA]/90 hover:bg-[#FFFEFA] text-[#252A25] shadow-xs backdrop-blur-xs transition-colors"
              title="Copy link"
              aria-label="Share protocol"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>

      {/* Unified Thumbnails Selector */}
      {media.length > 1 && (
        <div className="grid grid-cols-5 gap-2.5">
          {media.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 transition-all group ${
                  isActive
                    ? 'border-[#30473B] ring-2 ring-[#30473B]/20 shadow-sm'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                aria-label={`View ${item.type === 'video' ? 'demonstration video' : 'gallery image'} ${idx + 1}`}
              >
                <EditorialImage
                  src={item.type === 'video' ? (item.posterUrl || item.url) : item.url}
                  alt={item.alt}
                  fallbackVariant={fallbackVariant}
                  aspectClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />

                {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white/90 text-[#252A25] flex items-center justify-center shadow-xs">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
