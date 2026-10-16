export type RitualCategory = 
  | 'metabolic-balance'
  | 'evening-restoration'
  | 'bath-and-body'
  | 'adaptogenic-resilience';

export interface BotanicalActive {
  name: string;
  scientificName: string;
  sourceRegion: string;
  activeCompound: string;
  therapeuticFunction: string;
}

export interface RitualComponentItem {
  title: string;
  format: string;
  dailyTiming: string;
  purpose: string;
}

export interface RitualFormulation {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: RitualCategory;
  categoryLabel: string;
  circadianTime: string;
  badge?: string;
  imageUrl?: string;
  galleryImages?: string[];
  sensoryProfile: {
    aroma: string;
    texture: string;
    finish: string;
  };
  duration: string;
  overview: string;
  theScience: string;
  keyPillars: string[];
  components: RitualComponentItem[];
  botanicalActives: BotanicalActive[];
  stepByStepProtocol: {
    step: number;
    title: string;
    timing: string;
    instruction: string;
  }[];
  lifestyleSynergies: string[];
  fssaiLicense?: string;
  precautions: string[];
  artVariant: 
    | 'hero_wellness'
    | 'weight_kit'
    | 'gummies'
    | 'soap_botanical'
    | 'soap_lavender'
    | 'bundle_ritual'
    | 'daily_supplement'
    | 'philosophy'
    | 'atelier_sanctuary'
    | 'tea_ceremony'
    | 'botanical_press'
    | 'circadian_clock';
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  publishedDate: string;
  category: string;
  author: string;
  tags: string[];
}

export interface ConsultationBooking {
  id: string;
  date: string;
  fullName: string;
  email: string;
  phone: string;
  ritualFocus: string;
  preferredAtelier: 'new-delhi' | 'mumbai' | 'virtual-video';
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}
