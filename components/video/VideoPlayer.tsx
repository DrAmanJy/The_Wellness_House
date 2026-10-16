'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Maximize, RotateCcw } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { logVideoAnalytics } from '@/lib/video/video-store';
import { VideoAspectRatio } from '@/lib/video/types';

interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
  videoId?: string;
  aspectRatio?: VideoAspectRatio;
  autoplayInViewport?: boolean;
  className?: string;
  showControls?: boolean;
}

const aspectMap: Record<VideoAspectRatio, string> = {
  '16:9': 'aspect-16/9',
  '9:16': 'aspect-9/16',
  '1:1': 'aspect-square',
  '4:3': 'aspect-4/3',
  '21:9': 'aspect-[21/9]',
  '2.4:1': 'aspect-[2.4/1]',
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  videoId,
  aspectRatio = '16:9',
  autoplayInViewport = false,
  className = '',
  showControls = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  // Viewport Intersection for autoplay/pause
  useEffect(() => {
    if (!autoplayInViewport || prefersReduced || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().then(() => {
              setIsPlaying(true);
              if (videoId) logVideoAnalytics(videoId, 'play_start');
            }).catch(() => {
              // Autoplay policy prevented playback
              setIsPlaying(false);
            });
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.45 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoplayInViewport, prefersReduced, videoId]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        if (videoId) logVideoAnalytics(videoId, 'play_start');
      }).catch(console.error);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    } else {
      containerRef.current.requestFullscreen().catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    if (dur > 0) {
      setProgress((curr / dur) * 100);
      if (curr >= dur - 0.2 && videoId) {
        logVideoAnalytics(videoId, 'play_complete');
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#203128] rounded-2xl group select-none ${aspectMap[aspectRatio]} ${className}`}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={title}
        playsInline
        muted={isMuted}
        loop
        preload="none"
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => setHasLoaded(true)}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* Subtle Bottom Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 z-10">
        <div
          className="h-full bg-[#CAD6BC] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Center Play Overlay when Paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px] transition-opacity">
          <button
            onClick={togglePlay}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FAF7F2]/90 hover:bg-[#FAF7F2] text-[#252A25] flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            aria-label={`Play ${title}`}
          >
            <Play className="w-6 h-6 ml-0.5 fill-current" />
          </button>
        </div>
      )}

      {/* Persistent Controls Bar */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs transition-colors"
            aria-label="Toggle Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
