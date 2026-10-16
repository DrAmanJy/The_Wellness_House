import type { RitualFormulation, BlogPost } from './types.ts';

export const RITUAL_FORMULATIONS: RitualFormulation[] = [
  {
    id: 'form-metabolic-01',
    slug: 'metabolic-balance-protocol',
    title: 'The Daily Metabolic & Balance Protocol',
    subtitle: 'A botanically grounded 30-day rhythm for digestive harmony, cellular antioxidant defense, and steady vitality.',
    category: 'metabolic-balance',
    categoryLabel: 'Metabolic & Digestive',
    circadianTime: '07:30 Morning & 20:30 Post-Dinner',
    badge: 'Signature Protocol',
    imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71',
    galleryImages: [
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71',
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55',
      'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80'
    ],
    sensoryProfile: {
      aroma: 'Crushed fennel seeds, warm ginger root, and Darjeeling green leaf',
      texture: 'Smooth plant-cellulose tablet & warm golden brewed liquor',
      finish: 'Refreshing, gently warming digestive comfort without acidity'
    },
    duration: 'Structured 30-Day Protocol',
    overview: 'Developed as a holistic alternative to aggressive diet supplements and dehydrating stimulants. This protocol pairs standardized botanical bio-actives (60% HCA Garcinia and 50% EGCG Green Tea) with an evening digestive infusion of whole-seed fennel, ginger, and cumin to support balanced gut comfort, nutrient absorption, and circadian insulin composure.',
    theScience: 'Human metabolism is an intricate circadian clock governed by liver clock genes, gut microbiota, and cellular redox states. When stress and irregular meal timing disrupt digestive enzymes, the body experiences post-prandial lethargy and bloating. By providing standardized polyphenols alongside time-honored digestive carminatives, this protocol gently supports lipid utilization and gut motility without irritating the gastric lining.',
    keyPillars: [
      'Standardized 60% HCA Garcinia Cambogia and 50% EGCG Green Tea polyphenols',
      'Zero synthetic caffeine, dehydrating laxatives, or artificial food dyes',
      'Includes evening loose-leaf digestive tea with Kerala fennel & ginger root',
      'Accompanied by an unbleached linen 30-day habit journal and brass measuring scoop'
    ],
    components: [
      {
        title: 'Metabolic Herbal Tablets (60 Tablets)',
        format: 'Amber Glass Jar with Brass Cap',
        dailyTiming: 'Twice daily, 30 minutes before breakfast and lunch',
        purpose: 'Provides standardized green tea polyphenols and Garcinia for active metabolic composure.'
      },
      {
        title: 'Evening Digestive Infusion Tea (100g Loose Leaf)',
        format: 'Airtight Recyclable Metal Tin',
        dailyTiming: 'Every evening, 30 minutes after dinner',
        purpose: 'Steeped warm to soothe digestive spasms and calm post-meal stomach distension.'
      },
      {
        title: 'Engraved Brass Measuring Scoop (5g)',
        format: 'Handcrafted Solid Brass',
        dailyTiming: 'Used with every tea preparation',
        purpose: 'Exact volumetric measurement for optimal botanical extraction.'
      },
      {
        title: 'Mindful Circadian Protocol Journal',
        format: 'Unbleached Recycled Linen Booklet',
        dailyTiming: 'Morning and evening journaling',
        purpose: 'Habit tracking for hydration (2.5L), meal intervals, and movement consistency.'
      }
    ],
    botanicalActives: [
      {
        name: 'Garcinia Cambogia',
        scientificName: 'Garcinia gummi-gutta (Fruit Rind)',
        sourceRegion: 'Western Ghats Rainforest, Karnataka',
        activeCompound: '60% Hydroxycitric Acid (HCA)',
        therapeuticFunction: 'Gently modulates ATP-citrate lyase enzyme activity to support balanced lipid metabolism.'
      },
      {
        name: 'Darjeeling Green Tea Leaf',
        scientificName: 'Camellia sinensis (Leaf Extract)',
        sourceRegion: 'High-Altitude Estates, Darjeeling, West Bengal',
        activeCompound: '50% Epigallocatechin Gallate (EGCG)',
        therapeuticFunction: 'Delivers cellular antioxidant defense and supports normal thermogenic metabolic rates.'
      },
      {
        name: 'Black Pepper Bio-Enhancer',
        scientificName: 'Piper nigrum (Fruit Extract)',
        sourceRegion: 'Malabar Coast, Kerala',
        activeCompound: '95% Piperine',
        therapeuticFunction: 'Significantly enhances intestinal permeability and bioavailability of botanical catechins.'
      },
      {
        name: 'Whole Seed Fennel & Ginger Root',
        scientificName: 'Foeniculum vulgare & Zingiber officinale',
        sourceRegion: 'Organic Cooperative Growers, Kerala',
        activeCompound: 'Volatile Essential Oils (Anethole & Gingerols)',
        therapeuticFunction: 'Soothes gastrointestinal smooth muscle spasms and encourages enzymatic breakdown.'
      }
    ],
    stepByStepProtocol: [
      {
        step: 1,
        title: 'Morning Awakening & Hydration',
        timing: '07:30 AM (Upon Rising)',
        instruction: 'Drink 300ml of room-temperature or lukewarm water. Take 1 Metabolic Balance tablet 30 minutes before your morning meal.'
      },
      {
        step: 2,
        title: 'Midday Nutrient Grounding',
        timing: '13:00 PM (Before Lunch)',
        instruction: 'Take 1 Metabolic Balance tablet with water 30 minutes before lunch. Take 5 deep mindful breaths before your meal.'
      },
      {
        step: 3,
        title: 'The Evening Digestive Tea Ceremony',
        timing: '20:45 PM (Post Dinner)',
        instruction: 'Using your brass scoop, measure 1 level scoop (approx. 4g) of loose infusion into freshly boiled water. Steep for 5 minutes. Sip slowly without screens.'
      }
    ],
    lifestyleSynergies: [
      'Maintain 2.5 to 3 liters of clean room-temperature water daily',
      'Engage in 20 minutes of brisk outdoor walking during morning sunlight',
      'Avoid heavy refined sugar or deep-fried foods within 3 hours of sleep'
    ],
    fssaiLicense: 'FSSAI Central Lic. No. 10021064000318',
    precautions: [
      'Dietary supplement formulation. Not intended for medicinal diagnosis or disease treatment.',
      'Not suitable for pregnant or nursing individuals.',
      'Consult your physician prior to use if taking hypertensive or thyroid medication.'
    ],
    artVariant: 'weight_kit'
  },
  {
    id: 'form-sleep-01',
    slug: 'evening-restoration-ritual',
    title: 'Sleep & Restore Botanical Nectar Chews',
    subtitle: 'Plant pectin chews infused with calming Chamomile, L-Theanine, and micro-dosed Melatonin for deep restorative sleep.',
    category: 'evening-restoration',
    categoryLabel: 'Evening Restoration',
    circadianTime: '22:00 Nighttime Wind-Down',
    badge: 'Atelier Favorite',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80'
    ],
    sensoryProfile: {
      aroma: 'Sweet wild elderberry and floral apple blossom',
      texture: 'Velvety, plant-pectin chew with zero rubberiness',
      finish: 'Subtle herbal chamomile note and calming sensory finish'
    },
    duration: '60 Chews (30 Evening Rituals)',
    overview: 'Formulated with pectin from Himalayan apple peels rather than animal gelatin. This gentle evening nectar blends 3mg micro-dosed Melatonin with calming German Chamomile blossoms, Passionflower, and green-tea derived L-Theanine to prepare the nervous system for natural, restorative circadian sleep without morning brain fog.',
    theScience: 'Modern artificial blue light suppresses natural pineal gland melatonin production by up to 85%, causing delayed sleep latency and elevated nocturnal cortisol. By pairing low-dose physiological melatonin with L-Theanine (which induces calming alpha brainwave frequencies), this formulation encourages smooth parasympathetic transition into deep NREM slow-wave sleep cycles.',
    keyPillars: [
      '100% Plant-based pectin base (Gelatin-free, 100% Vegetarian)',
      'Subtle 3mg micro-dosed Melatonin to respect endogenous receptor sensitivity',
      'Infused with bioactive calming Chamomile and Passionflower',
      'Naturally flavored with elderberry puree; zero high-fructose corn syrup'
    ],
    components: [
      {
        title: 'Botanical Sleep Chews (60 Chews)',
        format: 'Amber Pharmaceutical Glass Jar',
        dailyTiming: 'Every night, 35 to 45 minutes before sleep',
        purpose: 'Chewed thoroughly to release bio-active L-Theanine and calming floral extracts.'
      }
    ],
    botanicalActives: [
      {
        name: 'German Chamomile Extract',
        scientificName: 'Matricaria recutita (Blossom)',
        sourceRegion: 'Temperate Himalayan Foothills, Himachal Pradesh',
        activeCompound: 'Apigenin Flavonoid',
        therapeuticFunction: 'Binds with affinity to GABA-A receptors to relieve neurological tension and soothe overthinking.'
      },
      {
        name: 'Pure L-Theanine',
        scientificName: 'Gamma-glutamylethylamide (Green Tea)',
        sourceRegion: 'Plant Fermentation',
        activeCompound: 'Bioactive Amino Acid',
        therapeuticFunction: 'Promotes alpha-band brain wave activity associated with alert yet serene relaxation.'
      },
      {
        name: 'Micro-Dosed Melatonin',
        scientificName: 'N-acetyl-5-methoxytryptamine',
        sourceRegion: 'Precision Botanical Synthesis',
        activeCompound: '3mg Circadian Signal',
        therapeuticFunction: 'Provides a clean physiological timing signal to help regulate the body clock.'
      }
    ],
    stepByStepProtocol: [
      {
        step: 1,
        title: 'Digital Disconnect',
        timing: '21:45 PM',
        instruction: 'Dim overhead bright lights and stow phones, laptops, and illuminated screens.'
      },
      {
        step: 2,
        title: 'The Nectar Chew',
        timing: '22:00 PM',
        instruction: 'Take 2 chews. Chew slowly and mindfully, allowing the herbal elderberry aromatics to coat the palate.'
      },
      {
        step: 3,
        title: 'Sensory Breathwork',
        timing: '22:15 PM',
        instruction: 'Practice 4-7-8 breathing in bed (inhale 4 counts, hold 7, exhale through mouth 8 counts) to settle into sleep.'
      }
    ],
    lifestyleSynergies: [
      'Keep bedroom temperature cool (around 19–21°C)',
      'Avoid caffeine or dark chocolate past 14:00 in the afternoon',
      'Use amber lighting or candlelight during the final 45 minutes of evening'
    ],
    fssaiLicense: 'FSSAI Central Lic. No. 10021064000318',
    precautions: [
      'For adult use (18+ years) only.',
      'Do not consume before operating a motor vehicle or heavy machinery.',
      'Consult your doctor if taking prescription sedatives.'
    ],
    artVariant: 'gummies'
  },
  {
    id: 'form-soap-01',
    slug: 'botanical-cleansing-ritual',
    title: 'Artisan Neem & Wild Tea Tree Cleansing Bar',
    subtitle: 'Cold-processed with virgin Kerala coconut oil, French green clay, and organic wild neem for clear, balanced skin.',
    category: 'bath-and-body',
    categoryLabel: 'Bath & Body Care',
    circadianTime: 'Daily Morning Shower Ritual',
    badge: 'Cold-Process Batch',
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d',
    galleryImages: [
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80'
    ],
    sensoryProfile: {
      aroma: 'Freshly crushed eucalyptus, raw forest neem, and tea tree leaf',
      texture: 'Dense, cushiony botanical lather with subtle mineral slip',
      finish: 'Deeply cleansed, refreshed skin with zero tightness or dryness'
    },
    duration: '125g Artisan Cured Bar (35–45 Showers)',
    overview: 'Slowly cured for six weeks in our Kerala coastal atelier. Hand-cut and stamped, this cold-process bar combines pure virgin cold-pressed coconut oil with organic neem oil and Australian tea tree to purify congested skin without stripping the protective epidermal barrier.',
    theScience: 'Commercial synthetic cleansing bars use harsh detergent surfactants (SLS/SLES) that dissolve the stratum corneum intercellular lipids, leaving skin dehydrated and prone to rebound oil production. True cold-process saponification produces rich natural vegetable glycerin, maintaining healthy cutaneous moisture and natural pH balance.',
    keyPillars: [
      '100% Free of synthetic surfactants (SLS/SLES), parabens, and phthalates',
      'Six-week cold-process cure preserving natural moisturizing plant glycerin',
      'French Green Montmorillonite clay gently draws out micro-pollutants',
      'Wrapped in biodegradable unbleached seed paper'
    ],
    components: [
      {
        title: 'Artisan Cleansing Bar (125g)',
        format: 'Hand-Cut Botanical Soap Bar',
        dailyTiming: 'Daily shower ritual',
        purpose: 'Deep purification and sensory awakening for face and body.'
      }
    ],
    botanicalActives: [
      {
        name: 'Organic Cold-Pressed Neem Seed Oil',
        scientificName: 'Azadirachta indica (Seed Oil)',
        sourceRegion: 'Certified Organic Groves, Rajasthan',
        activeCompound: 'Nimbin & Azadirachtin',
        therapeuticFunction: 'Ayurvedic botanical with clarifying, antimicrobial, and soothing dermal properties.'
      },
      {
        name: 'Wild Australian Tea Tree Leaf Oil',
        scientificName: 'Melaleuca alternifolia (Leaf Oil)',
        sourceRegion: 'Sustainable Co-operative Plantation',
        activeCompound: 'Terpinen-4-ol (minimum 40%)',
        therapeuticFunction: 'Clears clogged skin pores and provides clean, invigorating forest aromatics.'
      },
      {
        name: 'French Montmorillonite Green Clay',
        scientificName: 'Illite / Montmorillonite Mineral',
        sourceRegion: 'Southern France Quarries',
        activeCompound: 'Micro-nutrient Silicates & Copper',
        therapeuticFunction: 'Gently absorbs dermal sebum and environmental impurities without mechanical abrasion.'
      }
    ],
    stepByStepProtocol: [
      {
        step: 1,
        title: 'Lather Generation',
        timing: 'Morning Shower',
        instruction: 'Work the bar between wet palms to generate a thick, cream-like lather.'
      },
      {
        step: 2,
        title: 'Botanical Inhalation',
        timing: 'During Application',
        instruction: 'Massage across the skin while taking two deep breaths of the herbal eucalyptus steam.'
      },
      {
        step: 3,
        title: 'Clean Rinsing & Bar Resting',
        timing: 'Shower Conclusion',
        instruction: 'Rinse with tepid water. Rest the soap on a draining wooden or ceramic dish to prolong bar life.'
      }
    ],
    lifestyleSynergies: [
      'Avoid scalding hot water which dehydrates skin lipid barriers',
      'Follow with light cold-pressed almond or jojoba oil while skin remains damp'
    ],
    precautions: [
      'For external dermal cleansing only. Avoid direct contact with eyes.',
      'Conduct patch test on inner forearm if prone to botanical sensitivities.'
    ],
    artVariant: 'soap_botanical'
  },
  {
    id: 'form-adaptogen-01',
    slug: 'adaptogenic-resilience-protocol',
    title: 'KSM-66® Organic Ashwagandha & Brahmi Nootropic Brew',
    subtitle: 'Standardized full-spectrum root adaptogens for nervous system calm, cognitive clarity, and sustained midday focus.',
    category: 'adaptogenic-resilience',
    categoryLabel: 'Adaptogens & Stress',
    circadianTime: '11:00 Midday Clarity Pause',
    badge: 'Clinical Grade',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71'
    ],
    sensoryProfile: {
      aroma: 'Earthy toasted roots, raw cacao husk, and wild mountain nutmeg',
      texture: 'Silky micro-milled elixir powder that suspends cleanly in warm plant milk',
      finish: 'Comforting, grounding warmth with a delicate sweet herbal resonance'
    },
    duration: '30 Daily Midday Servings (150g Jar)',
    overview: 'Crafted for high-performing individuals experiencing mental fatigue and sensory overwhelm. We pair gold-standard KSM-66® Ashwagandha (extracted exclusively from organic roots using traditional aqueous extraction) with whole-plant Brahmi and Gotu Kola to support hypothalamic-pituitary-adrenal (HPA) axis balance and sustained neuro-cognitive resilience.',
    theScience: 'Prolonged cognitive demands elevate baseline cortisol and deplete acetylcholine neurotransmitters, manifesting as the familiar 3 PM brain slump. Standardized withanolides modulate adrenocortical hormone synthesis, while bacosides enhance synaptic transmission and cerebral blood flow, maintaining clear concentration without stimulant crashes.',
    keyPillars: [
      'Certified Organic KSM-66® Ashwagandha with verified 5% Withanolides',
      'Contains Gotu Kola and Bacopa Monnieri for neuro-protective balance',
      'Zero refined sugar, synthetic flavors, or stimulant guarana',
      'Micro-micronized for instant suspension in oat milk, water, or matcha'
    ],
    components: [
      {
        title: 'Adaptogenic Nootropic Powder (150g)',
        format: 'Heavy Fluted Amber Glass Jar',
        dailyTiming: 'Mid-morning or early afternoon (11:00 AM – 14:00 PM)',
        purpose: 'Provides standardized root adaptogens during peak mental workload.'
      }
    ],
    botanicalActives: [
      {
        name: 'KSM-66® Organic Ashwagandha Root',
        scientificName: 'Withania somnifera (Root)',
        sourceRegion: 'Rajasthan Certified Organic Estates',
        activeCompound: '5% Withanolides via HPLC',
        therapeuticFunction: 'Clinically proven to attenuate perceived psychological stress and serum cortisol.'
      },
      {
        name: 'Whole Plant Brahmi',
        scientificName: 'Bacopa monnieri',
        sourceRegion: 'Wetland Reserves, West Bengal',
        activeCompound: 'Bacosides A & B (20%)',
        therapeuticFunction: 'Enhances synaptic transmission and short-term working memory consolidation.'
      },
      {
        name: 'Pure Ceylon Cinnamon Bark',
        scientificName: 'Cinnamomum verum',
        sourceRegion: 'Southern Coastal Groves',
        activeCompound: 'Cinnamaldehyde & Proanthocyanidins',
        therapeuticFunction: 'Assists in maintaining steady post-prandial blood glucose homeostasis.'
      }
    ],
    stepByStepProtocol: [
      {
        step: 1,
        title: 'Thermal Preparation',
        timing: '11:00 AM',
        instruction: 'Warm 200ml of water or preferred plant milk to 70°C (steaming, not boiling).'
      },
      {
        step: 2,
        title: 'Micro-Whisking',
        timing: '11:02 AM',
        instruction: 'Add 1 level scoop (5g) and whisk in a circular motion until a velvety micro-foam develops.'
      },
      {
        step: 3,
        title: 'Mindful Somatic Pause',
        timing: '11:05 AM',
        instruction: 'Step away from computer screens for 5 minutes. Sip slowly and notice the physical tension releasing from your shoulders.'
      }
    ],
    lifestyleSynergies: [
      'Pair with a 5-minute outdoor eye break gazing at distant horizons',
      'Limit afternoon caffeine intake to prevent adenosine receptor disruption'
    ],
    fssaiLicense: 'FSSAI Central Lic. No. 10021064000318',
    precautions: [
      'Consult physician if taking immunosuppressive or thyroid medications.',
      'Not recommended during pregnancy.'
    ],
    artVariant: 'daily_supplement'
  },
  {
    id: 'form-bath-02',
    slug: 'sovereign-bath-soak-ritual',
    title: 'Himalayan Pink Salt & Vetiver Hydro-Therapy Soak',
    subtitle: 'Ancient mineral crystal salts scented with wild Karnataka vetiver, Mysore sandalwood, and French lavender for somatic decompression.',
    category: 'bath-and-body',
    categoryLabel: 'Bath & Body Care',
    circadianTime: '21:00 Twilight Somatic Immersion',
    badge: 'Artisanal Compounding',
    imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80'
    ],
    sensoryProfile: {
      aroma: 'Smoky cooling vetiver roots, raw mineral sea brine, and sweet alpine lavender',
      texture: 'Coarse, glistening crystalline salts dissolving smoothly into warm water',
      finish: 'Total musculoskeletal ease, skin softens with a velvety protective barrier'
    },
    duration: '450g Apothecary Jar (6 Immersive Soaks)',
    overview: 'Inspired by traditional hydro-therapy spas of the Himalayas. This bath soak combines unrefined pink crystal salts harvested from ancient marine deposits with Epsom magnesium sulfate and wild-distilled Vetiver root essential oil. When dissolved in warm water, it creates a therapeutic mineral bath that eases physical muscular fatigue and gently drops core body temperature upon exiting, preparing the nervous system for sleep.',
    theScience: 'Immersion in a 38°C mineral bath stimulates peripheral cutaneous vasodilation. When you step out of the bath into a cooler room, heat radiates rapidly from hands and feet, precipitating a 0.5°C drop in internal core body temperature—the biological catalyst required by the hypothalamus to trigger deep slow-wave delta sleep.',
    keyPillars: [
      'Unrefined fossil salt crystals containing 84 natural trace minerals',
      'Pharmaceutical grade Magnesium Sulfate to relieve somatic muscle tension',
      'Distilled with pure whole-root Vetiver from Karnataka farmers',
      'No artificial perfumes, synthetic dyes, or petroleum foaming agents'
    ],
    components: [
      {
        title: 'Himalayan Mineral Bath Crystals (450g)',
        format: 'Heavy Apothecary Jar with Cork Seal',
        dailyTiming: 'Twice weekly, before evening sleep',
        purpose: 'Deep musculoskeletal decompression and parasympathetic nervous activation.'
      }
    ],
    botanicalActives: [
      {
        name: 'Wild Khus (Vetiver) Root Oil',
        scientificName: 'Chrysopogon zizanioides',
        sourceRegion: 'Karnataka River Basin',
        activeCompound: 'Khusimol & Isovalencenol',
        therapeuticFunction: 'Ancient grounding botanical known in Ayurveda as the "oil of tranquility" for nervous exhaustion.'
      },
      {
        name: 'True Lavender Blossom Essence',
        scientificName: 'Lavandula angustifolia',
        sourceRegion: 'Kashmir Valley Organic Terraces',
        activeCompound: 'Linalool & Linalyl Acetate',
        therapeuticFunction: 'Clinically shown to lower sympathetic nervous arousal and reduce arterial heart rate variability.'
      },
      {
        name: 'Natural Epsom Magnesium',
        scientificName: 'Magnesium Sulfate Heptahydrate',
        sourceRegion: 'Natural Mineral Springs',
        activeCompound: 'Bio-available Magnesium Ions',
        therapeuticFunction: 'Relaxes smooth muscle fibers and aids in cellular electrolyte equilibrium.'
      }
    ],
    stepByStepProtocol: [
      {
        step: 1,
        title: 'The Water Sanctuary',
        timing: '21:00 PM',
        instruction: 'Fill a bath (or foot soak basin) with warm water (37–39°C). Add 3 generous handfuls (approx. 75g) of crystals.'
      },
      {
        step: 2,
        title: 'Aromatic Dissolution',
        timing: '21:05 PM',
        instruction: 'Swirl the water with your hand to release the grounding vetiver and lavender terpenes.'
      },
      {
        step: 3,
        title: '20-Minute Immersion',
        timing: '21:10 PM',
        instruction: 'Soak quietly for 20 minutes with eyes closed. Pat skin dry gently with unbleached cotton and dress in loose linen.'
      }
    ],
    lifestyleSynergies: [
      'Sip room-temperature filtered water before and after your bath',
      'Move directly from bath to a darkened bedroom to capitalize on core temperature cooldown'
    ],
    precautions: [
      'For external hydro-therapy only.',
      'Persons with cardiovascular conditions should consult their doctor regarding prolonged warm baths.'
    ],
    artVariant: 'soap_lavender'
  },
  {
    id: 'form-master-suite-01',
    slug: 'complete-everyday-sanctuary-suite',
    title: 'The Master Circadian Protocol & Ritual Suite',
    subtitle: 'A harmonious curation uniting morning metabolic tablets, midday adaptogen pause, evening bath therapy, and sleep chews.',
    category: 'metabolic-balance',
    categoryLabel: 'Comprehensive Suite',
    circadianTime: 'Full 24-Hour Circadian Architecture',
    badge: 'Atelier Archive',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80'
    ],
    sensoryProfile: {
      aroma: 'Botanical fennel, crisp elderberry, earthen vetiver, and soothing lavender',
      texture: 'Full multisensory suite spanning tablets, loose leaf, chews, and mineral salts',
      finish: 'Deep, sustained physiological harmony throughout the daylight and twilight hours'
    },
    duration: 'Comprehensive 30-Day Protocol',
    overview: 'Our master circadian suite represents the complete philosophical vision of The Wellness House: uniting morning digestive awakening, midday metabolic composure, twilight hydro-therapy, and nighttime deep restorative sleep into an effortless daily choreography.',
    theScience: 'Human physiology does not operate in fragmented isolation. Gut motility directly impacts sleep architecture via the vagus nerve, while nocturnal sleep quality determines morning insulin sensitivity and appetite hormone regulation. Unifying all circadian touchpoints provides systemic resilience against chronic modern stress.',
    keyPillars: [
      'Includes The Daily Metabolic Kit, Evening Sleep Chews, and Artisan Soap',
      'Engraved brass measuring scoop and botanical tea steep infuser',
      'Printed 64-page hardbound Circadian Living Compendium & Habit Log',
      'Includes 1 complimentary 45-minute virtual consultation with an atelier herbalist'
    ],
    components: [
      {
        title: 'The Daily Metabolic & Balance Kit',
        format: 'Tablets, Tea & Brass Scoop',
        dailyTiming: '07:30 Morning & 20:30 Post-Dinner',
        purpose: 'Regulates digestive harmony and active metabolic rate.'
      },
      {
        title: 'Botanical Sleep & Restore Chews',
        format: 'Amber Glass Jar (60 Chews)',
        dailyTiming: '22:00 Nightly',
        purpose: 'Induces calm alpha brainwaves and supports deep sleep onset.'
      },
      {
        title: 'Cold-Process Artisan Cleansing Bar',
        format: 'Hand-Cut Cured Bar (125g)',
        dailyTiming: 'Morning Shower',
        purpose: 'Gentle dermal barrier purification with neem and coconut oil.'
      },
      {
        title: 'Circadian Living Hardbound Compendium',
        format: 'Linen Bound Book',
        dailyTiming: 'Daily habit tracking',
        purpose: 'Provides chronobiology essays, daily logs, and herbal brewing guides.'
      }
    ],
    botanicalActives: [
      {
        name: 'Standardized Garcinia & Green Tea',
        scientificName: 'Garcinia gummi-gutta & Camellia sinensis',
        sourceRegion: 'Western Ghats & Darjeeling',
        activeCompound: '60% HCA & 50% EGCG',
        therapeuticFunction: 'Active daytime cellular metabolic balance.'
      },
      {
        name: 'Micro-Dosed Melatonin & Chamomile',
        scientificName: 'Matricaria recutita',
        sourceRegion: 'Himachal Pradesh',
        activeCompound: 'Apigenin & 3mg Melatonin',
        therapeuticFunction: 'Circadian timing synchronization and gentle sleep onset.'
      },
      {
        name: 'Cold-Pressed Wild Neem & Tea Tree',
        scientificName: 'Azadirachta indica',
        sourceRegion: 'Rajasthan & Australia',
        activeCompound: 'Nimbin & Terpinen-4-ol',
        therapeuticFunction: 'Skin barrier nourishment and botanical purification.'
      }
    ],
    stepByStepProtocol: [
      {
        step: 1,
        title: 'Morning Awakening & Shower',
        timing: '07:00 AM',
        instruction: 'Awaken with room-temperature water. Bathe with the cold-process neem bar, then take your morning Metabolic Tablet.'
      },
      {
        step: 2,
        title: 'Midday Grounding',
        timing: '13:00 PM',
        instruction: 'Take your second Metabolic Tablet before lunch.'
      },
      {
        step: 3,
        title: 'Evening Restoration',
        timing: '21:00 PM',
        instruction: 'Brew your warm digestive infusion after dinner and enjoy 2 Sleep Chews 40 minutes before turning off bedroom lights.'
      }
    ],
    lifestyleSynergies: [
      'Track your 30-day consistency in the provided linen habit journal',
      'Schedule a virtual consultation with our atelier team for custom protocol tuning'
    ],
    precautions: [
      'Refer to individual product panels for full botanical breakdowns and safety notes.'
    ],
    artVariant: 'bundle_ritual'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-01',
    slug: 'creating-a-consistent-self-care-routine',
    title: 'The Architecture of an Everyday Wellness Ritual',
    excerpt: 'Why sustainable wellness is never about extreme overhauls, but rather the quiet micro-habits repeated morning and night.',
    category: 'Rituals & Living',
    readTime: '4 min read',
    publishedDate: 'October 12, 2026',
    author: 'Aanya Sharma, Formulations Lead',
    tags: ['Mindfulness', 'Habits', 'Daily Care'],
    content: `
True wellness rarely arrives in a sudden weekend reset or a rigid 14-day restrictive plan. In our fast-moving urban spaces, the human endocrine system responds best not to abrupt shocks, but to deep, steady signals of consistency.

### 1. Anchor to Existing Movements
When building a new ritual—whether taking your metabolic herbal tablet or setting aside 5 minutes for warm botanical tea—anchor it directly to an established routine:
- Boiling water for your morning tea.
- The 10 minutes right after shutting your laptop.
- The warm water running before your evening shower.

### 2. The Power of Tactile Objects
Objects ground us. A hefty amber glass jar, an engraved brass measuring scoop, or the botanical aroma of cedar and lavender create sensory cues that prompt the parasympathetic nervous system to relax. When a ritual feels beautiful to touch and behold, it naturally ceases to be a chore.

### 3. Consistency Over Perfection
If you miss a dose or skip an evening meditation, there is zero room for guilt. Wellness is a lifelong companion, not a pass/fail examination. Return gently to your routine at the next meal.
    `
  },
  {
    id: 'post-02',
    slug: 'understanding-supplement-labels',
    title: 'How to Read a Botanical Label with Discerning Eyes',
    excerpt: 'A practical, science-first guide to cutting through supplement buzzwords and identifying honest botanical standardization.',
    category: 'Formulation & Science',
    readTime: '6 min read',
    publishedDate: 'September 28, 2026',
    author: 'Dr. Vikram Sen, Botanical Research Director',
    tags: ['Transparency', 'Ingredients', 'FSSAI Guide'],
    content: `
Walk down any modern health aisle and you will find bottles competing with aggressive claims: "100% instant fat incinerator", "miracle cure", or "secret ancient powder". At The Wellness House, we believe real wellness requires transparent honesty.

### Look for Standardized Active Biomarkers
A label that simply states "Green Tea Powder 500mg" tells you very little. Was it dried leaf dust, or was it an extract with verified polyphenols? Look for specific percentages such as **50% EGCG** or **60% HCA in Garcinia**. Standardization ensures every batch contains verified therapeutic concentrations.

### Gelatin vs. Fruit Pectin
Many commercial gummies use bovine or porcine gelatin, which melts easily in Indian tropical heat and excludes vegetarian diets. Pectin derived from citrus or apple peels provides a cleaner chew, remains heat-stable, and is 100% plant-based.

### Check the FSSAI License & Lab Testing
In India, reputable food supplements must clearly display their 14-digit FSSAI license number and batch identification. Always look for clarity on manufacturer origin and allergen warnings.
    `
  },
  {
    id: 'post-03',
    slug: 'the-science-of-everyday-weight-balance',
    title: 'Metabolic Balance vs Quick-Fix Diets: What Science Says',
    excerpt: 'Why healthy weight management is fundamentally about circadian rhythm, gut microbiome health, and steady insulin sensitivity.',
    category: 'Metabolic Health',
    readTime: '5 min read',
    publishedDate: 'September 14, 2026',
    author: 'Pooja Iyer, Clinical Nutritionist',
    tags: ['Weight Management', 'Metabolism', 'Gut Health'],
    content: `
We reject the outdated 1990s narrative that weight management is merely an exercise in self-punishment or crash starvation. The human endocrine system is an intricate biological web governed by sleep, stress, gut flora, and nutrient timing.

### The Role of Cortisol and Sleep
When you are chronically sleep-deprived, levels of the satiety hormone leptin plummet while ghrelin (the hunger hormone) surges. Concurrently, elevated cortisol encourages the body to store visceral fat. Supporting restorative sleep with calming botanicals is therefore one of the most effective, yet overlooked, metabolic interventions.

### Gentle Botanical Support
Botanicals like Green Tea catechins and Garcinia work by gently supporting lipid metabolism and mitigating post-prandial oxidative stress. Paired with adequate daily protein, fiber, and 2.5 liters of hydration, they help create a supportive physiological environment for steady body composition goals.
    `
  },
  {
    id: 'post-04',
    slug: 'circadian-chronobiology-and-vitality',
    title: 'The 24-Hour Circadian Chronobiology Guide',
    excerpt: 'How aligning light exposure, meal timing, and botanical protocols with the master suprachiasmatic nucleus transforms daily vitality.',
    category: 'Chronobiology',
    readTime: '7 min read',
    publishedDate: 'August 30, 2026',
    author: 'Dr. Alistair Thorne, Chronobiology Research Associate',
    tags: ['Circadian', 'Sleep Science', 'Light Protocol'],
    content: `
At the core of human vitality lies a cluster of approximately 20,000 neurons in the hypothalamus known as the Suprachiasmatic Nucleus (SCN). This master biological clock orchestrates core body temperature, hormone cascades, digestive enzyme secretion, and cellular autophagy over every 24-hour solar cycle.

### Morning Photoperiodic Calibration (06:30 – 08:30)
Within 60 minutes of waking, exposing the eyes to natural morning photons triggers melanopsin-containing retinal ganglion cells. This suppresses residual melatonin and initiates a healthy Cortisol Awakening Response (CAR), elevating body temperature and sharpening cognitive clarity.

### The Digestive Window & Post-Prandial Motility
Human insulin sensitivity peaks in the late morning and early afternoon. Consuming larger nutrient-dense meals earlier in the day aligns with natural bile production and pancreatic enzymes. Conversely, late-night snacking overtaxes hepatic clock genes and disrupts sleep quality.

### Evening Lux De-escalation
When twilight arrives, minimizing artificial blue-green light spectrums preserves natural pineal melatonin synthesis. Introducing calming botanical infusions such as Chamomile and whole-root Vetiver signals the autonomic nervous system to shift from sympathetic fight-or-flight into parasympathetic restorative digestion.
    `
  }
];

export function getRitualBySlug(slug: string): RitualFormulation | undefined {
  return RITUAL_FORMULATIONS.find((r) => r.slug === slug);
}

export function getRitualsByCategory(category: string): RitualFormulation[] {
  if (!category || category === 'all') return RITUAL_FORMULATIONS;
  return RITUAL_FORMULATIONS.filter((r) => r.category === category);
}

export function searchRituals(query: string): RitualFormulation[] {
  if (!query || query.trim() === '') return RITUAL_FORMULATIONS;
  const q = query.toLowerCase().trim();
  return RITUAL_FORMULATIONS.filter((r) => {
    return (
      r.title.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      r.overview.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.botanicalActives.some((b) => b.name.toLowerCase().includes(q))
    );
  });
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
