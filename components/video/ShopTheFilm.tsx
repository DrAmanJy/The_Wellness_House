'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, ShoppingBag } from 'lucide-react';
import { useVideos, logVideoAnalytics } from '@/lib/video/video-store';
import { VideoItem } from '@/lib/video/types';
import { VideoModal } from './VideoModal';
import { EditorialImage } from '@/components/editorial-image';
import { AnimatedHeading, Reveal } from '@/components/motion';

export const ShopTheFilm: React.FC = () => {
  const { videos } = useVideos('shop-the-film');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const handleOpenVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    logVideoAnalytics(video.id, 'play_start');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
      {/* Section Header */}
      <AnimatedHeading
        eyebrow="Visual Formulations"
        headingClassName="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal"
        description="Experience the texture, extraction, and circadian preparation of each botanical protocol before bringing it into your sanctuary."
        align="center"
        className="max-w-2xl mx-auto text-center"
      >
        See It. Love It. Make It Yours.
      </AnimatedHeading>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((item) => (
          <Reveal key={item.id} variant="up">
            <div className="bg-[#FFFEFA] rounded-2xl overflow-hidden border border-[#30473B]/10 hover:border-[#30473B]/30 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              {/* Video Poster with Play Button */}
              <div
                onClick={() => handleOpenVideo(item)}
                className="relative aspect-4/3 w-full bg-[#FAF7F2] overflow-hidden cursor-pointer"
              >
                <EditorialImage
                  src={item.posterUrl}
                  alt={item.title}
                  aspectClassName="w-full h-full"
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />

                {/* Dark gradient for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Duration Tag */}
                {item.duration && (
                  <span className="absolute top-3 right-3 font-mono text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-sm backdrop-blur-xs">
                    {item.duration}
                  </span>
                )}

                {/* Play Button Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FAF7F2]/90 group-hover:bg-[#FAF7F2] text-[#252A25] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>

                {/* Subtitle kicker on photo */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-[11px] font-mono text-[#CAD6BC] line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Product Details & Actions */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#C58B71] block">
                    {item.linkedProductPrice || 'Signature Protocol'}
                  </span>
                  <h3 className="font-serif text-base font-medium text-[#252A25] line-clamp-1 group-hover:text-[#30473B] transition-colors">
                    {item.linkedProductTitle || item.title}
                  </h3>
                  <p className="text-xs text-[#71776F] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#30473B]/10 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenVideo(item)}
                    className="text-xs font-mono uppercase text-[#30473B] hover:text-[#203128] font-medium flex items-center gap-1"
                  >
                    <span>Watch Film</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>

                  <Link
                    href={item.ctaUrl || `/rituals/${item.linkedProductSlug || ''}`}
                    className="text-xs font-medium text-[#252A25] hover:text-[#30473B] flex items-center gap-1 group-hover:underline"
                  >
                    <span>View Product</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Video Modal Display */}
      <VideoModal
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
};
