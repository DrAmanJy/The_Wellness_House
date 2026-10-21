"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  stagger as staggerTokens,
  duration,
  easing,
  distance,
} from "@/lib/motion/tokens";
import { viewport } from "@/lib/motion/tokens";

// ── StaggerContainer ──────────────────────────────────────────

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger interval in seconds */
  stagger?: number;
  /** Delay before first child animates */
  delay?: number;
  as?: "div" | "section" | "ul";
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  stagger = staggerTokens.default,
  delay = 0,
  as = "div",
}) => {
  const prefersReduced = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (prefersReduced) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  return (
    <Tag
      initial={false}
      whileInView="visible"
      viewport={viewport.default}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </Tag>
  );
};

// ── StaggerItem ───────────────────────────────────────────────

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className,
  as = "div",
}) => {
  const prefersReduced = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (prefersReduced) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  return (
    <Tag
      initial={false}
      variants={{
        hidden: { opacity: 0, y: distance.reveal },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: duration.section, ease: easing.smooth },
        },
      }}
      className={className}
    >
      {children}
    </Tag>
  );
};
