'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  Leaf,
  Beaker,
} from 'lucide-react';
import { EditorialImage } from '@/components/editorial-image';
import { RitualCard } from '@/components/ritual-card';
import { RoutineBuilder } from '@/components/routine-builder';
import { Reveal, StaggerContainer, StaggerItem, AnimatedHeading, ImageReveal } from '@/components/motion';
import { BrandFilm, ShopTheFilm, ShoppableReels, EditorialVideoSection } from '@/components/video';
import type { RitualFormulation, BlogPost } from '@/lib/types';

interface HomepageSectionsProps {
  featuredRituals: RitualFormulation[];
  blogPosts: BlogPost[];
}

export const HomepageSections: React.FC<HomepageSectionsProps> = ({
  featuredRituals,
  blogPosts,
}) => {
  const articleImages = [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71',
  ];

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: EDITORIAL SENSORY VIGNETTES
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedHeading
          eyebrow="Sensory Foundations"
          headingClassName="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal"
          description="Every formulation is conceived not merely as a compound, but as a tactile sensory pause in an overstimulated day."
          align="center"
          className="max-w-2xl mb-12"
        >
          The Textures & Aromas of Daily Restoration
        </AnimatedHeading>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6" stagger={0.08}>
          {[
            {
              src: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55',
              alt: 'Pouring freshly brewed loose leaf herbal tea',
              caption: 'Digestive Infusions',
              title: 'Whole Seed Decoctions',
              sub: 'Crushed Fennel, Cumin & Ginger',
            },
            {
              src: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80',
              alt: 'Cold process artisanal soaps on stone',
              caption: 'Six-Week Curing',
              title: 'Cold-Process Olive & Neem',
              sub: 'Naturally Retained Vegetable Glycerin',
            },
            {
              src: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80',
              alt: 'Serene architectural interior with linen and wood',
              caption: 'New Delhi Atelier',
              title: 'Mehrauli Heritage Sanctuary',
              sub: 'Private Compounding & Tea Pavilion',
            },
            {
              src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
              alt: 'Mindful living in morning sunlight',
              caption: 'Circadian Rhythm',
              title: 'Solar Synchronization',
              sub: 'Aligning Retinal Light with Ingestion',
            },
          ].map((item, idx) => (
            <StaggerItem key={idx} className="space-y-3 group">
              <div className="img-hover-scale rounded-2xl overflow-hidden shadow-xs">
                <EditorialImage
                  src={item.src}
                  alt={item.alt}
                  aspectClassName="aspect-4/5"
                  caption={item.caption}
                />
              </div>
              <div className="text-center">
                <span className="text-xs font-medium text-[#252A25] block">{item.title}</span>
                <p className="text-[11px] text-[#71776F] font-serif italic">{item.sub}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: THE 4 CIRCADIAN RITUALS
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-[#30473B]/10">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">The Botanical Suite</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal mt-1">
              Rhythms for the 24-Hour Diurnal Cycle
            </h2>
          </div>
          <Link href="/rituals" className="text-xs font-medium text-[#30473B] hover:underline flex items-center gap-1.5 mt-3 md:mt-0 font-mono uppercase tracking-wider group">
            <span>Explore All Formulations</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.07}>
          {featuredRituals.map((ritual) => (
            <StaggerItem key={ritual.id}>
              <RitualCard ritual={ritual} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CINEMATIC BRAND FILM
         ═══════════════════════════════════════════════════════════ */}
      <BrandFilm />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: THREE PILLARS
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F2] py-20 border-y border-[#30473B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedHeading
            eyebrow="Formulation Discipline"
            headingClassName="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal"
            description="We reject raw whole-powder supplements with unknown bioactivity. Every batch undergoes third-party chromatography to certify active phytochemical markers."
            align="center"
            className="max-w-2xl mb-16"
          >
            Why Our Formulations Perform Differently
          </AnimatedHeading>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.09}>
            {[
              {
                icon: <Clock className="w-6 h-6" />,
                iconBg: 'bg-[#30473B]/10 text-[#30473B]',
                title: '1. Circadian Chronobiology',
                desc: 'Herbs are timed to the biological clock. Morning catechins coincide with peak insulin sensitivity, while evening roots are timed to nocturnal parasympathetic vagal dominance.',
                badge: 'Suprachiasmatic Timing Protocol',
                badgeColor: 'text-[#30473B]',
              },
              {
                icon: <Beaker className="w-6 h-6" />,
                iconBg: 'bg-[#C58B71]/15 text-[#C58B71]',
                title: '2. Standardized Biomarkers',
                desc: 'Rather than generic root powder, our ashwagandha delivers 5% withanolides, green tea guarantees 50% EGCG, and garcinia provides 60% HCA verified by HPLC assay.',
                badge: 'HPLC Monograph Disclosures',
                badgeColor: 'text-[#C58B71]',
              },
              {
                icon: <Leaf className="w-6 h-6" />,
                iconBg: 'bg-[#CAD6BC]/40 text-[#30473B]',
                title: '3. Gentle Aqueous Extractions',
                desc: 'Zero petrochemical solvents, synthetic sweeteners, or chemical flow agents. Extracted using cold mountain water and low-temperature copper vacuum percolation.',
                badge: 'Solvent-Free Guarantee',
                badgeColor: 'text-[#30473B]',
              },
            ].map((pillar, idx) => (
              <StaggerItem key={idx}>
                <div className="bg-[#FFFEFA] rounded-2xl p-8 border border-[#30473B]/10 shadow-xs space-y-4 card-interactive h-full">
                  <div className={`w-12 h-12 rounded-xl ${pillar.iconBg} flex items-center justify-center`}>
                    {pillar.icon}
                  </div>
                  <h3 className="font-serif text-xl font-medium text-[#252A25]">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed">
                    {pillar.desc}
                  </p>
                  <div className={`pt-2 text-[11px] font-mono ${pillar.badgeColor}`}>
                    {pillar.badge}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: SCIENCE OF CIRCADIAN METABOLISM
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <ImageReveal className="lg:col-span-6 relative space-y-4">
            <div className="rounded-3xl overflow-hidden border border-[#30473B]/10 bg-[#FFFEFA] shadow-md aspect-4/3">
              <EditorialImage
                src="https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=1400&q=80"
                alt="High altitude misty tea estate where Camellia Sinensis is hand-harvested"
                fallbackVariant="circadian_clock"
                aspectClassName="w-full h-full"
                className="w-full h-full object-cover"
                priority={true}
              />
            </div>
            <p className="text-center text-[11px] font-mono uppercase text-[#71776F] tracking-widest">
              High-Altitude Camellia Sinensis Terraces · Darjeeling Foothills
            </p>
          </ImageReveal>

          <Reveal className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">
              Metabolic Chronobiology
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal leading-tight text-balance">
              Why Crash Diets Fail,
              <br />
              <span className="italic font-serif text-[#30473B]">And Daily Rhythms Prevail.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
              The human endocrine system is governed by peripheral cellular clocks coordinated by the suprachiasmatic nucleus. Insulin sensitivity, hepatic bile secretion, and lipid oxidation fluctuate dramatically between solar daylight and twilight.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#30473B]/10">
                <h4 className="font-serif text-base font-medium text-[#252A25] mb-1">
                  Morning Insulin Synchronization (07:30 – 12:00)
                </h4>
                <p className="text-xs text-[#71776F] leading-relaxed">
                  Cellular GLUT4 glucose transporters and thermogenic uncoupling proteins exhibit heightened sensitivity. Providing standardized green tea catechins (50% EGCG) alongside Garcinia during this window supports smooth lipid utilization without causing jittery tachycardia.
                </p>
              </div>

              <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#30473B]/10">
                <h4 className="font-serif text-base font-medium text-[#252A25] mb-1">
                  Evening Carminative Motility (20:00 – 22:30)
                </h4>
                <p className="text-xs text-[#71776F] leading-relaxed">
                  Gastric acid synthesis naturally attenuates as melatonin begins to rise. A warm decoction of whole fennel, cumin, and ginger seeds soothes smooth muscle tension, preventing fermentation and post-prandial distension before bedtime.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/science"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#30473B] font-medium hover:underline group"
              >
                <span>Examine The Complete Research Compendium</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7: INTERACTIVE ROUTINE BUILDER
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal variant="subtle">
          <RoutineBuilder />
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 8: BOTANICAL HERBARIUM
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-[#30473B]/10">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">The Living Herbarium</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal mt-1">
              Standardized Bio-Actives & Terroir
            </h2>
          </div>
          <Link href="/ingredients" className="text-xs font-medium text-[#30473B] hover:underline flex items-center gap-1 mt-3 md:mt-0 font-mono uppercase tracking-wider group">
            <span>Browse Full Herbarium (12 Botanicals)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.1}>
          {[
            {
              src: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71',
              alt: 'Fresh herbal plant and mortar pestle',
              region: 'Western Ghats, Karnataka',
              marker: '60% HCA',
              name: 'Garcinia Cambogia',
              latin: 'Garcinia gummi-gutta',
              desc: 'Slowly harvested from coastal rainforest slopes. The sun-dried rind yields verified Hydroxycitric Acid to modulate ATP-citrate lyase.',
              method: 'Aqueous Extraction',
            },
            {
              src: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
              alt: 'Organic ashwagandha root extract, herbs and ceramic apothecary bowl',
              region: 'Organic Fields, Rajasthan',
              marker: '5% Withanolides',
              name: 'KSM-66® Ashwagandha',
              latin: 'Withania somnifera',
              desc: 'Extracted exclusively from mature pristine roots. Clinically recognized for supporting adrenal resilience and modulating nocturnal serum cortisol.',
              method: 'Full-Spectrum Root',
            },
            {
              src: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
              alt: 'Warm bath hydrotherapy water and botanical essences',
              region: 'River Basins, Karnataka',
              marker: 'Khus Sesquiterpenes',
              name: 'Wild Khus Root (Vetiver)',
              latin: 'Chrysopogon zizanioides',
              desc: 'Hydro-distilled from dense root networks. Celebrated in traditional Ayurvedic rasayana as the ultimate grounding aromatic for hyperactive evening minds.',
              method: 'Slow Copper Distillation',
            },
          ].map((plant, idx) => (
            <StaggerItem key={idx}>
              <div className="bg-[#FFFEFA] rounded-2xl overflow-hidden border border-[#30473B]/10 shadow-xs card-interactive group">
                <div className="img-hover-scale">
                  <EditorialImage
                    src={plant.src}
                    alt={plant.alt}
                    aspectClassName="aspect-4/3 w-full"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#71776F] font-mono">
                    <span>{plant.region}</span>
                    <span className="text-[#C58B71] font-semibold">{plant.marker}</span>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-[#252A25]">{plant.name}</h3>
                  <p className="text-[11px] text-[#30473B] font-mono italic">{plant.latin}</p>
                  <p className="text-xs text-[#71776F] leading-relaxed">{plant.desc}</p>
                  <div className="pt-2 border-t border-[#30473B]/10 flex items-center justify-between text-[11px] text-[#30473B]">
                    <span>{plant.method}</span>
                    <Link href="/ingredients" className="hover:underline font-medium">View Monograph →</Link>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SHOP THE FILM (PRODUCT VIDEO PROMOTION)
         ═══════════════════════════════════════════════════════════ */}
      <ShopTheFilm />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 9: ATELIERS & SANCTUARY SPACES
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#203128] text-[#FAF7F2] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <Reveal className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#CAD6BC]">
              Physical Sanctuaries
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
              Spaces Designed for Stillness & Sensory Grace.
            </h2>
            <p className="text-sm sm:text-base text-[#CAD6BC]/80 leading-relaxed">
              Step away from urban noise into our compounding ateliers in New Delhi and Mumbai. Experience private circadian consultations, sensory herbal tastings, and bespoke botanical compounding.
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-10" stagger={0.12}>
            {/* New Delhi Flagship */}
            <StaggerItem>
              <div className="bg-[#FAF7F2]/5 rounded-3xl p-6 sm:p-8 border border-[#FAF7F2]/10 space-y-6">
                <ImageReveal withScale={false} className="rounded-2xl overflow-hidden">
                  <EditorialImage
                    src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80"
                    alt="New Delhi Flagship Atelier interior with heritage wood, linen, and warm light"
                    aspectClassName="aspect-16/10"
                    caption="New Delhi Flagship · Mehrauli Enclave"
                  />
                </ImageReveal>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#CAD6BC] font-mono">
                    <span>Mehrauli Heritage Enclave</span>
                    <span>Tue – Sun: 10:00 – 19:30</span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#FAF7F2]">The Sultanpur Botanical Sanctuary</h3>
                  <p className="text-xs sm:text-sm text-[#CAD6BC]/80 leading-relaxed">
                    Surrounded by age-old neem trees and sandstone verandas. Features private formulation consultation chambers, a quiet tea pavilion, and live saponification cellars.
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-[#CAD6BC]/60 font-mono">+91 (011) 4892-0190</span>
                    <Link href="/consultation?atelier=new-delhi" className="text-xs font-medium text-[#CAD6BC] hover:underline flex items-center gap-1 font-mono uppercase tracking-wider group">
                      <span>Reserve Session</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Mumbai Atelier */}
            <StaggerItem>
              <div className="bg-[#FAF7F2]/5 rounded-3xl p-6 sm:p-8 border border-[#FAF7F2]/10 space-y-6">
                <ImageReveal withScale={false} className="rounded-2xl overflow-hidden">
                  <EditorialImage
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                    alt="Mumbai Atelier with minimalist limestone arches and tranquil coastal light"
                    aspectClassName="aspect-16/10"
                    caption="Mumbai Atelier · Kala Ghoda Arts District"
                  />
                </ImageReveal>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#CAD6BC] font-mono">
                    <span>Kala Ghoda Heritage District</span>
                    <span>Mon – Sat: 10:30 – 20:00</span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#FAF7F2]">The Ropewalk Compounding Room</h3>
                  <p className="text-xs sm:text-sm text-[#CAD6BC]/80 leading-relaxed">
                    Housed in a restored 19th-century colonial stone building. Features an acoustically treated sensory relaxation lounge, bespoke olfactory blending counters, and herbal tasting flights.
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-[#CAD6BC]/60 font-mono">+91 (022) 2284-9011</span>
                    <Link href="/consultation?atelier=mumbai" className="text-xs font-medium text-[#CAD6BC] hover:underline flex items-center gap-1 font-mono uppercase tracking-wider group">
                      <span>Reserve Session</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          <Reveal variant="fade" className="text-center pt-4">
            <Link
              href="/atelier"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#CAD6BC] text-[#203128] text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-[#FAF7F2] transition-colors shadow-sm btn-primary"
            >
              <span>Explore Atelier Tour & Visitor Guide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          EDITORIAL STORY & CINEMATIC SPLIT SCREEN
         ═══════════════════════════════════════════════════════════ */}
      <EditorialVideoSection />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 10: HIMALAYAN RETREAT
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-14 border border-[#30473B]/10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-xs">
            <div className="lg:col-span-6 space-y-6">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">
                Residencies & Immersions
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal leading-tight">
                The 7-Day Himalayan Circadian Reset
              </h2>
              <p className="text-sm text-[#71776F] leading-relaxed">
                Hosted seasonally at our mountain hermitage above Rishikesh. An intimate residency of eight guests guided by resident chronobiologists, master herbalists, and somatic practitioners.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-4 bg-[#FFFEFA] rounded-xl border border-[#30473B]/10 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-[#30473B]">Morning Protocol</span>
                  <p className="text-[#252A25] font-medium">Himalayan Dawn Walks & Forest Bathing</p>
                </div>
                <div className="p-4 bg-[#FFFEFA] rounded-xl border border-[#30473B]/10 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-[#30473B]">Evening Protocol</span>
                  <p className="text-[#252A25] font-medium">Mineral Salt Soaks & Sound Baths</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/consultation?program=himalayan-reset"
                  className="px-8 py-4 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-[#203128] transition-all inline-flex items-center gap-2 shadow-xs btn-primary"
                >
                  <span>Inquire for Upcoming Residency</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <ImageReveal className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-[#30473B]/10 shadow-lg">
                <EditorialImage
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80"
                  alt="Tranquil Himalayan mountain sanctuary mist and morning meditation"
                  aspectClassName="aspect-4/3 w-full"
                  className="w-full h-full object-cover"
                  caption="Himalayan Foothills Sanctuary · Uttarakhand"
                />
              </div>
            </ImageReveal>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          VERTICAL SHOPPABLE REELS ("INSIDE THE WELLNESS HOUSE")
         ═══════════════════════════════════════════════════════════ */}
      <ShoppableReels />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 11: HOUSE JOURNAL
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-[#30473B]/10">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">The House Gazette</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal mt-1">
              Dispatches on Science & Living
            </h2>
          </div>
          <Link href="/journal" className="text-xs font-medium text-[#30473B] hover:underline flex items-center gap-1 mt-3 md:mt-0 font-mono uppercase tracking-wider group">
            <span>Read All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.09}>
          {blogPosts.map((post, idx) => (
            <StaggerItem key={post.id} as="article">
              <div className="bg-[#FFFEFA] rounded-2xl overflow-hidden border border-[#30473B]/10 shadow-xs flex flex-col justify-between card-interactive h-full group">
                <div>
                  <div className="aspect-16/10 w-full overflow-hidden img-hover-scale">
                    <EditorialImage
                      src={articleImages[idx % articleImages.length]}
                      alt={post.title}
                      aspectClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#71776F] font-mono">
                      <span>{post.category}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <Link href={`/journal/${post.slug}`} className="block group-hover:text-[#30473B] transition-colors">
                      <h3 className="font-serif text-xl font-medium text-[#252A25] leading-snug">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#71776F] leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-[#30473B]/5 flex items-center justify-between text-xs text-[#71776F]">
                  <span>{post.author}</span>
                  <Link href={`/journal/${post.slug}`} className="text-[#30473B] font-medium hover:underline inline-flex items-center gap-1 group">
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 12: CONSULTATION CALLOUT
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-14 border border-[#30473B]/10 text-center space-y-6 shadow-xs">
            <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
              Private Appointments
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal max-w-2xl mx-auto leading-tight">
              Begin Your Personalized Botanical Protocol
            </h2>
            <p className="text-sm sm:text-base text-[#71776F] max-w-xl mx-auto leading-relaxed">
              Schedule a private 45-minute consultation with our resident herbalist and chronobiology team in New Delhi, Mumbai, or through our encrypted virtual video link.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/consultation"
                className="px-8 py-4 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-[#203128] transition-all shadow-md flex items-center gap-2 btn-primary"
              >
                <span>Schedule Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-transparent border border-[#30473B]/20 text-[#30473B] text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-[#CAD6BC]/20 transition-all"
              >
                Contact Atelier Concierge
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
};
