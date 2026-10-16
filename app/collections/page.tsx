import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getAllCategoryFilms } from '@/lib/video/category-films';
import { CinematicCategoryHero } from '@/components/video/CinematicCategoryHero';

export const metadata: Metadata = {
  title: 'Flagship Collections | The Wellness House',
  description: 'Explore our cinematic collections: Weight Management Kits, Wellness Gummies, Soaps & Body Care, and Circadian Bundles.',
};

export default function CollectionsIndexPage() {
  const films = getAllCategoryFilms();
  const featuredHeroFilm = films[0];
  const remainingFilms = films.slice(1);

  return (
    <div className="space-y-16 sm:space-y-24 pb-28">
      {/* ── Breadcrumb Bar ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#71776F]">
          <Link href="/" className="hover:text-[#30473B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#30473B] font-medium">Collections</span>
        </nav>
      </div>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-4">
        <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
          Botanical Formulations & Living Suites
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal leading-tight">
          Flagship Product Collections
        </h1>
        <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
          Each collection is conceived with its own unique botanical identity, chronobiological protocol, and sensory atmosphere.
        </p>
      </div>

      {/* ── Featured Primary Hero Film ────────────────────────────── */}
      {featuredHeroFilm && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CinematicCategoryHero film={featuredHeroFilm} priority={true} />
        </section>
      )}

      {/* ── Remaining Collections Grid ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-[#30473B]/10 pb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">
            Explore All Collections
          </span>
        </div>

        <div className="space-y-12 sm:space-y-16">
          {remainingFilms.map((film) => (
            <div key={film.id}>
              <CinematicCategoryHero film={film} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
