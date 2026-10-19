/**
 * Pricing catalog for The Wellness House botanical formulations.
 * All amounts are in INR (Indian Rupees).
 */

export const RITUAL_PRICES: Record<string, number> = {
  // Metabolic & Digestive
  "metabolic-balance-protocol": 2450,
  "weight-management-protocol": 2850,
  "golden-turmeric-cellular-elixir": 2150,

  // Evening & Sleep Restoration
  "evening-restoration-ritual": 1650,
  "circadian-sleep-nectar": 1850,

  // Bath, Body & Hydrotherapy
  "botanical-cleansing-ritual": 850,
  "artisan-neem-tea-tree-cleansing-bar": 850,
  "sovereign-bath-soak-ritual": 1450,
  "french-green-clay-soap": 750,
  "wild-lavender-cold-process-bar": 750,

  // Adaptogenic & Mind Vitality
  "adaptogenic-resilience-protocol": 1950,
  "ashwagandha-brahmi-nootropic": 1950,

  // Flagship Master Suites & Bundles
  "complete-everyday-sanctuary-suite": 6200,
  "seasonal-circadian-trio": 4600,
  "artisan-botanical-soap-flight": 2200,
};

/**
 * Returns the retail price in INR for a given ritual slug.
 * Default fallback is ₹1,450 for custom or unlisted formulations.
 */
export function getRitualPrice(slug: string): number {
  return RITUAL_PRICES[slug] || 1450;
}

/**
 * Formats a number as Indian Rupee currency (e.g. ₹2,450).
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
