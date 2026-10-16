"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Heart,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useStore } from "@/context/store-context";
import { easing, duration } from "@/lib/motion/tokens";
import {
  megaMenuVariants,
  mobileMenuVariants,
  overlayVariants,
} from "@/lib/motion/variants";
import { EditorialImage } from "@/components/editorial-image";

interface MegaMenuCollection {
  title: string;
  tag: string;
  description: string;
  href: string;
  image: string;
  itemCount: string;
}

const MEGA_MENU_COLLECTIONS: MegaMenuCollection[] = [
  {
    title: "Weight Management Kits",
    tag: "Metabolic Balance",
    description: "Circadian metabolic suites with Darjeeling EGCG & evening carminatives",
    href: "/collections/weight-management",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
    itemCount: "2 Formulations",
  },
  {
    title: "Wellness Gummies",
    tag: "Botanical Chews",
    description: "Plant-pectin restorative nectars with German Chamomile & L-Theanine",
    href: "/collections/gummies",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
    itemCount: "2 Formulations",
  },
  {
    title: "Soaps & Body Care",
    tag: "Cold-Process Castile",
    description: "Six-week artisanal limestone-cured bars retaining pure plant glycerin",
    href: "/collections/soaps",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80",
    itemCount: "1 Formulation",
  },
  {
    title: "Wellness Bundles",
    tag: "Circadian Suites",
    description: "24-hour diurnal regimens with handcrafted brass scoops & linen journals",
    href: "/collections/bundles",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    itemCount: "1 Living Suite",
  },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { setIsSearchOpen, savedRitualSlugs, setIsCartOpen, cartCount } =
    useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
      }
    };
  }, []);

  const handleShopMouseEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setIsMegaMenuOpen(true);
  };

  const handleShopMouseLeave = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 180);
  };

  const handleOtherNavMouseEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setIsMegaMenuOpen(false);
  };

  // Track saved rituals & cart counts safely for SSR hydration
  const displaySavedCount = isMounted ? savedRitualSlugs.length : 0;
  const displayCartCount = isMounted ? cartCount : 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mega menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(e.target as Node) &&
        megaMenuTriggerRef.current &&
        !megaMenuTriggerRef.current.contains(e.target as Node)
      ) {
        setIsMegaMenuOpen(false);
      }
    };
    if (isMegaMenuOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMegaMenuOpen]);

  // Close mega menu on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMegaMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Collections", href: "/collections" },
    { label: "Rituals & Formulations", href: "/rituals" },
    { label: "The Science", href: "/science" },
    { label: "The Ateliers", href: "/atelier" },
    { label: "The Journal", href: "/journal" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        isScrolled
          ? "bg-[#FAF7F2]/97 backdrop-blur-lg border-b border-[#30473B]/8"
          : "bg-[#F5F1E8] border-b border-transparent"
      }`}
      style={{
        transitionDuration: "320ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between gap-6 sm:gap-8 transition-all ${
            isScrolled ? "h-16" : "h-20"
          }`}
          style={{
            transitionDuration: "320ms",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#252A25] hover:text-[#30473B] transition-colors focus:outline-hidden"
              aria-label={
                isMobileMenuOpen
                  ? "Close Navigation Menu"
                  : "Open Navigation Menu"
              }
              aria-expanded={isMobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0 hover:opacity-90 transition-opacity py-1.5 focus:outline-hidden"
            aria-label="The Wellness House - Return to Home"
          >
            <Image
              src="/wellness_house_logo.svg"
              alt="The Wellness House"
              width={260}
              height={80}
              priority
              className={`w-auto object-contain mix-blend-multiply select-none transition-all ${
                isScrolled ? "h-10 sm:h-11" : "h-11 sm:h-13 md:h-15"
              }`}
              style={{
                transitionDuration: "320ms",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#252A25]/80">
            {/* Shop Mega Menu Trigger */}
            <div
              className="relative py-2"
              onMouseEnter={handleShopMouseEnter}
              onMouseLeave={handleShopMouseLeave}
            >
              <button
                ref={megaMenuTriggerRef}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`flex items-center gap-1.5 hover:text-[#30473B] transition-colors whitespace-nowrap py-1 border-b-2 font-medium ${
                  isMegaMenuOpen ||
                  pathname.startsWith("/collections") ||
                  pathname.startsWith("/rituals")
                    ? "border-[#30473B] text-[#30473B]"
                    : "border-transparent"
                }`}
                aria-expanded={isMegaMenuOpen}
                aria-haspopup="true"
              >
                <span>Shop</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMegaMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={handleOtherNavMouseEnter}
                className={`hover:text-[#30473B] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  pathname === link.href
                    ? "border-[#30473B] text-[#30473B]"
                    : "border-transparent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Utility Icons & CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#252A25]/70 hover:text-[#30473B] transition-colors rounded-full hover:bg-[#CAD6BC]/15 focus:outline-hidden"
              aria-label="Search Formulations"
              title="Search botanical rituals"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Wishlist */}
            <Link
              href="/rituals"
              className="relative p-2 text-[#252A25]/70 hover:text-[#30473B] transition-colors rounded-full hover:bg-[#CAD6BC]/15 hidden sm:flex"
              aria-label={`Saved rituals (${displaySavedCount})`}
            >
              <Heart className="w-[18px] h-[18px]" />
              {displaySavedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#C58B71] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {displaySavedCount}
                </span>
              )}
            </Link>

            {/* Botanical Bag / Cart Drawer */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#252A25]/70 hover:text-[#30473B] transition-colors rounded-full hover:bg-[#CAD6BC]/15 flex items-center justify-center focus:outline-hidden"
              aria-label={`Botanical bag (${displayCartCount} items)`}
              title="Open Botanical Bag"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              <AnimatePresence>
                {displayCartCount > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#30473B] text-[#FAF7F2] text-[9px] font-bold flex items-center justify-center leading-none"
                  >
                    {displayCartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* CTA Button */}
            <Link
              href="/consultation"
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-[#FAF7F2] bg-[#30473B] hover:bg-[#203128] rounded-lg btn-primary shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mega Menu ─────────────────────────────────────── */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div
            ref={megaMenuRef}
            variants={megaMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseEnter={handleShopMouseEnter}
            onMouseLeave={handleShopMouseLeave}
            className="absolute left-0 right-0 top-full bg-[#FFFEFA]/98 backdrop-blur-2xl border-b border-[#30473B]/10 shadow-[0_30px_60px_-15px_rgba(32,49,40,0.14)] z-50 overflow-hidden"
          >
            {/* Top architectural banner */}
            <div className="border-b border-[#30473B]/5 bg-[#FAF7F2]/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-[#71776F]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30473B]" />
                  <span>The Botanical Living Apothecary</span>
                  <span className="text-[#30473B]/30">·</span>
                  <span className="text-[#30473B] font-semibold">Circadian Protocols & Pure Saponification</span>
                </div>
                <Link
                  href="/rituals"
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="hover:text-[#30473B] transition-colors flex items-center gap-1.5 text-[#30473B] font-medium"
                >
                  <span>Browse All 6 Formulations</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* ── 1. The 4 Flagship Collections (5 Cols) ────── */}
                <div className="col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#71776F] block">
                      Flagship Living Collections
                    </span>
                    <span className="font-mono text-[10px] text-[#C58B71] uppercase tracking-wider">
                      04 Diurnal Suites
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {MEGA_MENU_COLLECTIONS.map((collection) => (
                      <Link
                        key={collection.href}
                        href={collection.href}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="group flex items-center gap-3.5 p-2.5 rounded-xl border border-transparent hover:border-[#30473B]/10 hover:bg-[#FAF7F2] transition-all duration-200"
                      >
                        {/* Thumbnail image */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[#30473B]/10 bg-[#F5F1E8]">
                          <EditorialImage
                            src={collection.image}
                            alt={collection.title}
                            fallbackVariant="hero_wellness"
                            aspectClassName="w-full h-full"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                          />
                        </div>

                        {/* Text info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#C58B71] font-medium">
                              {collection.tag}
                            </span>
                            <span className="text-[10px] text-[#71776F] font-mono">· {collection.itemCount}</span>
                          </div>
                          <h4 className="text-sm font-medium text-[#252A25] group-hover:text-[#30473B] transition-colors truncate">
                            {collection.title}
                          </h4>
                          <p className="text-[11px] text-[#71776F] line-clamp-1 leading-snug mt-0.5">
                            {collection.description}
                          </p>
                        </div>

                        {/* Arrow indicator */}
                        <div className="w-7 h-7 rounded-full bg-transparent group-hover:bg-[#30473B]/10 flex items-center justify-center shrink-0 transition-colors">
                          <ArrowRight className="w-3.5 h-3.5 text-[#71776F] group-hover:text-[#30473B] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* ── 2. Featured Bestselling Protocol (4 Cols) ─── */}
                <div className="col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#71776F] block">
                      Atelier Spotlight · Protocol No. 01
                    </span>
                    <span className="font-mono text-[10px] text-[#30473B] uppercase tracking-wider font-semibold">
                      Signature Bestseller
                    </span>
                  </div>

                  <Link
                    href="/rituals/metabolic-balance-protocol"
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="group block rounded-2xl overflow-hidden border border-[#30473B]/10 bg-[#FFFEFA] shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    <div className="aspect-16/10 overflow-hidden relative">
                      <EditorialImage
                        src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80"
                        alt="The Daily Metabolic & Balance Protocol"
                        fallbackVariant="hero_wellness"
                        aspectClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-[#FFFEFA]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#30473B]/10 shadow-xs">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-[#30473B] font-bold">
                          ★ Most Requested
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-[#252A25]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-mono">
                        ₹1,850 · 30 Days
                      </div>
                    </div>
                    <div className="p-4 bg-[#FAF7F2]/80 space-y-1.5">
                      <span className="text-[10px] font-mono text-[#C58B71] uppercase tracking-wider block">
                        Standardized 50% EGCG & 60% HCA
                      </span>
                      <h4 className="font-serif text-base font-medium text-[#252A25] group-hover:text-[#30473B] transition-colors leading-snug">
                        The Daily Metabolic & Balance Protocol
                      </h4>
                      <p className="text-xs text-[#71776F] line-clamp-2 leading-relaxed">
                        Diurnal metabolic support with active Darjeeling green tea catechins and soothing whole-seed evening carminatives.
                      </p>
                      <div className="pt-2 flex items-center text-xs font-medium text-[#30473B] group-hover:underline gap-1">
                        <span>View Formulation Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </div>

                {/* ── 3. Consultation Concierge & Science (3 Cols) ─ */}
                <div className="col-span-3 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#71776F] block">
                      Chronobiology Concierge
                    </span>

                    {/* Consultation Card */}
                    <div className="p-4 rounded-2xl bg-[#F5F1E8]/70 border border-[#C58B71]/25 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#C58B71] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Complimentary</span>
                      </div>
                      <h4 className="font-serif text-sm font-medium text-[#252A25]">
                        Private Chronobiology Consultation
                      </h4>
                      <p className="text-xs text-[#71776F] leading-relaxed">
                        Meet 1-on-1 with our team to map your sleep, digestion, and circadian routine.
                      </p>
                      <Link
                        href="/consultation"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FAF7F2] bg-[#30473B] hover:bg-[#203128] px-3.5 py-2 rounded-lg transition-colors shadow-xs w-full justify-center mt-1"
                      >
                        <span>Reserve Consultation</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Sourcing & Clinical Science Links */}
                  <div className="space-y-2.5 pt-3 border-t border-[#30473B]/10">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#71776F] block">
                      Curated Knowledge
                    </span>
                    <Link
                      href="/science"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="flex items-center justify-between text-xs text-[#252A25]/80 hover:text-[#30473B] py-1 transition-colors group"
                    >
                      <span>The Clinical Science</span>
                      <ArrowRight className="w-3 h-3 text-[#71776F] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                    <Link
                      href="/ingredients"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="flex items-center justify-between text-xs text-[#252A25]/80 hover:text-[#30473B] py-1 transition-colors group"
                    >
                      <span>Botanical Sourcing Provenance</span>
                      <ArrowRight className="w-3 h-3 text-[#71776F] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                    <Link
                      href="/atelier"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="flex items-center justify-between text-xs text-[#252A25]/80 hover:text-[#30473B] py-1 transition-colors group"
                    >
                      <span>Our Atelier Locations</span>
                      <ArrowRight className="w-3 h-3 text-[#71776F] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Atelier Purity & Service Strip */}
            <div className="border-t border-[#30473B]/10 bg-[#FAF7F2] py-3.5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71776F]">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[#30473B]">✓</span>
                    <span>Complimentary Pan-India Dispatch on Ritual Suites</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#30473B]">✓</span>
                    <span>Standardized Bio-Actives · Zero Synthetic Fillers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#30473B]">✓</span>
                    <span>Cold-Compounded in GMP & ISO 22000 Facilities</span>
                  </div>
                </div>
                <Link
                  href="/collections"
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="font-mono text-xs uppercase tracking-wider text-[#30473B] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Explore All Collections</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Menu ───────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden bg-[#FAF7F2] border-b border-[#30473B]/10 overflow-hidden shadow-xl"
          >
            <div className="px-6 pt-4 pb-8">
              <div className="pb-4 mb-4 border-b border-[#30473B]/10 flex items-center justify-between">
                <Image
                  src="/wellness_house_logo.svg"
                  alt="The Wellness House"
                  width={180}
                  height={55}
                  className="h-9 w-auto object-contain mix-blend-multiply select-none"
                />
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#71776F]">
                  Atelier Portal
                </span>
              </div>
              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                      pathname === link.href
                        ? "text-[#30473B] bg-[#CAD6BC]/20 font-semibold"
                        : "text-[#252A25] hover:bg-[#CAD6BC]/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-[#30473B]/10 flex flex-col space-y-2.5 px-3">
                  <Link
                    href="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm text-[#71776F] hover:text-[#30473B]"
                  >
                    Our Manifesto & Chronobiology Craft
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm text-[#71776F] hover:text-[#30473B]"
                  >
                    Atelier Locations & Concierge
                  </Link>
                  <Link
                    href="/consultation"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-3 py-3 text-center bg-[#30473B] hover:bg-[#203128] text-[#FAF7F2] rounded-lg text-xs font-medium uppercase tracking-widest shadow-xs transition-colors"
                  >
                    Reserve Atelier Consultation
                  </Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
