import type { CategoryFilmConfig } from './types.ts';

export const CATEGORY_FILMS: CategoryFilmConfig[] = [
  // ── CATEGORY A: Weight Management Kits ─────────────────────────
  {
    id: 'film-cat-weight-management',
    categoryId: 'weight-management',
    categoryName: 'Weight Management Kits',
    eyebrow: 'Botanical Metabolic Science',
    headline: 'Your Wellness.\nYour Own Rhythm.',
    description: 'Explore carefully curated essentials for your everyday wellness routine. Formulated with standardized polyphenols and whole-seed evening infusions.',
    ctaLabel: 'Explore Wellness Kits',
    ctaUrl: '/collections/weight-management',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-preparing-green-tea-42939-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2400&q=85',
    mobilePosterUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85',
    layout: 'centered',
    overlayOpacity: 0.38,
    videoCredit: 'Atelier Archive · 30-Day Metabolic Protocol',
    isAutoplay: true,
    isActive: true,
    sortOrder: 1,
  },

  // ── CATEGORY B: Wellness Gummies ────────────────────────────────
  {
    id: 'film-cat-gummies',
    categoryId: 'gummies',
    categoryName: 'Wellness Gummies',
    eyebrow: 'Sensory Plant-Pectin Nectars',
    headline: 'Small Rituals.\nBeautifully Everyday.',
    description: 'Gentle apple-pectin chews infused with calming German Chamomile, green-tea derived L-Theanine, and micro-dosed Melatonin for deep circadian restoration.',
    ctaLabel: 'Discover Our Gummies',
    ctaUrl: '/collections/gummies',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-relaxing-atmosphere-with-aromatic-candles-42940-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=2400&q=85',
    mobilePosterUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85',
    layout: 'left',
    overlayOpacity: 0.35,
    videoCredit: 'Nocturnal Wind-Down · Botanical Chews',
    isAutoplay: false,
    isActive: true,
    sortOrder: 2,
  },

  // ── CATEGORY C: Soaps & Body Care ──────────────────────────────
  {
    id: 'film-cat-soaps',
    categoryId: 'soaps',
    categoryName: 'Soaps & Body Care',
    eyebrow: 'Six-Week Cold-Process Apothecary',
    headline: 'The Art of\nEveryday Care.',
    description: 'Hand-cut artisan bars slowly cured on natural limestone with virgin coconut, neem oil, and crushed botanicals. Naturally retaining hydrating plant glycerin.',
    ctaLabel: 'Explore Body Care',
    ctaUrl: '/collections/soaps',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-showing-a-natural-soap-42941-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=2400&q=85',
    mobilePosterUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=85',
    layout: 'asymmetric',
    overlayOpacity: 0.32,
    videoCredit: 'Artisan Saponification · Natural Mineral Slip',
    isAutoplay: false,
    isActive: true,
    sortOrder: 3,
  },

  // ── CATEGORY D: Wellness Bundles ────────────────────────────────
  {
    id: 'film-cat-bundles',
    categoryId: 'bundles',
    categoryName: 'Wellness Bundles',
    eyebrow: 'Circadian Suites & Gifting',
    headline: 'Better Together.\nBeautifully Yours.',
    description: 'Harmonious suites uniting morning metabolic awakening, midday adaptogen pauses, and restorative twilight bath rituals into an effortless 24-hour choreography.',
    ctaLabel: 'Explore Wellness Bundles',
    ctaUrl: '/collections/bundles',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-tea-from-a-kettle-into-a-cup-42938-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=2400&q=85',
    mobilePosterUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=85',
    layout: 'centered',
    overlayOpacity: 0.40,
    videoCredit: 'Complete 24-Hour Circadian Suite',
    isAutoplay: false,
    isActive: true,
    sortOrder: 4,
  },
];

export function getCategoryFilm(categoryId: string): CategoryFilmConfig | undefined {
  return CATEGORY_FILMS.find((film) => film.categoryId === categoryId && film.isActive);
}

export function getAllCategoryFilms(): CategoryFilmConfig[] {
  return CATEGORY_FILMS.filter((film) => film.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}
