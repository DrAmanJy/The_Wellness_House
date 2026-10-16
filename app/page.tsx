import React from 'react';
import type { Metadata } from 'next';
import { HomepageHero } from '@/components/sections/HomepageHero';
import { EditorialIntro } from '@/components/sections/EditorialIntro';
import { ShopByCollection } from '@/components/sections/ShopByCollection';
import { BestsellingProducts } from '@/components/sections/BestsellingProducts';
import { CinematicCategoryHero } from '@/components/video/CinematicCategoryHero';
import { HousePhilosophy } from '@/components/sections/HousePhilosophy';
import { SecondaryCategoryStory } from '@/components/sections/SecondaryCategoryStory';
import { WellnessJournalSection } from '@/components/sections/WellnessJournalSection';
import { FinalBrandStatement } from '@/components/sections/FinalBrandStatement';
import { getCategoryFilm } from '@/lib/video/category-films';
import { BLOG_POSTS } from '@/lib/rituals-data';

export const metadata: Metadata = {
  title: 'The Wellness House',
  description: 'A sanctuary of botanical science, circadian metabolic balance, standardized adaptogens, and artisanal cold-process rituals.',
};

export default function HomePage() {
  // Section 6: Featured Category Film (Weight Management Kits)
  const featuredCategoryFilm = getCategoryFilm('weight-management')!;

  return (
    <div className="space-y-20 sm:space-y-32 pb-24 sm:pb-32">
      
      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: MAIN CINEMATIC HERO
         ═══════════════════════════════════════════════════════════ */}
      <HomepageHero />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: EDITORIAL INTRODUCTION
         ═══════════════════════════════════════════════════════════ */}
      <EditorialIntro />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: SHOP BY COLLECTION
         ═══════════════════════════════════════════════════════════ */}
      <ShopByCollection />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: BESTSELLING PRODUCTS
         ═══════════════════════════════════════════════════════════ */}
      <BestsellingProducts />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: FEATURED CATEGORY FILM
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CinematicCategoryHero film={featuredCategoryFilm} />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7: THE HOUSE PHILOSOPHY
         ═══════════════════════════════════════════════════════════ */}
      <HousePhilosophy />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 8: SECONDARY CATEGORY STORY
         ═══════════════════════════════════════════════════════════ */}
      <SecondaryCategoryStory />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 9: WELLNESS JOURNAL
         ═══════════════════════════════════════════════════════════ */}
      <WellnessJournalSection posts={BLOG_POSTS} />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 10: FINAL BRAND STATEMENT
         ═══════════════════════════════════════════════════════════ */}
      <FinalBrandStatement />

    </div>
  );
}
