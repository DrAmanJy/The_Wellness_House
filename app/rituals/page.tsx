'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { useStore } from '@/context/store-context';
import { RitualCard } from '@/components/ritual-card';
import { RitualCategory } from '@/lib/types';
import { Reveal, StaggerContainer, StaggerItem, AnimatedTabs } from '@/components/motion';

export default function RitualsPage() {
  const { rituals } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<RitualCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'metabolic-balance', label: 'Digestion & Metabolism' },
    { id: 'evening-restoration', label: 'Evening & Sleep' },
    { id: 'bath-and-body', label: 'Bath & Body' },
    { id: 'adaptogenic-resilience', label: 'Stress & Adaptogens' }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12">
      {/* Header */}
      <Reveal variant="up">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal leading-tight">
            All Products
          </h1>
          <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
            Targeted botanical formulations crafted with standardized bio-actives and cold-pressed botanical extracts.
          </p>
        </div>
      </Reveal>

      {/* Control Bar: Categories & Search */}
      <Reveal variant="up" delay={0.1}>
        <div className="bg-[#FFFEFA] rounded-2xl p-4 sm:p-5 border border-[#30473B]/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Animated Tabs */}
          <div className="w-full md:w-auto overflow-x-auto">
            <AnimatedTabs
              tabs={categories}
              activeTab={selectedCategory}
              onChange={(id) => setSelectedCategory(id as any)}
              className="w-full sm:w-auto"
            />
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#71776F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or ingredients..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#30473B]/10 text-xs text-[#252A25] placeholder:text-[#71776F]/70 focus:outline-hidden focus:border-[#30473B] transition-colors"
            />
          </div>
        </div>
      </Reveal>

      {/* Results Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="font-serif text-xl text-[#252A25]">No products found</p>
          <p className="text-xs text-[#71776F]">Try adjusting your search query or category filter.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearch(''); }}
            className="text-xs font-medium text-[#30473B] underline pt-2 hover:text-[#203128]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8" stagger={0.06}>
          {filtered.map((ritual) => (
            <StaggerItem key={ritual.id}>
              <RitualCard ritual={ritual} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Guidance Banner */}
      <Reveal variant="up">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#30473B]/10 text-center space-y-4">
          <h3 className="font-serif text-2xl text-[#252A25]">Need Guidance Choosing?</h3>
          <p className="text-sm text-[#71776F] max-w-lg mx-auto leading-relaxed">
            Our wellness specialists are available to recommend formulations tailored to your daily wellness routine.
          </p>
          <div className="pt-2">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#30473B] text-white text-xs font-medium rounded-xl hover:bg-[#203128] transition-all shadow-xs"
            >
              <span>Consult Our Specialists</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
