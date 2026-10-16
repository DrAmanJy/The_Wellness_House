import React from 'react';
import { AnimatedSkeleton } from '@/components/motion';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Editorial Header Skeleton */}
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <AnimatedSkeleton className="h-3 w-32 mx-auto" />
        <AnimatedSkeleton className="h-10 w-3/4 mx-auto" />
        <AnimatedSkeleton className="h-4 w-full mx-auto" />
      </div>

      {/* Hero Showcase Skeleton */}
      <div className="aspect-16/9 md:aspect-21/9 w-full rounded-3xl overflow-hidden">
        <AnimatedSkeleton className="w-full h-full" rounded="2xl" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#FFFEFA] rounded-2xl p-4 space-y-4 border border-[#30473B]/10">
            <AnimatedSkeleton className="aspect-4/3 w-full" rounded="xl" />
            <div className="space-y-2">
              <AnimatedSkeleton className="h-3 w-20" />
              <AnimatedSkeleton className="h-5 w-4/5" />
              <AnimatedSkeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
