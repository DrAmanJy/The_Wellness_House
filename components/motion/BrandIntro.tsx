'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

export const BrandIntro: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const [showIntro, setShowIntro] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const cleanupClass = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('twh-intro-active');
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsDismissing(true);
    cleanupClass();
    try {
      sessionStorage.removeItem('twh_intro_seen');
    } catch {
      // Ignore
    }
    // Allow curtain-up exit animation to finish
    setTimeout(() => {
      setShowIntro(false);
    }, 380);
  }, [cleanupClass]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (prefersReduced) {
      cleanupClass();
      return;
    }

    try {
      document.documentElement.classList.add('twh-intro-active');
      setShowIntro(true);

      // Orchestrated intro reveal: comfortable luxury viewing ~1500ms before curtain up
      const autoDismissTimer = setTimeout(() => {
        handleDismiss();
      }, 1500);

      return () => clearTimeout(autoDismissTimer);
    } catch {
      cleanupClass();
      setShowIntro(false);
    }
  }, [prefersReduced, handleDismiss, cleanupClass]);

  // Support ESC key to instantly skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showIntro) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIntro, handleDismiss]);

  if (!showIntro) return null;

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          key="brand-intro-the-house-reveal"
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          exit={{ 
            y: '-100%',
            transition: { duration: 0.38, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F5F1E8] px-6 select-none overflow-hidden"
          role="dialog"
          aria-label="Brand Introduction"
        >
          {/* Subtle Terroir Background Texture */}
          <div className="absolute inset-0 bg-[#30473B]/[0.015] pointer-events-none" />

          {/* Delicate Editorial Corner Registration Marks */}
          <div className="absolute inset-6 sm:inset-10 border border-[#30473B]/10 pointer-events-none rounded-2xl">
            <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-[#30473B]/30" />
            <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-[#30473B]/30" />
            <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-[#30473B]/30" />
            <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-[#30473B]/30" />
          </div>

          {/* Accessible Skip Intro button */}
          <button
            onClick={handleDismiss}
            className="absolute top-8 right-8 sm:top-14 sm:right-14 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#71776F] hover:text-[#30473B] transition-colors py-1.5 px-4 border border-[#30473B]/15 rounded-full hover:border-[#30473B]/40 bg-[#FAF7F2]/80 backdrop-blur-xs z-30"
            aria-label="Skip brand introduction"
          >
            Skip Intro →
          </button>

          {/* Central Composition: The House Reveal */}
          <div className="relative text-center max-w-xl mx-auto space-y-5 z-20">
            
            {/* 0–150ms: Fine horizontal green rule appears */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-[1.5px] w-20 sm:w-28 mx-auto bg-[#30473B]/60 origin-center"
            />

            {/* 150–350ms: THE WELLNESS HOUSE wordmark reveals with masked animation */}
            <div className="overflow-hidden py-1">
              <motion.h1
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#252A25] uppercase font-light tracking-[0.24em] leading-none text-balance"
              >
                The Wellness House
              </motion.h1>
            </div>

            {/* 350–500ms: Tagline appears: WELLNESS, MADE A DAILY RITUAL. */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-mono text-[10px] sm:text-xs tracking-[0.3em] text-[#71776F] uppercase"
            >
              Wellness, Made a Daily Ritual.
            </motion.p>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
