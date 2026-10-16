'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Reveal } from '@/components/motion';

export const EditorialIntro: React.FC = () => {
  return (
    <section className="bg-[#F5F1E8] py-20 sm:py-28 border-y border-[#30473B]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Oversized Elegant Serif Headline */}
          <div className="lg:col-span-7 space-y-6">
            <Reveal variant="up">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#C58B71] block">
                Philosophy of Living
              </span>
            </Reveal>

            <Reveal variant="up" delay={0.08}>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#252A25] font-light leading-[1.12] tracking-tight text-balance">
                Thoughtfully Made for <br />
                <span className="italic font-normal text-[#30473B]">Everyday Wellness.</span>
              </h2>
            </Reveal>

            <Reveal variant="up" delay={0.16}>
              <div className="h-[1.5px] w-20 bg-[#30473B]/30 origin-left" />
            </Reveal>
          </div>

          {/* Right Column: Refined Split Layout Editorial Copy */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <Reveal variant="up" delay={0.22}>
              <p className="text-sm sm:text-base text-[#71776F] leading-relaxed font-light">
                We believe true wellness is not a series of aggressive interventions or synthetic stimulants. It is an intentional, quiet rhythm—nurtured by standardized botanical bio-actives, cold-process artisanal traditions, and respect for the body’s circadian clock.
              </p>
            </Reveal>

            <Reveal variant="up" delay={0.28}>
              <p className="text-xs sm:text-sm text-[#71776F]/90 leading-relaxed font-light">
                From morning green tea catechins to evening elderberry pectin nectars and cured neem cleansing bars, each creation is crafted to bring restorative composure into daily life.
              </p>
            </Reveal>

            <Reveal variant="up" delay={0.34}>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#30473B] font-medium hover:underline group"
                >
                  <span>Explore Our Philosophy</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};
