"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { revealUp, revealSubtle, fade } from "@/lib/motion/variants";
import { viewport } from "@/lib/motion/tokens";

type RevealVariant = "up" | "subtle" | "fade";

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  /** Custom variants override */
  custom?: Variants;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Custom CSS class */
  className?: string;
  /** HTML element to render */
  as?: "div" | "section" | "article" | "aside" | "span";
  /** Viewport margin override */
  viewportMargin?: string;
}

const variantMap: Record<RevealVariant, Variants> = {
  up: revealUp,
  subtle: revealSubtle,
  fade: fade,
};

/**
 * Reveal — Scroll-triggered entrance animation.
 *
 * Wraps content with a motion element that fades/slides into view
 * once when it enters the viewport. Respects reduced motion.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = "up",
  custom,
  delay = 0,
  className,
  as = "div",
  viewportMargin,
}) => {
  const prefersReduced = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  const variants = custom || variantMap[variant];

  if (prefersReduced) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  return (
    <Tag
      initial={false}
      whileInView="visible"
      viewport={
        viewportMargin
          ? { once: true, margin: viewportMargin as `${number}px ${number}px` }
          : viewport.default
      }
      variants={variants}
      transition={delay ? { delay } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
