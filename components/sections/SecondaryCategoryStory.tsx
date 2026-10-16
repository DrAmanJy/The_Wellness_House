"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Reveal, ImageReveal } from "@/components/motion";

export const SecondaryCategoryStory: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="border-b border-[#30473B]/10 pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
          Dual Discipline Spotlights
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Story A: Wellness Gummies (Plant-Pectin Nectars) */}
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#30473B]/10 flex flex-col justify-between space-y-8 shadow-xs">
          <div className="space-y-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#C58B71]">
              Category Story // 01
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal leading-tight">
              Small Rituals. <br />
              <span className="italic text-[#30473B]">
                Pectin Nectar Chews.
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed font-light">
              Crafted with crisp Himalayan apple pectin instead of animal
              gelatin. Formulated with micro-dosed physiological melatonin,
              calming German Chamomile blossoms, and green-tea L-Theanine to
              prepare the nervous system for natural, restorative circadian
              sleep without morning grogginess.
            </p>
          </div>

          <div className="space-y-6">
            <ImageReveal className="rounded-2xl overflow-hidden aspect-[16/10] bg-[#203128]">
              <motion.img
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80"
                alt="Plant-pectin botanical chews in warm evening lighting"
                className="w-full h-full object-cover filter brightness-[0.95]"
                loading="lazy"
              />
            </ImageReveal>

            <Link
              href="/collections/gummies"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#30473B] font-medium hover:underline group"
            >
              <span>Explore Wellness Gummies</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Story B: Soaps & Body Care (Cold-Process Apothecary) */}
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#30473B]/10 flex flex-col justify-between space-y-8 shadow-xs">
          <div className="space-y-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#30473B]">
              Category Story // 02
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal leading-tight">
              The Art of <br />
              <span className="italic text-[#30473B]">Everyday Body Care.</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed font-light">
              Hand-cut botanical cleansing bars and ancient Himalayan mineral
              crystal salts slowly cured on natural stone verandas for six
              weeks. Preserving natural vegetable glycerin and infusing pure
              steam-distilled vetiver roots to soothe sensory and muscular
              fatigue.
            </p>
          </div>

          <div className="space-y-6">
            <ImageReveal className="rounded-2xl overflow-hidden aspect-[16/10] bg-[#203128]">
              <motion.img
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                src="https://images.openai.com/static-rsc-4/Pi9mlYzWe-HkKTl0J8RBom2ul33algYEm0xHKAimd4LN7qfVl2iQkxrRcRJMckaGiN5mSaY7-4FSlf-J0aab85YmyeDoLDdYUCqvXqpojFfenKN0xfYMLyJYlF6MVRLwINKOlCF-LIMdAxu1uqrfFEpg4j4qXqISmBwIi1Ly_wAIEKiNGiTeXCJ2I5CCkeJ9?purpose=fullsize"
                alt="Artisan cold-process soaps and bath hydro-therapy crystals on natural limestone"
                className="w-full h-full object-cover filter brightness-[0.95]"
                loading="lazy"
              />
            </ImageReveal>

            <Link
              href="/collections/soaps"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#30473B] font-medium hover:underline group"
            >
              <span>Explore Soaps & Body Care</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
