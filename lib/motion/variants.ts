/**
 * Motion Variants
 * 
 * Reusable animation variants for Motion for React.
 * All variants use centralized tokens from tokens.ts for consistency.
 */

import type { Variants } from 'motion/react';
import { easing, duration, distance, scale } from './tokens';

// ── Fade Variants ─────────────────────────────────────────────

/** Simple fade in/out */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.section, ease: easing.smooth },
  },
};

// ── Reveal Variants ───────────────────────────────────────────

/** Standard upward reveal — default for sections */
export const revealUp: Variants = {
  hidden: {
    opacity: 0,
    y: distance.reveal,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.section, ease: easing.smooth },
  },
};

/** Subtle reveal — for secondary content */
export const revealSubtle: Variants = {
  hidden: {
    opacity: 0,
    y: distance.subtle,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.section, ease: easing.smooth },
  },
};

// ── Hero Variants ─────────────────────────────────────────────

/** Hero headline line reveal */
export const heroLineReveal: Variants = {
  hidden: {
    opacity: 0,
    y: distance.heroLine,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.hero, ease: easing.smooth },
  },
};

/** Hero image reveal with subtle scale */
export const heroImageReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: scale.heroImage,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: easing.smooth },
  },
};

/** Hero eyebrow text */
export const heroEyebrow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: easing.decelerate },
  },
};

/** Hero CTA buttons */
export const heroCTA: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easing.smooth },
  },
};

// ── Stagger Container Variants ────────────────────────────────

/** Generic stagger container */
export const staggerContainer = (
  staggerInterval: number = 0.06,
  delayChildren: number = 0
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerInterval,
      delayChildren,
    },
  },
});

/** Hero stagger container */
export const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// ── Card Variants ─────────────────────────────────────────────

/** Card grid item entrance */
export const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easing.smooth },
  },
};

// ── Modal / Drawer Variants ───────────────────────────────────

/** Overlay backdrop */
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.modal, ease: easing.decelerate },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: easing.accelerate },
  },
};

/** Drawer slide-in from right */
export const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { duration: 0.3, ease: easing.smooth },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.25, ease: easing.accelerate },
  },
};

/** Modal scale-in */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.modal, ease: easing.smooth },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.2, ease: easing.accelerate },
  },
};

// ── Navigation Variants ───────────────────────────────────────

/** Mega menu dropdown */
export const megaMenuVariants: Variants = {
  hidden: {
    opacity: 0,
    y: distance.dropdown,
    pointerEvents: 'none' as const,
  },
  visible: {
    opacity: 1,
    y: 0,
    pointerEvents: 'auto' as const,
    transition: { duration: duration.nav, ease: easing.smooth },
  },
  exit: {
    opacity: 0,
    y: distance.dropdown / 2,
    pointerEvents: 'none' as const,
    transition: { duration: 0.18, ease: easing.accelerate },
  },
};

/** Mobile menu container */
export const mobileMenuVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.3, ease: easing.smooth },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: easing.accelerate },
  },
};

// ── Accordion Variants ────────────────────────────────────────

export const accordionContent: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.35, ease: easing.smooth },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.25, ease: easing.accelerate },
  },
};
