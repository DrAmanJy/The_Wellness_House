"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RitualCard } from "@/components/ritual-card";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { useStore } from "@/context/store-context";

export const BestsellingProducts: React.FC = () => {
  // Curated 4 bestsellers spanning the four core disciplines
  const { rituals } = useStore();
  const bestsellers = rituals.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#30473B]/10 pb-8 gap-4">
        <Reveal variant="up">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30473B]" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#30473B]">
                ATELIER FORMULATIONS
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-light tracking-tight mt-1">
              Bestselling Rituals
            </h2>
            <p className="text-xs sm:text-sm text-[#71776F] font-light max-w-lg">
              Proven everyday essentials formulated with certified phytochemical
              markers and cold-process traditions.
            </p>
          </div>
        </Reveal>

        <Reveal variant="up" delay={0.1}>
          <Link
            href="/rituals"
            className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[#30473B] font-medium hover:text-[#203128] transition-colors"
          >
            <span>Explore All Formulations</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </div>

      {/* 4-Item Desktop Grid with Motion */}
      <StaggerContainer
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7"
        stagger={0.07}
      >
        {bestsellers.map((ritual) => (
          <StaggerItem key={ritual.id}>
            <RitualCard ritual={ritual} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
};
