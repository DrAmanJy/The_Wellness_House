'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '@/context/store-context';
import { EditorialImage } from '@/components/editorial-image';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, rituals } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
  };

  const filteredRituals = query.trim() === ''
    ? []
    : rituals.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.categoryLabel.toLowerCase().includes(q) ||
          r.overview.toLowerCase().includes(q) ||
          r.botanicalActives.some(b => b.name.toLowerCase().includes(q) || b.activeCompound.toLowerCase().includes(q))
        );
      });

  const popularQueries = [
    'Metabolic Balance',
    'Evening Restoration',
    'Cold-Process Soap',
    'Ashwagandha',
    'Circadian Rhythm',
    'Chamomile & Melatonin'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#252A25]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleClose}
      />

      <div className="min-h-screen px-4 text-center flex items-start justify-center pt-20 sm:pt-28">
        <div className="inline-block w-full max-w-2xl bg-[#FFFEFA] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all border border-[#30473B]/10 z-10 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Search Header Form */}
          <div className="p-4 sm:p-6 border-b border-[#30473B]/10 flex items-center gap-3 bg-[#FAF7F2]">
            <Search className="w-5 h-5 text-[#30473B] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search botanical formulations, science, or rituals..."
              className="w-full bg-transparent text-base sm:text-lg text-[#252A25] placeholder:text-[#71776F]/60 focus:outline-hidden font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-[#71776F] hover:text-[#30473B] px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 text-[#71776F] hover:text-[#30473B] rounded-full hover:bg-[#CAD6BC]/20 transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick suggestions if query empty */}
          {query.trim() === '' && (
            <div className="p-6">
              <div className="text-xs font-mono uppercase tracking-wider text-[#71776F] mb-3">
                Suggested Botanical Inquiries
              </div>
              <div className="flex flex-wrap gap-2">
                {popularQueries.map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#FAF7F2] text-[#30473B] hover:bg-[#CAD6BC]/30 border border-[#30473B]/10 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          {query.trim() !== '' && (
            <div className="max-h-96 overflow-y-auto p-4 sm:p-6 divide-y divide-[#30473B]/05">
              {filteredRituals.length === 0 ? (
                <div className="py-12 text-center text-[#71776F]">
                  <p className="font-serif text-lg text-[#30473B] mb-1">No botanical formulations found</p>
                  <p className="text-sm">We could not find matches for &ldquo;{query}&rdquo;. Try browsing our ritual suites.</p>
                </div>
              ) : (
                filteredRituals.map((r) => (
                  <Link
                    key={r.id}
                    href={`/rituals/${r.slug}`}
                    onClick={handleClose}
                    className="py-3.5 first:pt-0 flex items-center justify-between gap-4 group block hover:bg-[#FAF7F2]/50 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#30473B]/10 bg-[#FAF7F2]">
                        <EditorialImage
                          src={r.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'}
                          alt={r.title}
                          fallbackVariant={r.artVariant}
                          aspectClassName="w-full h-full"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-[#C58B71] uppercase tracking-wider">{r.categoryLabel}</div>
                        <div className="font-serif text-sm font-medium text-[#252A25] group-hover:text-[#30473B] truncate">{r.title}</div>
                        <div className="text-xs text-[#71776F] mt-0.5 line-clamp-1">{r.circadianTime}</div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#71776F] group-hover:text-[#30473B] group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Footer */}
          <div className="p-3 bg-[#FAF7F2] border-t border-[#30473B]/10 text-center text-[11px] text-[#71776F] flex items-center justify-between px-6">
            <span>Press ESC or click outside to dismiss</span>
            <Link 
              href="/rituals"
              onClick={handleClose}
              className="text-[#30473B] font-medium hover:underline flex items-center gap-1 font-mono uppercase tracking-wider"
            >
              <span>View All Rituals</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
