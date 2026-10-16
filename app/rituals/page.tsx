'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Sparkles, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/context/store-context';
import { RitualCard } from '@/components/ritual-card';
import { RitualCategory } from '@/lib/types';
import { Reveal, StaggerContainer, StaggerItem, AnimatedTabs } from '@/components/motion';

export default function RitualsPage() {
  const { rituals } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<RitualCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const categories = [
    { id: 'all', label: 'All Daily Rituals' },
    { id: 'metabolic-balance', label: 'Metabolic & Digestive' },
    { id: 'evening-restoration', label: 'Evening Wind-Down' },
    { id: 'bath-and-body', label: 'Bath & Cleansing' },
    { id: 'adaptogenic-resilience', label: 'Adaptogens & Stress' }
  ];

  const filtered = useMemo(() => {
    return rituals.filter(r => {
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.overview.toLowerCase().includes(q) ||
          r.botanicalActives.some(b => b.name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [rituals, selectedCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* Editorial Header */}
      <Reveal variant="up">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
            The Botanical Portfolio
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal mt-2 leading-tight">
            Curated Daily Rituals & Formulations
          </h1>
          <p className="text-sm sm:text-base text-[#71776F] mt-3 leading-relaxed">
            Crafted with standardized Indian bio-actives, unrefined plant oils, and circadian chronobiology. Designed to ground your mornings and restore your evenings.
          </p>
        </div>
      </Reveal>

      {/* Control Bar: Categories & Search */}
      <Reveal variant="up" delay={0.1}>
        <div className="bg-[#FFFEFA] rounded-2xl p-4 sm:p-6 border border-[#30473B]/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Gliding Animated Categories Tabs */}
          <AnimatedTabs
            tabs={categories}
            activeTab={selectedCategory}
            onChange={(id) => setSelectedCategory(id as any)}
            className="w-full sm:w-auto"
          />

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#71776F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search active herb or ritual..."
              className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] rounded-lg border border-[#30473B]/10 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B] transition-colors"
            />
          </div>

        </div>
      </Reveal>

      {/* Results Grid with Stagger */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="font-serif text-xl text-[#252A25]">No formulations found</p>
          <p className="text-xs text-[#71776F]">Try adjusting your search criteria or view all daily rituals.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearch(''); }}
            className="text-xs font-mono uppercase text-[#30473B] underline pt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" stagger={0.08}>
          {filtered.map((ritual) => (
            <StaggerItem key={ritual.id}>
              <RitualCard ritual={ritual} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Consultation Banner */}
      <Reveal variant="up">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#30473B]/10 text-center space-y-4">
          <h3 className="font-serif text-2xl text-[#30473B]">Seeking Personalized Protocol Guidance?</h3>
          <p className="text-xs sm:text-sm text-[#71776F] max-w-lg mx-auto leading-relaxed">
            Our botanical advisors are available for private consultations in our New Delhi and Mumbai ateliers or via video.
          </p>
          <div className="pt-2">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-lg hover:bg-[#203128] transition-all shadow-xs"
            >
              <span>Schedule Personal Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Reveal>

    </div>
  );
}
