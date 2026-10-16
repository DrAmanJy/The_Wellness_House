"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export const HomepageHero: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Viewport intersection observer to pause video when scrolled away
  useEffect(() => {
    if (!containerRef.current || prefersReduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Autoplay if video loaded and in viewport
            if (videoRef.current) {
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [prefersReduced]);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative pt-6 sm:pt-10 lg:pt-14 pb-12 sm:pb-16 overflow-hidden bg-[#F5F1E8]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Editorial Split Layout (Left: 48%, Right: 52%) ─────────── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-14 xl:gap-16">
          
          {/* ═══════════════════════════════════════════════════════════
              LEFT SIDE: BRAND STORYTELLING (48%)
             ═══════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[48%] space-y-7 sm:space-y-8 text-left z-10">
            
            {/* 0–150ms: Small Premium Eyebrow */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2.5"
            >
              <span className="w-6 h-[1px] bg-[#30473B]/60" />
              <span className="font-mono text-xs sm:text-xs tracking-[0.25em] uppercase text-[#30473B] font-medium">
                THE ART OF EVERYDAY WELLNESS
              </span>
            </motion.div>

            {/* 100–550ms: Main Headline with Masked Per-Line Reveal */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[64px] xl:text-[74px] text-[#252A25] font-light tracking-tight leading-[1.06] text-balance">
              <span className="block overflow-hidden">
                <motion.span
                  initial={prefersReduced ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.1,
                  }}
                  className="block"
                >
                  Care That Feels Good.
                </motion.span>
              </span>

              <span className="block overflow-hidden py-0.5">
                <motion.span
                  initial={prefersReduced ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.22,
                  }}
                  className="block italic font-normal text-[#30473B]"
                >
                  Better Rituals.
                </motion.span>
              </span>

              <span className="block overflow-hidden">
                <motion.span
                  initial={prefersReduced ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.34,
                  }}
                  className="block"
                >
                  Better Every Day.
                </motion.span>
              </span>
            </h1>

            {/* 300–650ms: Supporting Description */}
            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.32,
              }}
              className="text-base sm:text-lg text-[#5A6359] max-w-[480px] font-light leading-relaxed"
            >
              Discover thoughtfully curated wellness, body care, and self-care essentials designed to bring a little more balance to your everyday routine.
            </motion.p>

            {/* 400–700ms: Primary & Secondary CTA Buttons */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.42,
              }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              {/* Primary CTA */}
              <Link
                href="/collections"
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#30473B] text-[#FAF7F2] font-mono text-xs uppercase tracking-[0.2em] font-medium rounded-full hover:bg-[#203128] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span>EXPLORE THE COLLECTION</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" />
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/about"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-[#30473B] border border-[#30473B]/25 hover:border-[#30473B] font-mono text-xs uppercase tracking-[0.2em] font-medium rounded-full hover:bg-[#FAF7F2] transition-all duration-300"
              >
                <span>DISCOVER OUR STORY</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>

          </div>

          {/* ═══════════════════════════════════════════════════════════
              RIGHT SIDE: CINEMATIC PRODUCT VISUAL (52%)
             ═══════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[52%] relative">
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.12,
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#EAE3D2] border border-[#30473B]/10 shadow-[0_20px_50px_-15px_rgba(32,49,40,0.18)]"
            >
              {/* 4:5 Aspect Ratio Container for Large Product Visual */}
              <div className="relative w-full aspect-[4/5] min-h-[480px] sm:min-h-[560px] lg:min-h-[600px] overflow-hidden">
                
                {/* Real High-Resolution Product Artwork */}
                <img
                  src="/soap.jpg"
                  alt="The Wellness House Artisan Botanical Cleansing Bar and sensory apothecary"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
                  loading="eager"
                />

                {/* Optional HTML5 Video Layer */}
                <video
                  ref={videoRef}
                  src="https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-showing-a-natural-soap-42941-large.mp4"
                  loop
                  muted
                  playsInline
                  preload="none"
                  onLoadedData={() => setIsVideoLoaded(true)}
                  className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${
                    isPlaying ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Subtle Cinematic Vignette strictly at the bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 via-35% to-transparent to-60% pointer-events-none z-10" />

                {/* Optional Discreet Video Play/Pause Control */}
                <button
                  type="button"
                  onClick={toggleVideo}
                  aria-label={isPlaying ? "Pause visual film" : "Play visual film"}
                  className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-[#FAF7F2] hover:text-[#203128] transition-all duration-300 shadow-sm"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Small, Elegant Floating Product Label (Lower Area) */}
                <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-20 pointer-events-auto">
                  <Link
                    href="/collections/soaps"
                    className="group/tag inline-flex items-center justify-between w-full max-w-sm bg-[#FAF7F2]/92 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/60 hover:bg-[#FAF7F2] transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#71776F] block">
                        Featured Formulation
                      </span>
                      <span className="font-serif text-base sm:text-lg text-[#252A25] font-medium block leading-tight">
                        Artisan Cleansing Bar
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#30473B]/10 flex items-center justify-center text-[#30473B] group-hover/tag:bg-[#30473B] group-hover/tag:text-[#FAF7F2] transition-colors duration-300">
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/tag:translate-x-0.5 group-hover/tag:-translate-y-0.5" />
                    </div>
                  </Link>
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
