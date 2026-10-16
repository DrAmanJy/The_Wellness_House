'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Sparkles, Compass } from 'lucide-react';
import { useVideos } from '@/lib/video/video-store';
import { VideoPlayer } from './VideoPlayer';
import { Reveal } from '@/components/motion';

export const EditorialVideoSection: React.FC = () => {
  const { videos } = useVideos('editorial-story');
  const videoItem = videos[0];

  if (!videoItem) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="bg-[#FFFEFA] rounded-3xl overflow-hidden border border-[#30473B]/10 shadow-lg grid grid-cols-1 lg:grid-cols-12 items-center">
        {/* Left Column: Editorial Philosophy */}
        <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 space-y-6">
          <Reveal variant="up">
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">
                Atelier Traceability
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#252A25] font-normal leading-tight">
                Behind Every Little Ritual.
              </h2>
              <p className="font-serif italic text-lg text-[#30473B]">
                {videoItem.subtitle || 'From Indian Terroir to Daily Sensory Restoration'}
              </p>
            </div>
          </Reveal>

          <Reveal variant="up" delay={0.1}>
            <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
              {videoItem.description}
            </p>
          </Reveal>

          <Reveal variant="up" delay={0.15}>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#30473B]/10 space-y-1">
                <Leaf className="w-4 h-4 text-[#30473B]" />
                <span className="font-serif text-sm font-medium text-[#252A25] block">
                  Cold Extracted
                </span>
                <p className="text-[11px] text-[#71776F]">
                  Preserving thermo-labile botanical bio-actives.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#30473B]/10 space-y-1">
                <Compass className="w-4 h-4 text-[#30473B]" />
                <span className="font-serif text-sm font-medium text-[#252A25] block">
                  Circadian Synergies
                </span>
                <p className="text-[11px] text-[#71776F]">
                  Formulated for specific hormonal windows.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal variant="up" delay={0.2}>
            <div className="pt-2">
              <Link
                href={videoItem.ctaUrl || '/about'}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-[#203128] transition-all shadow-md"
              >
                <span>{videoItem.ctaLabel || 'Read Formulation Philosophy'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Right Column: Wide Film Video Player */}
        <div className="lg:col-span-6 h-full p-4 sm:p-6 lg:p-8 bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-[#30473B]/10">
            <VideoPlayer
              src={videoItem.videoUrl}
              poster={videoItem.posterUrl}
              title={videoItem.title}
              videoId={videoItem.id}
              aspectRatio="16:9"
              autoplayInViewport={true}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
