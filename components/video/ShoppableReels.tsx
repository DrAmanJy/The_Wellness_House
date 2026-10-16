'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Play, Volume2, VolumeX, ShoppingBag, ArrowRight } from 'lucide-react';
import { useVideos, logVideoAnalytics } from '@/lib/video/video-store';
import { VideoItem } from '@/lib/video/types';
import { VideoModal } from './VideoModal';
import { EditorialImage } from '@/components/editorial-image';
import { AnimatedHeading, Reveal } from '@/components/motion';

export const ShoppableReels: React.FC = () => {
  const { videos } = useVideos('shoppable-reels');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  const handleOpenReel = (video: VideoItem) => {
    setSelectedVideo(video);
    logVideoAnalytics(video.id, 'play_start');
  };

  return (
    <section className="bg-[#FAF7F2] py-16 sm:py-24 border-y border-[#30473B]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Editorial Section Header */}
        <AnimatedHeading
          eyebrow="Chronobiology in Motion"
          headingClassName="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal"
          description="Watch our rituals, formulation preparation, and everyday moments of botanical mindfulness."
          align="center"
          className="max-w-2xl mx-auto text-center"
        >
          Inside The Wellness House.
        </AnimatedHeading>

        {/* 9:16 Vertical Video Reels Grid / Mobile Carousel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {videos.map((reel) => {
            const isHovered = hoveredVideoId === reel.id;
            return (
              <Reveal key={reel.id} variant="up">
                <div
                  onMouseEnter={() => setHoveredVideoId(reel.id)}
                  onMouseLeave={() => setHoveredVideoId(null)}
                  onClick={() => handleOpenReel(reel)}
                  className="relative aspect-9/16 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-[#30473B]/10 cursor-pointer group select-none bg-[#203128]"
                >
                  {/* Poster or Video Preview */}
                  {isHovered ? (
                    <video
                      src={reel.videoUrl}
                      poster={reel.posterUrl}
                      playsInline
                      muted
                      loop
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <EditorialImage
                      src={reel.posterUrl}
                      alt={reel.title}
                      aspectClassName="w-full h-full"
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  )}

                  {/* Dark Vignette Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                  {/* Top Duration & Kicker */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white/90 z-10 pointer-events-none">
                    <span className="text-[10px] font-mono uppercase bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-xs">
                      Reel · {reel.duration || '0:20'}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Product Card Tag */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2 text-white">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#CAD6BC] block">
                        {reel.subtitle}
                      </span>
                      <h4 className="font-serif text-sm font-medium leading-tight pt-0.5">
                        {reel.title}
                      </h4>
                    </div>

                    {/* Quick Link Badge */}
                    <div className="pt-2">
                      <div className="p-2 rounded-xl bg-[#FAF7F2]/95 text-[#252A25] flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#30473B] shrink-0" />
                          <span className="text-[11px] font-medium truncate">
                            {reel.linkedProductTitle || 'Shop Protocol'}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#30473B] shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Reel Modal Player */}
      <VideoModal
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
};
