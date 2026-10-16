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

const MEGA_MENU_COLLECTIONS = [
  {
    title: "Weight Management",
    description: "Circadian weight management kits & metabolic protocols",
    href: "/collections/weight-management",
  },
  {
    title: "Wellness Gummies",
    description: "Plant-pectin restorative nectar chews",
    href: "/collections/gummies",
  },
  {
    title: "Soaps & Body Care",
    description: "Six-week cold-process artisanal bars & bath salts",
    href: "/collections/soaps",
  },
  {
    title: "Wellness Bundles",
    description: "Complete 24-hour circadian suites & gifting",
    href: "/collections/bundles",
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
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
            <div className="relative">
              <button
                ref={megaMenuTriggerRef}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                className={`flex items-center gap-1 hover:text-[#30473B] transition-colors whitespace-nowrap py-1 border-b-2 ${
                  isMegaMenuOpen || pathname.startsWith("/rituals")
                    ? "border-[#30473B] text-[#30473B]"
                    : "border-transparent"
                }`}
                aria-expanded={isMegaMenuOpen}
                aria-haspopup="true"
              >
                <span>Shop</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isMegaMenuOpen ? "rotate-180" : ""
                  }`}
                  style={{ transitionDuration: "200ms" }}
                />
              </button>
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
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
            onMouseLeave={() => setIsMegaMenuOpen(false)}
            className="absolute left-0 right-0 top-full bg-[#FFFEFA] border-b border-[#30473B]/10 shadow-lg z-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* Collections */}
                <div className="col-span-5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#71776F] mb-4 block">
                    Ritual Collections
                  </span>
                  <div className="space-y-1">
                    {MEGA_MENU_COLLECTIONS.map((collection) => (
                      <Link
                        key={collection.href}
                        href={collection.href}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF7F2] transition-colors"
                      >
                        <div>
                          <span className="text-sm font-medium text-[#252A25] group-hover:text-[#30473B] transition-colors">
                            {collection.title}
                          </span>
                          <span className="text-xs text-[#71776F] block mt-0.5">
                            {collection.description}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#71776F] group-hover:text-[#30473B] group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#30473B]/10">
                    <Link
                      href="/rituals"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#30473B] font-medium hover:underline"
                    >
                      <span>Browse All Formulations</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="col-span-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#71776F] mb-4 block">
                    Featured Collection
                  </span>
                  <Link
                    href="/rituals/metabolic-balance-protocol"
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="group block rounded-2xl overflow-hidden border border-[#30473B]/10"
                  >
                    <div className="aspect-16/9 overflow-hidden">
                      <EditorialImage
                        src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
                        alt="Metabolic Balance Protocol"
                        fallbackVariant="hero_wellness"
                        aspectClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 bg-[#FAF7F2]">
                      <span className="text-xs font-mono text-[#C58B71] uppercase tracking-wider">
                        Featured
                      </span>
                      <h4 className="font-serif text-base font-medium text-[#252A25] mt-1">
                        Metabolic Balance Protocol
                      </h4>
                    </div>
                  </Link>
                </div>

                {/* Quick Links */}
                <div className="col-span-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#71776F] mb-4 block">
                    Quick Access
                  </span>
                  <div className="space-y-3 text-sm text-[#252A25]/80">
                    <Link
                      href="/science"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block hover:text-[#30473B] transition-colors"
                    >
                      The Science
                    </Link>
                    <Link
                      href="/ingredients"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block hover:text-[#30473B] transition-colors"
                    >
                      Ingredient Sourcing
                    </Link>
                    <Link
                      href="/consultation"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block hover:text-[#30473B] transition-colors"
                    >
                      Private Consultation
                    </Link>
                    <Link
                      href="/journal"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="block hover:text-[#30473B] transition-colors"
                    >
                      The Journal
                    </Link>
                  </div>
                </div>
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
