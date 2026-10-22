import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { listPublished } from "@/server/modules/content/public";
import { CinematicCategoryHero } from "@/components/video/CinematicCategoryHero";

export const metadata: Metadata = {
  alternates: { canonical: "/collections" },
  title: "Collections | The Wellness House",
  description:
    "Explore our botanical collections: Weight Management, Daily Gummies, Body Care, and Restorative Bundles.",
};

export default async function CollectionsIndexPage() {
  const films = (await listPublished("collections")).map((r) => r.content.film);
  const featuredHeroFilm = films[0];
  const remainingFilms = films.slice(1);

  return (
    <div className="space-y-12 sm:space-y-16 pb-24">
      {/* ── Breadcrumb Bar ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-sm text-[#71776F]">
          <Link href="/" className="hover:text-[#30473B] transition-colors">
            Home
          </Link>
          <span className="text-[#30473B]/30">/</span>
          <span className="text-[#252A25] font-medium">Collections</span>
        </nav>
      </div>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal leading-tight">
          Collections
        </h1>
        <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
          Targeted formulations crafted with standardized botanical extracts and mindful aromatics.
        </p>
      </div>

      {/* ── Featured Primary Hero Film ────────────────────────────── */}
      {featuredHeroFilm && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CinematicCategoryHero film={featuredHeroFilm} priority={true} />
        </section>
      )}

      {/* ── Remaining Collections Grid ────────────────────────────── */}
      {remainingFilms.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-12 sm:space-y-16">
            {remainingFilms.map((film) => (
              <div key={film.id}>
                <CinematicCategoryHero film={film} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
