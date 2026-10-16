'use client';

import React from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react';

export const ReadingProgress: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (prefersReduced) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 bg-[#30473B] z-50 origin-left"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
};
