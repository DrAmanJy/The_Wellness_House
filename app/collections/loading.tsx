import React from 'react';
import { AnimatedSkeleton } from '@/components/motion';

export default function CollectionsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="h-4 w-40 bg-[#30473B]/5 rounded-md animate-pulse" />
      <div className="max-w-xl mx-auto text-center space-y-3">
        <div className="h-3 w-32 bg-[#30473B]/10 rounded-md mx-auto" />
        <div className="h-10 w-3/4 bg-[#30473B]/15 rounded-lg mx-auto" />
        <div className="h-4 w-full bg-[#30473B]/10 rounded-md mx-auto" />
      </div>

      <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.4/1] min-h-[460px] rounded-3xl overflow-hidden bg-[#203128]/10">
        <AnimatedSkeleton className="w-full h-full" rounded="2xl" />
      </div>

      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="w-full aspect-[16/9] lg:aspect-[2.4/1] min-h-[380px] rounded-3xl overflow-hidden bg-[#203128]/10"
          >
            <AnimatedSkeleton className="w-full h-full" rounded="2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
