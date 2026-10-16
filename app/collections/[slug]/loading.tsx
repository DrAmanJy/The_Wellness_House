import React from 'react';
import { AnimatedSkeleton } from '@/components/motion';

export default function CollectionLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-[#30473B]/5 rounded-md animate-pulse" />

      {/* Cinematic Poster Hero Skeleton (Desktop 2.4:1 aspect) */}
      <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.4/1] min-h-[460px] rounded-3xl overflow-hidden bg-[#203128]/10 relative border border-[#30473B]/10">
        <AnimatedSkeleton className="w-full h-full" rounded="2xl" />
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <div className="h-3 w-36 bg-white/20 rounded-full" />
          <div className="h-10 sm:h-14 w-2/3 max-w-xl bg-white/20 rounded-xl" />
          <div className="h-4 w-1/2 max-w-md bg-white/15 rounded-md" />
          <div className="h-10 w-44 bg-white/25 rounded-full mt-4" />
        </div>
      </div>

      {/* Collection Title & Count Header Skeleton */}
      <div className="flex items-center justify-between border-b border-[#30473B]/10 pb-6">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-[#30473B]/10 rounded-md" />
          <div className="h-8 w-60 bg-[#30473B]/15 rounded-lg" />
        </div>
        <div className="h-3 w-24 bg-[#30473B]/10 rounded-md" />
      </div>

      {/* Product Cards Grid Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#FFFEFA] rounded-2xl p-5 space-y-4 border border-[#30473B]/10 shadow-xs"
          >
            <AnimatedSkeleton className="aspect-4/3 w-full" rounded="xl" />
            <div className="space-y-2.5">
              <AnimatedSkeleton className="h-3 w-20" />
              <AnimatedSkeleton className="h-5 w-4/5" />
              <AnimatedSkeleton className="h-3 w-full" />
            </div>
            <div className="pt-2 flex items-center justify-between">
              <AnimatedSkeleton className="h-4 w-16" />
              <AnimatedSkeleton className="h-8 w-24" rounded="lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
