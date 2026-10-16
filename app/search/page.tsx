'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useStore } from '@/context/store-context';
import { RitualCard } from '@/components/ritual-card';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { rituals } = useStore();
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    if (!query.trim()) return rituals;
    const q = query.toLowerCase();
    return rituals.filter((r) => (
      r.title.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      r.categoryLabel.toLowerCase().includes(q) ||
      r.overview.toLowerCase().includes(q) ||
      r.botanicalActives.some(b => b.name.toLowerCase().includes(q))
    ));
  }, [rituals, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      <div className="text-center max-w-xl mx-auto">
        <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">Sanctuary Search</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal mt-1">
          Search Formulations & Rituals
        </h1>

        <div className="mt-6 relative">
          <Search className="w-4 h-4 text-[#71776F] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by botanical name, circadian rhythm, or herb..."
            className="w-full bg-[#FFFEFA] border border-[#30473B]/20 rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#252A25] focus:outline-hidden focus:border-[#30473B] shadow-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#71776F] border-b border-[#30473B]/10 pb-4">
        <span>Found <strong>{results.length}</strong> matching formulation(s)</span>
        {query && (
          <button onClick={() => setQuery('')} className="text-[#C58B71] hover:underline">
            Clear Search
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="bg-[#FFFEFA] rounded-2xl p-12 text-center border border-[#30473B]/10 max-w-md mx-auto my-12">
          <h3 className="font-serif text-xl text-[#30473B] mb-2">No Formulations Found</h3>
          <p className="text-xs text-[#71776F]">
            We could not find matching formulations for &ldquo;{query}&rdquo;. Try browsing our circadian protocols.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((ritual) => (
            <RitualCard key={ritual.id} ritual={ritual} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
