'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { heroLineReveal, heroEyebrow, heroCTA, heroImageReveal, heroContainer } from '@/lib/motion/variants';
import { stagger, viewport } from '@/lib/motion/tokens';

// ── HeroContainer ─────────────────────────────────────────────

interface HeroContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** Orchestrates the staggered entrance of hero child elements */
export const HeroContainer: React.FC<HeroContainerProps> = ({ children, className }) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={heroContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── HeroEyebrow ──────────────────────────────────────────────

interface HeroEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export const HeroEyebrow: React.FC<HeroEyebrowProps> = ({ children, className }) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <div className={className}>{children}</div>;

  return (
    <motion.div variants={heroEyebrow} className={className}>
      {children}
    </motion.div>
  );
};

// ── HeroHeadline ──────────────────────────────────────────────

interface HeroHeadlineProps {
  /** Array of headline segments, each rendered as a masked line */
  lines: React.ReactNode[];
  className?: string;
}

/**
 * Renders the hero headline with per-line masked reveal animation.
 * Each line slides up from y:24 with ~80ms stagger.
 */
export const HeroHeadline: React.FC<HeroHeadlineProps> = ({ lines, className }) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <h1 className={className}>
        {lines.map((line, i) => (
          <span key={i} className="block">{line}</span>
        ))}
      </h1>
    );
  }

  return (
    <motion.h1
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger.heroLine,
          },
        },
      }}
      className={className}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            variants={heroLineReveal}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
};

// ── HeroDescription ───────────────────────────────────────────

interface HeroDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const HeroDescription: React.FC<HeroDescriptionProps> = ({ children, className }) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <p className={className}>{children}</p>;

  return (
    <motion.p
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.p>
  );
};

// ── HeroCTA ───────────────────────────────────────────────────

interface HeroCTAProps {
  children: React.ReactNode;
  className?: string;
}

export const HeroCTA: React.FC<HeroCTAProps> = ({ children, className }) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <div className={className}>{children}</div>;

  return (
    <motion.div variants={heroCTA} className={className}>
      {children}
    </motion.div>
  );
};

// ── HeroImage ─────────────────────────────────────────────────

interface HeroImageProps {
  children: React.ReactNode;
  className?: string;
}

export const HeroImage: React.FC<HeroImageProps> = ({ children, className }) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <div className={className}>{children}</div>;

  return (
    <motion.div variants={heroImageReveal} className={className}>
      {children}
    </motion.div>
  );
};

// ── HeroBadges ────────────────────────────────────────────────

interface HeroBadgesProps {
  children: React.ReactNode;
  className?: string;
}

export const HeroBadges: React.FC<HeroBadgesProps> = ({ children, className }) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
