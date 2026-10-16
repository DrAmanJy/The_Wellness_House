import React from 'react';
import { AnimatedSkeleton, ProductCardSkeleton } from '@/components/motion';

export default function RitualsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <AnimatedSkeleton className="h-3 w-36 mx-auto" />
        <AnimatedSkeleton className="h-10 w-4/5 mx-auto" />
        <AnimatedSkeleton className="h-4 w-full mx-auto" />
      </div>

      <div className="bg-[#FFFEFA] rounded-2xl p-4 sm:p-6 border border-[#30473B]/10 shadow-xs flex justify-between items-center">
        <AnimatedSkeleton className="h-8 w-80 rounded-lg" />
        <AnimatedSkeleton className="h-8 w-48 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
