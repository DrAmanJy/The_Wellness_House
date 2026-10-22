import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { published, collectionProducts } from "@/server/modules/content/public";
import { metadata } from "@/server/modules/content/seo";
import { CinematicCategoryHero } from "@/components/video/CinematicCategoryHero";
import { RitualCard } from "@/components/ritual-card";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  return metadata(await published("collections", slug), `/collections/${slug}`);
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const record = await published("collections", slug);
  const film = record?.content.film;

  if (!film) {
    notFound();
  }

  const products = await collectionProducts(record!.revision_id);

  return (
    <div className="space-y-12 sm:space-y-16 pb-24">
      {/* ── Breadcrumb Bar ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-sm text-[#71776F]">
          <Link href="/" className="hover:text-[#30473B] transition-colors">
            Home
          </Link>
          <span className="text-[#30473B]/30">/</span>
          <Link
            href="/collections"
            className="hover:text-[#30473B] transition-colors"
          >
            Collections
          </Link>
          <span className="text-[#30473B]/30">/</span>
          <span className="text-[#252A25] font-medium">
            {film.categoryName}
          </span>
        </nav>
      </div>

      {/* ── Section 1: Cinematic Category Hero Film ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CinematicCategoryHero film={film} priority={true} />
      </section>

      {/* ── Section 2: Collection Products ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#30473B]/10 pb-5 gap-3">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal">
            {film.categoryName}
          </h1>
          <p className="text-sm text-[#71776F]">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
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

      {/* ── Section 3: Brand Philosophy Note ──────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#30473B]/10 text-center space-y-4">
          <span className="text-xs font-medium uppercase tracking-widest text-[#30473B]">
            Purity & Integrity
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#252A25] font-normal max-w-lg mx-auto leading-snug">
            Standardized Botanical Actives with Zero Synthetic Fillers.
          </h3>
          <p className="text-sm text-[#71776F] max-w-md mx-auto leading-relaxed">
            Every batch is independently tested for potency and purity. Packaged in recyclable amber glass and delivered fresh.
          </p>
          <div className="pt-2">
            <Link
              href="/rituals"
              className="inline-flex items-center gap-2 text-sm text-[#30473B] font-medium hover:text-[#203128] transition-colors"
            >
              <span>View all products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
