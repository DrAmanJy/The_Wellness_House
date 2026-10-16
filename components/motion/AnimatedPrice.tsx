'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedPriceProps {
  price: string;
  originalPrice?: string;
  badge?: string;
  className?: string;
}

export const AnimatedPrice: React.FC<AnimatedPriceProps> = ({
  price,
  originalPrice,
  badge,
  className = '',
}) => {
  return (
    <div className={`flex items-baseline gap-2.5 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={price}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-2xl sm:text-3xl font-medium text-[#252A25]"
        >
          {price}
        </motion.span>
      </AnimatePresence>

      {originalPrice && (
        <span className="text-sm font-mono text-[#71776F] line-through">
          {originalPrice}
        </span>
      )}

      {badge && (
        <span className="text-[10px] font-mono uppercase bg-[#CAD6BC]/40 text-[#30473B] px-2 py-0.5 rounded-sm">
          {badge}
        </span>
      )}
    </div>
  );
};
