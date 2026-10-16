'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { CategoryFilmConfig } from '@/lib/video/types';
import { videoPlaybackManager } from '@/lib/video/video-playback-manager';

interface CinematicCategoryHeroProps {
  film: CategoryFilmConfig;
  className?: string;
  priority?: boolean;
}

export const CinematicCategoryHero: React.FC<CinematicCategoryHeroProps> = ({
  film,
  className = '',
  priority = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Synchronize with single video playback manager
  useEffect(() => {
    const unregister = videoPlaybackManager.register(film.id, () => {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    });
    return unregister;
  }, [film.id]);

  // Viewport-aware autoplay / pause
  useEffect(() => {
    if (!containerRef.current || prefersReduced || !film.isAutoplay) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Only autoplay if user hasn't explicitly paused it
            if (!hasInteracted && videoRef.current) {
              videoRef.current
                .play()
                .then(() => {
                  setIsPlaying(true);
                  videoPlaybackManager.notifyPlaying(film.id);
                })
                .catch(() => {
                  setIsPlaying(false);
                });
            }
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
              videoPlaybackManager.notifyPaused(film.id);
            }
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [prefersReduced, film.id, film.isAutoplay, hasInteracted]);

  const togglePlay = useCallback(() => {
    setHasInteracted(true);
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoPlaybackManager.notifyPaused(film.id);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          videoPlaybackManager.notifyPlaying(film.id);
        })
        .catch(console.error);
    }
  }, [isPlaying, film.id]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  }, [isMuted]);

  // Break lines in headline if containing \n
  const headlineLines = film.headline.split('\n');

  // Desktop layout variations
  const isCentered = film.layout === 'centered';
  const isLeft = film.layout === 'left';
  const isAsymmetric = film.layout === 'asymmetric';

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#203128] text-[#FAF7F2] select-none rounded-2xl sm:rounded-3xl shadow-xl ${className}`}
    >
      {/* ── Aspect Ratio Container (Desktop ~2.4:1, Mobile ~16:11) ── */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.4/1] min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center">
        
        {/* Layer 1: Background Poster / Video with subtle scale motion */}
        <motion.div
          initial={{ scale: 1.025, opacity: 0.85 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full overflow-hidden"
        >
          {/* High-resolution poster (always visible underneath, never black screen) */}
          <picture>
            {film.mobilePosterUrl && (
              <source media="(max-width: 640px)" srcSet={film.mobilePosterUrl} />
            )}
            <img
              src={film.posterUrl}
              alt={film.headline.replace('\n', ' ')}
              className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.92]"
              loading={priority ? 'eager' : 'lazy'}
            />
          </picture>

          {/* HTML5 Video element */}
          {film.videoUrl && (
            <video
              ref={videoRef}
              src={film.videoUrl}
              poster={film.posterUrl}
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onLoadedData={() => setIsVideoLoaded(true)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                isVideoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </motion.div>

        {/* Layer 2: Subtle Cinematic Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/55 pointer-events-none"
          style={{
            backgroundColor: `rgba(20, 30, 24, ${film.overlayOpacity ?? 0.35})`,
          }}
        />

        {/* Layer 5: Top Metadata & Film Label */}
        <div className="absolute top-6 sm:top-8 left-6 sm:left-12 right-6 sm:right-12 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CAD6BC] animate-pulse" />
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#CAD6BC]">
              {film.eyebrow}
            </span>
          </div>

          {film.videoCredit && (
            <span className="hidden md:inline-block font-mono text-[10px] tracking-[0.2em] uppercase text-[#FAF7F2]/60">
              {film.videoCredit}
            </span>
          )}
        </div>

        {/* Layer 3 & 4: Typography & Primary CTA */}
        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 z-20 py-16">
          <div
            className={`space-y-6 ${
              isCentered
                ? 'text-center max-w-3xl mx-auto'
                : isLeft
                ? 'text-left max-w-2xl'
                : 'text-left max-w-2xl ml-auto md:mr-4'
            }`}
          >
            {/* Masked Headline Reveal */}
            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: '100%', opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#FAF7F2] font-normal tracking-tight leading-[1.08] text-balance drop-shadow-sm"
              >
                {headlineLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < headlineLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </motion.h2>
            </div>

            {/* Supporting Copy Reveal */}
            <motion.p
              initial={{ y: 14, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              className={`text-sm sm:text-base text-[#FAF7F2]/85 font-light leading-relaxed max-w-xl ${
                isCentered ? 'mx-auto' : ''
              }`}
            >
              {film.description}
            </motion.p>

            {/* Primary CTA Entrance */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
              className={`pt-2 flex flex-wrap items-center gap-4 ${
                isCentered ? 'justify-center' : 'justify-start'
              }`}
            >
              <Link
                href={film.ctaUrl}
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#FAF7F2] text-[#203128] font-mono text-xs uppercase tracking-[0.2em] font-medium rounded-full hover:bg-[#CAD6BC] hover:text-[#203128] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span>{film.ctaLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>

              {/* Discreet Mobile/Inline Play Trigger */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause film' : 'Play film'}
                className="inline-flex sm:hidden items-center gap-2 px-4 py-3 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 text-xs font-mono tracking-wider uppercase text-white hover:bg-black/60 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play Film'}</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Layer 6: Discreet Desktop Playback Controls */}
        <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-12 right-6 sm:right-12 flex items-center justify-between z-20 pointer-events-none">
          {/* Category Pill Tag */}
          <div className="pointer-events-auto">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#FAF7F2]/70 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/10">
              {film.categoryName}
            </span>
          </div>

          {/* Discreet Media Controls */}
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/15">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 text-white/90 hover:text-white hover:scale-105 transition-all"
              aria-label={isPlaying ? 'Pause Category Film' : 'Play Category Film'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              )}
            </button>

            <span className="h-3 w-[1px] bg-white/20" />

            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 text-white/90 hover:text-white hover:scale-105 transition-all"
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
