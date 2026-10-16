'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Reveal, ImageReveal } from '@/components/motion';

export const HousePhilosophy: React.FC = () => {
  return (
    <section className="bg-[#FAF7F2] py-24 sm:py-32 border-y border-[#30473B]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Block: Oversized Serif Heading */}
        <div className="max-w-3xl space-y-4">
          <Reveal variant="up">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">
              The House Philosophy
            </span>
          </Reveal>
          <Reveal variant="up" delay={0.08}>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#252A25] font-light leading-[1.12] tracking-tight text-balance">
              Where Ancient Terroir Meets Circadian Precision.
            </h2>
          </Reveal>
        </div>

        {/* Photography & Editorial Columns Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Full-Bleed Architectural Botanical Photography */}
          <div className="lg:col-span-6 space-y-4">
            <ImageReveal className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-md aspect-[4/3] bg-[#203128]">
              <img
                src="https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=1400&q=80"
                alt="Slow infusion of herbal decoctions in warm morning light"
                className="w-full h-full object-cover filter brightness-[0.96]"
                loading="lazy"
              />
            </ImageReveal>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#71776F] text-center">
              Slow Aqueous Percolation · High-Altitude Botanical Compounding
            </p>
          </div>

          {/* Right Column: Three Editorial Narrative Columns */}
          <div className="lg:col-span-6 space-y-8 lg:pt-2">
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
                I. Biological Chronobiology
              </span>
              <p className="text-sm sm:text-base text-[#71776F] leading-relaxed font-light">
                Human metabolism is governed by circadian clock genes that synchronize with the solar diurnal cycle. Ingestion timing is as critical as ingredient purity: morning polyphenols coincide with peak cellular insulin sensitivity, while evening roots are timed to nocturnal parasympathetic vagal dominance.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#30473B]/10">
              <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
                II. Standardized Phytochemical Biomarkers
              </span>
              <p className="text-sm sm:text-base text-[#71776F] leading-relaxed font-light">
                We reject raw whole-root powders with unverified potency. Every batch undergoes third-party chromatography to certify active phytochemical markers: 60% HCA Garcinia Cambogia, 50% EGCG Green Tea polyphenols, and 5% Withanolides KSM-66® Ashwagandha.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#30473B]/10">
              <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
                III. Clean Terroir Extractions
              </span>
              <p className="text-sm sm:text-base text-[#71776F] leading-relaxed font-light">
                No petrochemical solvents, synthetic sweeteners, artificial flow agents, or animal gelatins. Extracted using cold mountain water, low-temperature percolation, and natural apple pectin to deliver pure, biocompatible nourishment.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
