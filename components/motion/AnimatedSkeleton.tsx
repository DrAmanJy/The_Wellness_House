'use client';

import React from 'react';
import { useReducedMotion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const AnimatedSkeleton: React.FC<SkeletonProps> = ({
  className = 'h-4 w-full',
  rounded = 'md',
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className={`bg-[#30473B]/[0.06] ${roundedMap[rounded]} ${
        prefersReduced ? '' : 'animate-pulse'
      } ${className}`}
      aria-hidden="true"
    />
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-[#FFFEFA] rounded-2xl overflow-hidden border border-[#30473B]/10 p-4 space-y-4 shadow-xs">
    <AnimatedSkeleton className="aspect-4/3 w-full" rounded="xl" />
    <div className="space-y-2">
      <AnimatedSkeleton className="h-3 w-24" />
      <AnimatedSkeleton className="h-5 w-3/4" />
      <AnimatedSkeleton className="h-3 w-full" />
    </div>
    <div className="pt-2 border-t border-[#30473B]/05 flex items-center justify-between">
      <AnimatedSkeleton className="h-3 w-16" />
      <AnimatedSkeleton className="h-3 w-20" />
    </div>
  </div>
);

export const ProductDetailSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start py-8">
    <div className="lg:col-span-6 space-y-4">
      <AnimatedSkeleton className="aspect-4/3 w-full" rounded="2xl" />
      <div className="grid grid-cols-4 gap-3">
        <AnimatedSkeleton className="aspect-4/3 w-full" rounded="lg" />
        <AnimatedSkeleton className="aspect-4/3 w-full" rounded="lg" />
        <AnimatedSkeleton className="aspect-4/3 w-full" rounded="lg" />
        <AnimatedSkeleton className="aspect-4/3 w-full" rounded="lg" />
      </div>
    </div>
    <div className="lg:col-span-6 space-y-6">
      <AnimatedSkeleton className="h-4 w-32" />
      <AnimatedSkeleton className="h-10 w-4/5" />
      <AnimatedSkeleton className="h-4 w-full" />
      <AnimatedSkeleton className="h-24 w-full" rounded="xl" />
      <AnimatedSkeleton className="h-12 w-full" rounded="lg" />
    </div>
  </div>
);
