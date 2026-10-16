'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ShoppingBag } from 'lucide-react';
import { VideoItem } from '@/lib/video/types';
import { VideoPlayer } from './VideoPlayer';
import { logVideoAnalytics } from '@/lib/video/video-store';

interface VideoModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!video) return null;

  const handleCtaClick = () => {
    logVideoAnalytics(video.id, 'cta_click');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-[#151D18]/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl bg-[#FFFEFA] rounded-3xl overflow-hidden shadow-2xl border border-[#30473B]/10 z-10 flex flex-col md:flex-row"
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-[#FFFEFA]/80 hover:bg-[#FFFEFA] text-[#252A25] shadow-md transition-colors"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Player Display */}
            <div className="w-full md:w-3/5 bg-black flex items-center justify-center">
              <VideoPlayer
                src={video.videoUrl}
                poster={video.posterUrl}
                title={video.title}
                videoId={video.id}
                aspectRatio={video.aspectRatio}
                autoplayInViewport={true}
                className="w-full h-full rounded-none"
              />
            </div>

            {/* Product & Story Narrative Column */}
            <div className="w-full md:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#FAF7F2]">
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C58B71]">
                  Featured Formulation Film
                </span>
                <h3 id="video-modal-title" className="font-serif text-2xl text-[#252A25] leading-snug">
                  {video.title}
                </h3>
                {video.subtitle && (
                  <p className="text-xs font-mono text-[#30473B]">
                    {video.subtitle}
                  </p>
                )}
                <p className="text-xs text-[#71776F] leading-relaxed pt-1">
                  {video.description}
                </p>
              </div>

              {/* Product Association Card & CTA */}
              <div className="pt-4 border-t border-[#30473B]/10 space-y-3">
                {video.linkedProductTitle && (
                  <div className="p-3 bg-[#FFFEFA] rounded-xl border border-[#30473B]/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-serif font-medium text-[#252A25] block">
                        {video.linkedProductTitle}
                      </span>
                      {video.linkedProductPrice && (
                        <span className="text-[11px] font-mono text-[#71776F]">
                          {video.linkedProductPrice}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <Link
                  href={video.ctaUrl || `/rituals/${video.linkedProductSlug || ''}`}
                  onClick={handleCtaClick}
                  className="w-full py-3.5 bg-[#30473B] hover:bg-[#203128] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{video.ctaLabel || 'Explore Formulation'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
