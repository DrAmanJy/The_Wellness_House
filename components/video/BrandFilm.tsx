'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useVideos, logVideoAnalytics } from '@/lib/video/video-store';

export const BrandFilm: React.FC = () => {
  const { videos } = useVideos('homepage-brand-film');
  const videoItem = videos[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!containerRef.current || prefersReduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().then(() => {
              setIsPlaying(true);
              if (videoItem) logVideoAnalytics(videoItem.id, 'play_start');
            }).catch(() => {
              setIsPlaying(false);
            });
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [prefersReduced, videoItem]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        if (videoItem) logVideoAnalytics(videoItem.id, 'play_start');
      }).catch(console.error);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  if (!videoItem) return null;

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden bg-[#203128] my-16 sm:my-24">
      {/* Background Cinematic Video Layer */}
      <div className="relative w-full h-[520px] sm:h-[620px] md:h-[700px] overflow-hidden">
        <video
          ref={videoRef}
          src={videoItem.videoUrl}
          poster={videoItem.posterUrl}
          playsInline
          muted={isMuted}
          loop
          preload="none"
          aria-label={videoItem.title}
          className="w-full h-full object-cover scale-105"
        />

        {/* Sophisticated Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151D18]/90 via-[#151D18]/40 to-[#151D18]/60" />

        {/* Brand Label Top Right */}
        <div className="absolute top-8 right-8 z-10 hidden sm:flex items-center gap-2 text-white/70 font-mono text-xs uppercase tracking-widest border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-xs">
          <span>Mehrauli Atelier</span>
          <span>·</span>
          <span>Chronobiology Film</span>
        </div>

        {/* Bottom Left Control Strip */}
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all shadow-md"
            aria-label={isPlaying ? 'Pause brand film' : 'Play brand film'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all shadow-md"
            aria-label={isMuted ? 'Unmute brand film audio' : 'Mute brand film audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Center-Aligned Editorial Narrative Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#CAD6BC]">
            The House Cinematography
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#FAF7F2] font-normal leading-tight max-w-2xl text-balance">
            {videoItem.title}
          </h2>

          <p className="font-sans text-sm sm:text-base text-white/80 max-w-lg leading-relaxed">
            {videoItem.subtitle || videoItem.description}
          </p>

          <div className="pt-2">
            <Link
              href={videoItem.ctaUrl || '/rituals'}
              onClick={() => logVideoAnalytics(videoItem.id, 'cta_click')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FAF7F2] text-[#252A25] hover:bg-[#CAD6BC] text-xs font-medium uppercase tracking-widest rounded-xl transition-all shadow-xl hover:scale-[1.02]"
            >
              <span>{videoItem.ctaLabel || 'Explore Our Collection'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
