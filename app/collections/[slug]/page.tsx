import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { getCategoryFilm } from '@/lib/video/category-films';
import { CinematicCategoryHero } from '@/components/video/CinematicCategoryHero';
import { RITUAL_FORMULATIONS } from '@/lib/rituals-data';
import { RitualCard } from '@/components/ritual-card';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const film = getCategoryFilm(slug);
  if (!film) {
    return { title: 'Collection Not Found | The Wellness House' };
  }
  return {
    title: `${film.categoryName} | The Wellness House`,
    description: film.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const film = getCategoryFilm(slug);

  if (!film) {
    notFound();
  }

  // Filter curated products belonging to this category
  const products = RITUAL_FORMULATIONS.filter((ritual) => {
    if (slug === 'weight-management') {
      return (
        ritual.category === 'metabolic-balance' ||
        ritual.slug === 'metabolic-balance-protocol' ||
        ritual.slug === 'complete-everyday-sanctuary-suite'
      );
    }
    if (slug === 'gummies') {
      return (
        ritual.slug === 'evening-restoration-ritual' ||
        ritual.category === 'evening-restoration' ||
        ritual.artVariant === 'gummies'
      );
    }
    if (slug === 'soaps') {
      return (
        ritual.category === 'bath-and-body' ||
        ritual.slug === 'botanical-cleansing-ritual' ||
        ritual.slug === 'sovereign-bath-soak-ritual'
      );
    }
    if (slug === 'bundles') {
      return (
        ritual.slug === 'complete-everyday-sanctuary-suite' ||
        ritual.categoryLabel === 'Comprehensive Suite' ||
        ritual.slug === 'metabolic-balance-protocol'
      );
    }
    return true;
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-28">
      {/* ── Breadcrumb Bar ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#71776F]">
          <Link href="/" className="hover:text-[#30473B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-[#30473B] transition-colors">
            Collections
          </Link>
          <span>/</span>
          <span className="text-[#30473B] font-medium">{film.categoryName}</span>
        </nav>
      </div>

      {/* ── Section 1: Cinematic Category Hero Film ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CinematicCategoryHero film={film} priority={true} />
      </section>

      {/* ── Section 2: Curated Collection Products ────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#30473B]/10 pb-6 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">
              Curated Formulations
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal mt-1">
              {film.categoryName}
            </h1>
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#71776F]">
            Showing {products.length} {products.length === 1 ? 'Formulation' : 'Formulations'}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <div key={product.id}>
              <RitualCard ritual={product} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Restrained Brand Philosophy Note ───────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#30473B]/10 text-center space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
            Formulation Assurance
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#252A25] font-normal max-w-xl mx-auto leading-snug">
            Standardized Botanical Actives with Zero Synthetic Stimulants.
          </h3>
          <p className="text-xs sm:text-sm text-[#71776F] max-w-lg mx-auto leading-relaxed">
            Every batch is independently tested with high-performance liquid chromatography. Packaged in recyclable amber glass and delivered across India.
          </p>
          <div className="pt-2">
            <Link
              href="/rituals"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[#30473B] hover:underline font-medium"
            >
              <span>Explore All Daily Formulations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
