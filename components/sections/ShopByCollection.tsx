"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

interface CollectionCardData {
  id: string;
  categoryLabel: string;
  headline: string;
  description: string;
  href: string;
  imageUrl: string;
  videoPreviewUrl?: string;
  colSpanDesktop: string;
  aspectDesktop: string;
  aspectMobile: string;
}

const COLLECTIONS_ROW_1: CollectionCardData[] = [
  {
    id: "weight-management",
    categoryLabel: "WEIGHT MANAGEMENT",
    headline: "Wellness Kits",
    description: "Considered essentials for your personal wellness routine.",
    href: "/collections/weight-management",
    imageUrl:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=85",
    videoPreviewUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-preparing-green-tea-42939-large.mp4",
    colSpanDesktop: "lg:col-span-7",
    aspectDesktop: "lg:aspect-[16/10]",
    aspectMobile: "aspect-[4/3] sm:aspect-[16/11]",
  },
  {
    id: "gummies",
    categoryLabel: "WELLNESS GUMMIES",
    headline: "Daily Nectar Chews",
    description: "Gentle plant-pectin rituals for restorative sleep and daytime calm.",
    href: "/collections/gummies",
    imageUrl:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1400&q=85",
    videoPreviewUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-relaxing-atmosphere-with-aromatic-candles-42940-large.mp4",
    colSpanDesktop: "lg:col-span-5",
    aspectDesktop: "lg:aspect-[16/14]",
    aspectMobile: "aspect-[4/3] sm:aspect-[16/11]",
  },
];

const COLLECTIONS_ROW_2: CollectionCardData[] = [
  {
    id: "soaps",
    categoryLabel: "SOAPS & BODY CARE",
    headline: "Cold-Process Bars",
    description: "Six-week cured botanical soaps and mineral bath hydrotherapy.",
    href: "/collections/soaps",
    imageUrl:
      "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1400&q=85",
    videoPreviewUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-showing-a-natural-soap-42941-large.mp4",
    colSpanDesktop: "lg:col-span-5",
    aspectDesktop: "lg:aspect-[16/14]",
    aspectMobile: "aspect-[4/3] sm:aspect-[16/11]",
  },
  {
    id: "bundles",
    categoryLabel: "WELLNESS BUNDLES",
    headline: "The Sanctuary Suites",
    description: "Harmonious 24-hour protocols designed for comprehensive living.",
    href: "/collections/bundles",
    imageUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=85",
    videoPreviewUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-pouring-tea-from-a-kettle-into-a-cup-42938-large.mp4",
    colSpanDesktop: "lg:col-span-7",
    aspectDesktop: "lg:aspect-[16/10]",
    aspectMobile: "aspect-[4/3] sm:aspect-[16/11]",
  },
];

interface CollectionCampaignCardProps {
  card: CollectionCardData;
}

const CollectionCampaignCard: React.FC<CollectionCampaignCardProps> = ({ card }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReduced = useReducedMotion();

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (prefersReduced || !card.videoPreviewUrl) return;

    // 180ms intent delay before initiating video stream
    hoverTimeoutRef.current = setTimeout(() => {
      setIsVideoActive(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          setIsVideoActive(false);
        });
      }
    }, 180);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsVideoActive(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <Link
      href={card.href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative block w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#203128] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#30473B] transition-shadow duration-500 shadow-sm hover:shadow-xl"
    >
      {/* ── Image & Video Container ───────────────────────────────── */}
      <div className={`relative w-full ${card.aspectMobile} ${card.aspectDesktop} overflow-hidden`}>
        
        {/* Full-bleed photography (The hero, bright & natural) */}
        <Image
          src={card.imageUrl}
          alt={card.headline}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
        />

        {/* Optional Desktop Hover Video Preview */}
        {card.videoPreviewUrl && (
          <video
            ref={videoRef}
            src={card.videoPreviewUrl}
            loop
            muted
            playsInline
            preload="none"
            className={`hidden lg:block absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 pointer-events-none ${
              isVideoActive ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Subtle Bottom Vignette (Preserves image brightness across top 65%) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 via-40% to-transparent to-70% z-20 pointer-events-none transition-opacity duration-500 group-hover:from-black/85" />

        {/* Minimal Corner Arrow Indicator */}
        <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-30 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-[#FAF7F2] group-hover:text-[#203128] group-hover:border-white shadow-sm">
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* ── Clean Lower-Left Editorial Composition ─────────────────── */}
        <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 z-30 pointer-events-none space-y-2.5">
          
          {/* Small Category Label */}
          <div className="overflow-hidden">
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#CAD6BC] block">
              {card.categoryLabel}
            </span>
          </div>

          {/* Large Category Heading with subtle hover lift */}
          <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#FAF7F2] font-light leading-[1.08] tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 text-balance">
            {card.headline}
          </h3>

          {/* Short Readable Description */}
          <p className="text-xs sm:text-sm text-[#FAF7F2]/85 font-light leading-relaxed max-w-md line-clamp-2">
            {card.description}
          </p>

          {/* Elegant Arrow Link with Expanding Underline */}
          <div className="pt-2">
            <span className="relative inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[#FAF7F2] group-hover:text-[#CAD6BC] font-medium transition-colors duration-300">
              <span>Explore Collection</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:-translate-y-1" />
              <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#CAD6BC] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            </span>
          </div>

        </div>

      </div>
    </Link>
  );
};

export const ShopByCollection: React.FC = () => {
  const prefersReduced = useReducedMotion();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
      
      {/* ── SECTION HEADER REDESIGN ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#30473B]/10 pb-8 sm:pb-10 gap-6">
        
        {/* Left Editorial Header Block */}
        <div className="space-y-3.5 max-w-2xl">
          {/* Small Eyebrow */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C58B71]" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C58B71]">
              EXPLORE THE HOUSE
            </span>
          </motion.div>

          {/* Large Editorial Headline (Masked reveal) */}
          <div className="overflow-hidden">
            <motion.h2
              initial={prefersReduced ? false : { y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#252A25] font-light tracking-tight leading-[1.08] text-balance"
            >
              Discover Your <br />
              <span className="italic font-normal text-[#30473B]">Wellness Ritual.</span>
            </motion.h2>
          </div>

          {/* Supporting Description */}
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            className="text-sm sm:text-base text-[#71776F] max-w-[480px] font-light leading-relaxed pt-1"
          >
            A thoughtfully curated collection of essentials for everyday wellness and self-care.
          </motion.p>
        </div>

        {/* Right-Aligned Minimal Link on Desktop */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="shrink-0 pt-2 md:pt-0"
        >
          <Link
            href="/collections"
            className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#30473B] font-medium hover:text-[#203128] transition-colors"
          >
            <span>View All Collections</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

      </div>

      {/* ── ASYMMETRIC TWO-ROW EDITORIAL GALLERY ──────────────────── */}
      <div className="space-y-5 sm:space-y-6">
        
        {/* ROW 1: Weight Management (7 cols) + Wellness Gummies (5 cols) */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6"
        >
          {COLLECTIONS_ROW_1.map((card) => (
            <div key={card.id} className={card.colSpanDesktop}>
              <CollectionCampaignCard card={card} />
            </div>
          ))}
        </motion.div>

        {/* ROW 2: Soaps & Body Care (5 cols) + Wellness Bundles (7 cols) */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6"
        >
          {COLLECTIONS_ROW_2.map((card) => (
            <div key={card.id} className={card.colSpanDesktop}>
              <CollectionCampaignCard card={card} />
            </div>
          ))}
        </motion.div>

      </div>

    </section>
  );
};
