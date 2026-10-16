/**
 * Motion Design Tokens
 * 
 * Centralized timing, easing, and animation configuration
 * for The Wellness House premium motion system.
 * 
 * Inspired by Apple's precision and Aesop's editorial restraint.
 */

// ── Easing Curves ──────────────────────────────────────────────
export const easing = {
  /** Primary easing: quick response, refined finish */
  smooth: [0.22, 1, 0.36, 1] as const,
  /** Gentle deceleration for entrance reveals */
  decelerate: [0.0, 0.0, 0.2, 1] as const,
  /** Subtle acceleration for exit animations */
  accelerate: [0.4, 0.0, 1, 1] as const,
  /** Standard interaction easing */
  standard: [0.4, 0.0, 0.2, 1] as const,
} as const;

// ── Spring Configurations ──────────────────────────────────────
export const spring = {
  /** Gentle spring for interface interactions — minimal overshoot */
  gentle: { stiffness: 260, damping: 30, mass: 1 },
  /** Snappy spring for buttons and toggles */
  snappy: { stiffness: 400, damping: 35, mass: 0.8 },
  /** Soft spring for modals and drawers */
  soft: { stiffness: 200, damping: 28, mass: 1.2 },
  /** Bouncy for subtle number counters (very restrained) */
  counter: { stiffness: 300, damping: 32, mass: 0.6 },
} as const;

// ── Duration Tokens (in seconds) ──────────────────────────────
export const duration = {
  /** Micro-interactions: 120–180ms */
  micro: 0.15,
  /** Buttons and hover: 160–240ms */
  button: 0.2,
  /** Dropdowns and navigation: 180–280ms */
  nav: 0.24,
  /** Cart and modal transitions: 200–320ms */
  modal: 0.28,
  /** Section entrances: 350–550ms */
  section: 0.45,
  /** Hero introduction: 450–750ms */
  hero: 0.6,
  /** Page transitions: 180–300ms */
  page: 0.24,
} as const;

// ── Stagger Intervals (in seconds) ────────────────────────────
export const stagger = {
  /** Default stagger between children: 50–90ms */
  default: 0.06,
  /** Hero headline lines: ~80ms */
  heroLine: 0.08,
  /** Product card grid items */
  card: 0.07,
  /** Navigation items */
  navItem: 0.05,
  /** Fast micro-stagger */
  fast: 0.04,
} as const;

// ── Reveal Distances (in pixels) ──────────────────────────────
export const distance = {
  /** Standard reveal Y offset */
  reveal: 20,
  /** Hero headline Y offset */
  heroLine: 24,
  /** Subtle micro reveal */
  subtle: 10,
  /** Menu dropdown Y offset */
  dropdown: 8,
  /** Arrow horizontal shift on hover */
  arrowHover: 5,
} as const;

// ── Scale Values ──────────────────────────────────────────────
export const scale = {
  /** Hero image starting scale */
  heroImage: 1.035,
  /** Product card image hover scale */
  cardHover: 1.035,
  /** Collection image hover scale */
  collectionHover: 1.04,
  /** Button press scale */
  buttonPress: 0.98,
} as const;

// ── Viewport Observation ──────────────────────────────────────
export const viewport = {
  /** Trigger slightly before elements enter: -60px margin */
  default: { once: true, margin: '-60px 0px' as const },
  /** Looser trigger for hero elements */
  hero: { once: true, margin: '-30px 0px' as const },
  /** Tighter trigger for text sections */
  text: { once: true, margin: '-80px 0px' as const },
} as const;
