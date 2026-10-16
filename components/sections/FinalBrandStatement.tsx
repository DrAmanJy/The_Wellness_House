'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion';

export const FinalBrandStatement: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden bg-[#203128] text-[#FAF7F2] py-24 sm:py-32 px-6 sm:px-12 text-center shadow-2xl">
        {/* Subtle Terroir Background Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=2000&q=80"
            alt="The Wellness House atelier architectural linen and stone"
            className="w-full h-full object-cover filter grayscale contrast-125"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#203128] via-[#203128]/80 to-[#203128]/60 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <Reveal variant="up">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CAD6BC]">
              The Daily Standard
            </span>
          </Reveal>

          <Reveal variant="up" delay={0.08}>
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light leading-[1.08] tracking-tight text-balance">
              A Little More Care. <br />
              <span className="italic font-normal text-[#FAF7F2]/90">Every Single Day.</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={0.16}>
            <p className="text-sm sm:text-base text-[#CAD6BC]/80 font-light max-w-xl mx-auto leading-relaxed">
              Standardized botanicals, cold-process saponification, and chronobiological timing protocols designed to make wellness an effortless daily ritual.
            </p>
          </Reveal>

          <Reveal variant="up" delay={0.24}>
            <div className="pt-4">
              <Link
                href="/collections"
                className="group inline-flex items-center gap-2.5 px-9 py-4 bg-[#FAF7F2] text-[#203128] font-mono text-xs uppercase tracking-[0.2em] font-medium rounded-full hover:bg-[#CAD6BC] hover:text-[#203128] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Shop the Collections</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
