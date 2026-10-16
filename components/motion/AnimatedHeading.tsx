'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { revealUp, revealSubtle } from '@/lib/motion/variants';
import { viewport } from '@/lib/motion/tokens';

interface AnimatedHeadingProps {
  /** Eyebrow/kicker text above the heading */
  eyebrow?: string;
  /** The heading text (supports JSX) */
  children: React.ReactNode;
  /** Optional description paragraph */
  description?: string;
  /** Heading level */
  level?: 'h2' | 'h3' | 'h4';
  /** Additional class for the container */
  className?: string;
  /** Class for the heading element */
  headingClassName?: string;
  /** Class for the eyebrow */
  eyebrowClassName?: string;
  /** Class for the description */
  descriptionClassName?: string;
  /** Alignment */
  align?: 'left' | 'center';
}

/**
 * AnimatedSectionHeading — Editorial heading block with scroll reveal.
 * 
 * Includes optional eyebrow, heading, and description, each
 * animating in sequence via stagger.
 */
export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  eyebrow,
  children,
  description,
  level = 'h2',
  className = '',
  headingClassName = '',
  eyebrowClassName = '',
  descriptionClassName = '',
  align = 'left',
}) => {
  const prefersReduced = useReducedMotion();
  const HeadingTag = level;

  const alignClass = align === 'center' ? 'text-center mx-auto' : '';

  if (prefersReduced) {
    return (
      <div className={`${className} ${alignClass}`}>
        {eyebrow && (
          <span className={`font-mono text-xs uppercase tracking-widest text-[#30473B] block mb-2 ${eyebrowClassName}`}>
            {eyebrow}
          </span>
        )}
        <HeadingTag className={headingClassName}>{children}</HeadingTag>
        {description && (
          <p className={`text-sm text-[#71776F] leading-relaxed mt-3 ${descriptionClassName}`}>
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport.text}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.08 },
        },
      }}
      className={`${className} ${alignClass}`}
    >
      {eyebrow && (
        <motion.span
          variants={revealSubtle}
          className={`font-mono text-xs uppercase tracking-widest text-[#30473B] block mb-2 ${eyebrowClassName}`}
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.div variants={revealUp}>
        <HeadingTag className={headingClassName}>{children}</HeadingTag>
      </motion.div>
      {description && (
        <motion.p
          variants={revealSubtle}
          className={`text-sm text-[#71776F] leading-relaxed mt-3 ${descriptionClassName}`}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
};

export default AnimatedHeading;
