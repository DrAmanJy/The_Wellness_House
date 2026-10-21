import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, MapPin } from "lucide-react";
import { RitualCard } from "@/components/ritual-card";
import { RitualDetailInteractive } from "@/app/rituals/[slug]/interactive-client";
import type { RitualFormulation } from "@/lib/types";

export function RitualDossier({
  ritual,
  related = [],
  isPreview = false,
}: {
  ritual: RitualFormulation;
  related?: RitualFormulation[];
  isPreview?: boolean;
}) {
  return (
    <div className="pb-24 space-y-12 sm:space-y-16">
      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-sm text-[#71776F]">
          <Link href="/" className="hover:text-[#30473B] transition-colors">
            Home
          </Link>
          <span className="text-[#30473B]/30">/</span>
          <Link
            href="/rituals"
            className="hover:text-[#30473B] transition-colors"
          >
            Shop
          </Link>
          <span className="text-[#30473B]/30">/</span>
          <span className="text-[#252A25] font-medium truncate">
            {ritual.title}
          </span>
        </nav>
      </div>

      {/* Main Product Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isPreview ? (
          <div className="space-y-5">
            <h1 className="font-serif text-4xl sm:text-5xl">{ritual.title}</h1>
            <p className="text-[#71776F]">{ritual.subtitle}</p>
            {ritual.imageUrl && (
              <img
                src={ritual.imageUrl}
                alt={ritual.title}
                className="max-h-[500px] rounded-2xl object-cover"
              />
            )}
            <p className="text-sm text-[#71776F]">{ritual.overview}</p>
          </div>
        ) : (
          <div suppressHydrationWarning>
            <RitualDetailInteractive ritual={ritual} />
          </div>
        )}
      </div>

      {/* Product Details & Sourcing Accordion */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="space-y-6">
          <div className="border-b border-[#30473B]/10 pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#252A25]">
              Product Details & Sourcing
            </h2>
          </div>

          <div className="border border-[#30473B]/10 rounded-2xl overflow-hidden bg-white divide-y divide-[#30473B]/10">
            {/* 1. Formula & Science */}
            <details className="group" open>
              <summary className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#FAF7F2]/50 transition-colors cursor-pointer list-none select-none">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-lg sm:text-xl text-[#252A25]">
                    Formula & Science
                  </span>
                  <span className="text-[11px] font-medium text-[#71776F] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#30473B]/8 hidden sm:inline-block">
                    Clinical Backing
                  </span>
                </div>
                <ChevronDown className="w-5 h-5 text-[#30473B] shrink-0 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 pt-1 space-y-4">
                <p className="text-sm text-[#71776F] leading-relaxed">
                  {ritual.theScience}
                </p>
                {ritual.sensoryProfile && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#30473B]/8 text-xs">
                    <div className="bg-[#FAF7F2] p-3 rounded-xl">
                      <span className="text-[#30473B] font-medium block">Aroma</span>
                      <span className="text-[#71776F] mt-0.5 block">
                        {ritual.sensoryProfile.aroma}
                      </span>
                    </div>
                    <div className="bg-[#FAF7F2] p-3 rounded-xl">
                      <span className="text-[#30473B] font-medium block">Texture</span>
                      <span className="text-[#71776F] mt-0.5 block">
                        {ritual.sensoryProfile.texture}
                      </span>
                    </div>
                    <div className="bg-[#FAF7F2] p-3 rounded-xl col-span-2 sm:col-span-1">
                      <span className="text-[#30473B] font-medium block">Timing</span>
                      <span className="text-[#71776F] mt-0.5 block">
                        {ritual.circadianTime}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </details>

            {/* 2. Included Components & Usage */}
            {ritual.components && ritual.components.length > 0 && (
              <details className="group">
                <summary className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#FAF7F2]/50 transition-colors cursor-pointer list-none select-none">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg sm:text-xl text-[#252A25]">
                      Included Components & Usage
                    </span>
                    <span className="text-[11px] font-medium text-[#71776F] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#30473B]/8 hidden sm:inline-block">
                      {ritual.components.length} Components
                    </span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-[#30473B] shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {ritual.components.map((comp, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FAF7F2] p-4 rounded-xl border border-[#30473B]/8 space-y-1.5"
                      >
                        <span className="text-[11px] font-medium text-[#C58B71] uppercase tracking-wider block">
                          {comp.format}
                        </span>
                        <h4 className="font-serif text-base text-[#252A25]">
                          {comp.title}
                        </h4>
                        <p className="text-xs text-[#71776F] leading-relaxed">
                          {comp.purpose}
                        </p>
                        <div className="pt-1 text-xs text-[#30473B] font-medium">
                          When to take: {comp.dailyTiming}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            )}

            {/* 3. Botanical Actives & Origin */}
            {ritual.botanicalActives && ritual.botanicalActives.length > 0 && (
              <details className="group">
                <summary className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#FAF7F2]/50 transition-colors cursor-pointer list-none select-none">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg sm:text-xl text-[#252A25]">
                      Botanical Actives & Origin
                    </span>
                    <span className="text-[11px] font-medium text-[#71776F] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#30473B]/8 hidden sm:inline-block">
                      {ritual.botanicalActives.length} Actives
                    </span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-[#30473B] shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {ritual.botanicalActives.map((active, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FAF7F2] p-4 rounded-xl border border-[#30473B]/8 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs text-[#71776F]">
                          <span className="font-medium text-[#C58B71]">
                            {active.sourceRegion}
                          </span>
                          <MapPin className="w-3.5 h-3.5 text-[#30473B]" />
                        </div>
                        <div>
                          <h4 className="font-serif text-base text-[#252A25]">
                            {active.name}
                          </h4>
                          <p className="italic text-xs text-[#71776F]">
                            {active.scientificName}
                          </p>
                        </div>
                        <div className="p-2.5 bg-white/70 rounded-lg text-xs">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#30473B] block">
                            Active Compound
                          </span>
                          <span className="text-[#252A25] mt-0.5 block">
                            {active.activeCompound}
                          </span>
                        </div>
                        <p className="text-xs text-[#71776F] leading-relaxed">
                          {active.therapeuticFunction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            )}

            {/* 4. Safety & Quality */}
            <details className="group">
              <summary className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#FAF7F2]/50 transition-colors cursor-pointer list-none select-none">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-lg sm:text-xl text-[#252A25]">
                    Safety, Testing & Quality
                  </span>
                  <span className="text-[11px] font-medium text-[#71776F] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#30473B]/8 hidden sm:inline-block">
                    Verified
                  </span>
                </div>
                <ChevronDown className="w-5 h-5 text-[#30473B] shrink-0 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 pt-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#30473B]/8 space-y-2">
                    <span className="text-xs font-medium text-[#252A25] block">
                      Precautions & Usage Advice
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-[#71776F]">
                      {ritual.precautions?.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#30473B]/8 space-y-2">
                    <span className="text-xs font-medium text-[#252A25] block">
                      Manufacturing & Regulatory Standards
                    </span>
                    <p className="text-[#71776F] leading-relaxed">
                      {ritual.fssaiLicense
                        ? `FSSAI License: ${ritual.fssaiLicense}`
                        : "All formulations are tested for heavy metals, pesticides, and microbiological safety."}
                    </p>
                    <p className="text-[#71776F] leading-relaxed">
                      Non-GMO, free of artificial sweeteners, preservatives, and synthetic dyes.
                    </p>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8 border-t border-[#30473B]/10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#252A25]">
              You May Also Like
            </h2>
            <Link
              href="/rituals"
              className="text-sm font-medium text-[#30473B] hover:text-[#203128] flex items-center gap-1.5 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {related.map((r) => (
              <RitualCard key={r.id} ritual={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
