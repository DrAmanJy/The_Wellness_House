"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  MapPin,
} from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const categories = [
    {
      title: "Botanical Formulations & Bioavailability",
      items: [
        {
          q: "What is standardized biomarker extraction?",
          a: "Standardization is the scientific discipline of measuring and guaranteeing the exact percentage of active medicinal phytochemicals in every batch. For instance, our Green Tea formulation is HPLC-tested and standardized to 50% epigallocatechin gallate (EGCG), and Ashwagandha to 5% withanolides, guaranteeing reproducible physiological efficacy unlike unverified raw leaf powders.",
        },
        {
          q: "Why does The Wellness House prioritize whole-plant synergy over synthetic isolates?",
          a: "Isolated molecules often cause metabolic friction or rapid elimination. In chronobiology, whole-plant extracts retain secondary flavonoids and co-factors that buffer uptake, regulate liver clearance, and mirror ancestral human biological reception.",
        },
        {
          q: "Are your botanical cleansers crafted without chemical sulfates?",
          a: "Always. Our cold-process bathing bars are cured for a minimum of 42 days. Saponified strictly from raw cold-pressed Virgin Kerala Coconut Oil, Spanish Olive Oil, and unprocessed Shea Butter, they naturally retain restorative vegetable glycerin.",
        },
      ],
    },
    {
      title: "Circadian Protocols & Routine Integration",
      items: [
        {
          q: "How does circadian chronobiology influence ritual timing?",
          a: "Human metabolism is governed by peripheral cellular clocks tuned to the master suprachiasmatic nucleus. Insulin sensitivity peaks in the solar morning, digestive fire wanes by sunset, and cellular detoxification and restorative REM cycles peak between 10 PM and 2 AM. Our protocols are specifically sequenced to align botanical active release with these biochemical phases.",
        },
        {
          q: "Can these protocols be integrated with existing prescription regimens?",
          a: "While our botanicals are clean, non-GMO, and food-grade, potent adaptogens and polyphenols can interact with metabolic clearance pathways (such as CYP450 enzymes). We always recommend sharing our full HPLC batch specification sheets with your treating physician.",
        },
      ],
    },
    {
      title: "The Ateliers & Consultations",
      items: [
        {
          q: "How do I visit or experience The Wellness House physical ateliers?",
          a: "Our physical sanctuaries in New Delhi (Sundar Nagar) and Mumbai (Kala Ghoda) welcome guests for private consultations, botanical tastings, and sensory compounding workshops. Walk-ins are accommodated based on availability, but private appointments are recommended.",
        },
        {
          q: "What occurs during a private ritual consultation?",
          a: "A 60-minute one-on-one session with our senior botanical chronobiologists. We map your daily sleep-wake cycle, metabolic history, environmental stressors, and constitutional traits, then compound a tailored circadian ritual guide and personalized botanical schedule.",
        },
        {
          q: "Are virtual consultations available for international guests?",
          a: "Yes. We conduct video consultations across time zones, complete with downloadable personalized circadian protocols and botanical guidelines.",
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-14">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
          Answers & Sanctuary Guidance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal mt-2">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-[#71776F] mt-3 leading-relaxed">
          In-depth insights into botanical standardization, circadian
          chronobiology, and atelier experiences.
        </p>
      </div>

      <div className="space-y-10">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-4">
            <h2 className="font-serif text-2xl text-[#30473B] border-b border-[#30473B]/10 pb-2">
              {cat.title}
            </h2>

            <div className="space-y-3">
              {cat.items.map((item, itemIdx) => {
                const globalIdx = catIdx * 10 + itemIdx;
                const isOpen = openIdx === globalIdx;

                return (
                  <div
                    key={itemIdx}
                    className="bg-[#FFFEFA] rounded-2xl border border-[#30473B]/10 overflow-hidden shadow-xs"
                  >
                    <button
                      onClick={() => setOpenIdx(isOpen ? null : globalIdx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-base sm:text-lg text-[#252A25] hover:text-[#30473B] transition-colors"
                    >
                      <span>{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#30473B] shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#71776F] shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-[#71776F] leading-relaxed border-t border-[#30473B]/05 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#30473B]/10 text-center space-y-3">
        <h3 className="font-serif text-xl text-[#252A25]">
          Have a Question Not Listed Here?
        </h3>
        <p className="text-xs text-[#71776F] max-w-md mx-auto">
          Our botanical advisory team is available Monday through Saturday to
          discuss your routine.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#30473B] hover:underline pt-2"
        >
          <span>Contact Our Atelier Team</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
