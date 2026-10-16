export type VideoPlacement =
  | 'homepage-brand-film'
  | 'shoppable-reels'
  | 'shop-the-film'
  | 'product-gallery'
  | 'editorial-story'
  | 'campaign-spotlight'
  | 'category-film';

export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '21:9' | '2.4:1';

export type CategoryFilmLayout = 'centered' | 'left' | 'asymmetric';

export interface CategoryFilmConfig {
  id: string;
  categoryId: 'weight-management' | 'gummies' | 'soaps' | 'bundles' | string;
  categoryName: string;
  eyebrow: string;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  videoUrl: string;
  posterUrl: string;
  mobilePosterUrl?: string;
  mobileVideoUrl?: string;
  layout: CategoryFilmLayout;
  overlayOpacity?: number; // 0.1 to 0.7
  videoCredit?: string;
  isAutoplay?: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface VideoItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  aspectRatio: VideoAspectRatio;
  placement: VideoPlacement;
  categoryId?: string;
  layout?: CategoryFilmLayout;
  linkedProductSlug?: string;
  linkedProductTitle?: string;
  linkedProductPrice?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  duration?: string;
  isActive: boolean;
  sortOrder: number;
  campaignStartDate?: string;
  campaignEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoAnalyticsEvent {
  videoId: string;
  event: 'impression' | 'play_start' | 'play_complete' | 'cta_click';
  timestamp: string;
}
