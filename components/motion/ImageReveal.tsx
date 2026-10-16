'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { viewport, duration, easing, scale } from '@/lib/motion/tokens';

interface ImageRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Whether to use a subtle scale on reveal */
  withScale?: boolean;
}

/**
 * ImageReveal — wraps images with a smooth opacity + subtle scale entrance.
 * 
 * The scale starts at 1.035 and resolves to 1.0, creating an
 * editorial photo reveal effect. Images must be inside as children.
 */
export const ImageReveal: React.FC<ImageRevealProps> = ({
  children,
  className = '',
  withScale = true,
}) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: withScale ? scale.heroImage : 1,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
      viewport={viewport.default}
      transition={{
        duration: 0.7,
        ease: easing.smooth,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ImageReveal;
