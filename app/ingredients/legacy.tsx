"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  MapPin,
  Sparkles,
  Check,
  ArrowRight,
  Leaf,
  Compass,
} from "lucide-react";
import { EditorialImage } from "@/components/editorial-image";

interface IngredientEntry {
  name: string;
  scientificName: string;
  category:
    "Metabolic & Digestive" | "Sleep & Nootropic" | "Botanical Oils & Clays";
  origin: string;
  imageUrl: string;
  activeConstituents: string;
  purpose: string;
  usedInRituals: { name: string; slug: string }[];
}

export default function IngredientsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const ingredients: IngredientEntry[] = [
    {
      name: "Garcinia Cambogia",
      scientificName: "Garcinia gummi-gutta (Fruit Rind)",
      category: "Metabolic & Digestive",
      origin: "Western Ghats, Karnataka & Kerala",
      imageUrl: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71",
      activeConstituents: "Standardized 60% Hydroxycitric Acid (HCA)",
      purpose:
        "Gently inhibits ATP-citrate lyase to support balanced lipid metabolism and post-meal satiety without stimulant jitteriness.",
      usedInRituals: [
        {
          name: "The Daily Metabolic & Balance Protocol",
          slug: "metabolic-balance-protocol",
        },
      ],
    },
    {
      name: "Darjeeling Green Tea Leaf",
      scientificName: "Camellia sinensis (Leaf)",
      category: "Metabolic & Digestive",
      origin: "High-Altitude Estates, Darjeeling, West Bengal",
      imageUrl:
        "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=800&q=80",
      activeConstituents: "Standardized 50% Epigallocatechin Gallate (EGCG)",
      purpose:
        "Offers cellular antioxidant protection and supports normal metabolic rate and fatty acid oxidation during daily movement.",
      usedInRituals: [
        {
          name: "The Daily Metabolic & Balance Protocol",
          slug: "metabolic-balance-protocol",
        },
      ],
    },
    {
      name: "KSM-66® Organic Ashwagandha",
      scientificName: "Withania somnifera (Root)",
      category: "Sleep & Nootropic",
      origin: "Certified Organic Farms, Rajasthan",
      imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796",
      activeConstituents: "Standardized 5% Withanolides via HPLC",
      purpose:
        "Full-spectrum root adaptogen that supports adrenal response, healthy baseline cortisol levels, and everyday emotional equilibrium.",
      usedInRituals: [
        {
          name: "KSM-66® Organic Ashwagandha & Brahmi Nootropic Brew",
          slug: "adaptogenic-resilience-protocol",
        },
      ],
    },
    {
      name: "German Chamomile Blossom",
      scientificName: "Matricaria recutita (Flowers)",
      category: "Sleep & Nootropic",
      origin: "Himachal Pradesh Foothills",
      imageUrl:
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
      activeConstituents: "Bioactive Apigenin & Chamazulene",
      purpose:
        "Binds with affinity to GABA-A neural receptors, facilitating nervous system transition into slow-wave restorative sleep.",
      usedInRituals: [
        {
          name: "Sleep & Restore Botanical Nectar Chews",
          slug: "evening-restoration-ritual",
        },
      ],
    },
    {
      name: "Himalayan Apple Pectin",
      scientificName: "Malus domestica (Fruit Peel)",
      category: "Sleep & Nootropic",
      origin: "Orchards of Himachal Pradesh",
      imageUrl:
        "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
      activeConstituents: "Soluble Galacturonic Acid Polysaccharides",
      purpose:
        "Provides a completely plant-derived, gelatin-free matrix for botanical gummies while acting as a gentle prebiotic soluble fiber.",
      usedInRituals: [
        {
          name: "Sleep & Restore Botanical Nectar Chews",
          slug: "evening-restoration-ritual",
        },
      ],
    },
    {
      name: "Organic Cold-Pressed Neem",
      scientificName: "Azadirachta indica (Seed Oil)",
      category: "Botanical Oils & Clays",
      origin: "Arid Groves, Rajasthan",
      imageUrl:
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
      activeConstituents: "Nimbin, Nimbidin, & Essential Fatty Acids",
      purpose:
        "Legendary Ayurvedic purifying botanical that calms sensitive, blemish-prone skin while safeguarding the dermal acid mantle.",
      usedInRituals: [
        {
          name: "Artisan Neem & Wild Tea Tree Cleansing Bar",
          slug: "botanical-cleansing-ritual",
        },
      ],
    },
    {
      name: "French Montmorillonite Green Clay",
      scientificName: "Natural Smectite Mineral Silicate",
      category: "Botanical Oils & Clays",
      origin: "Southern France Ancient Quarries",
      imageUrl:
        "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80",
      activeConstituents: "Micro-Nutrient Montmorillonite & Copper Minerals",
      purpose:
        "Possesses micro-porous adsorption capacity to gently remove urban airborne pollutants and sebum without mechanical scratching.",
      usedInRituals: [
        {
          name: "Artisan Neem & Wild Tea Tree Cleansing Bar",
          slug: "botanical-cleansing-ritual",
        },
      ],
    },
    {
      name: "Wild Khus Root (Vetiver)",
      scientificName: "Chrysopogon zizanioides",
      category: "Botanical Oils & Clays",
      origin: "Karnataka River Basins",
      imageUrl:
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
      activeConstituents: "Khusimol, Isovalencenol & Vetivone",
      purpose:
        "Grounding earthy sesquiterpenes that calm somatic muscle tension and alleviate sensory fatigue during evening hydro-therapy.",
      usedInRituals: [
        {
          name: "Himalayan Pink Salt & Vetiver Hydro-Therapy Soak",
          slug: "sovereign-bath-soak-ritual",
        },
      ],
    },
    {
      name: "Whole Fennel & Ginger Root",
      scientificName: "Foeniculum vulgare & Zingiber officinale",
      category: "Metabolic & Digestive",
      origin: "Kerala Co-operative Organic Farmers",
      imageUrl:
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80",
      activeConstituents: "Volatile Anethole, Gingerols & Shogaols",
      purpose:
        "Carminative seeds that stimulate bile and digestive enzymes to dissolve gas accumulation and calm gastrointestinal spasms.",
      usedInRituals: [
        {
          name: "The Daily Metabolic & Balance Protocol",
          slug: "metabolic-balance-protocol",
        },
      ],
    },
  ];

  const filtered = ingredients.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory)
      return false;
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.scientificName.toLowerCase().includes(q) ||
        item.origin.toLowerCase().includes(q) ||
        item.activeConstituents.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="pb-24 space-y-16">
      {/* Editorial Hero */}
      <section className="bg-[#FAF7F2] py-20 border-b border-[#30473B]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
            Botanical Traceability & Herbarium
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#252A25] font-normal leading-tight text-balance">
            Radical Botanical Transparency.
          </h1>
          <p className="text-base sm:text-lg text-[#71776F] max-w-2xl mx-auto leading-relaxed">
            Every extract in The Wellness House atelier is rigorously
            standardized, traceable to indigenous regional growers across India,
            and tested for active molecular biomarkers.
          </p>
        </div>
      </section>

      {/* Sourcing Atlas Map Narrative Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFEFA] rounded-3xl p-8 sm:p-12 border border-[#30473B]/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
          <div className="lg:col-span-7 space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">
              The Geographic Atlas
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#252A25] font-normal">
              Where Bio-Actives Flourish: Micro-Climates of India
            </h2>
            <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed">
              Botanical efficacy depends upon terroir: high altitude, diurnal
              temperature shifts, soil mineral density, and clean mountain rain.
              We partner directly with smallholder grower co-operatives from the
              high-altitude cloud forests of Darjeeling to the fertile volcanic
              basalt of the Western Ghats.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="border-l-2 border-[#30473B] pl-3">
                <span className="font-mono text-[10px] text-[#C58B71] uppercase block">
                  Western Ghats
                </span>
                <span className="font-medium text-[#252A25]">
                  Wild Garcinia & Pepper
                </span>
              </div>
              <div className="border-l-2 border-[#30473B] pl-3">
                <span className="font-mono text-[10px] text-[#C58B71] uppercase block">
                  Darjeeling Hills
                </span>
                <span className="font-medium text-[#252A25]">
                  50% EGCG Green Tea
                </span>
              </div>
              <div className="border-l-2 border-[#30473B] pl-3">
                <span className="font-mono text-[10px] text-[#C58B71] uppercase block">
                  Himachal Valleys
                </span>
                <span className="font-medium text-[#252A25]">
                  Chamomile & Fruit Pectin
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <EditorialImage
              src="https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=1200&q=80"
              alt="Misty tea gardens in Darjeeling foothills"
              aspectClassName="aspect-4/3 rounded-2xl overflow-hidden shadow-md"
              caption="High Altitude Cloud Forest · Darjeeling"
            />
          </div>
        </div>
      </section>

      {/* Control Bar: Category Filters & Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-[#FFFEFA] rounded-2xl p-4 sm:p-6 border border-[#30473B]/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            {[
              { id: "all", label: "All Botanicals" },
              { id: "Metabolic & Digestive", label: "Metabolic & Digestive" },
              { id: "Sleep & Nootropic", label: "Sleep & Nootropics" },
              { id: "Botanical Oils & Clays", label: "Oils & Clays" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === tab.id
                    ? "bg-[#30473B] text-[#FAF7F2] shadow-xs"
                    : "bg-[#FAF7F2] text-[#252A25] hover:bg-[#CAD6BC]/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#71776F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by botanical or origin..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#30473B]/10 rounded-lg text-xs text-[#252A25] placeholder:text-[#71776F]/60 focus:outline-hidden focus:border-[#30473B]"
            />
          </div>
        </div>

        {/* Botanical Herbarium Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#FFFEFA] rounded-2xl overflow-hidden border border-[#30473B]/10 shadow-xs flex flex-col justify-between group hover:border-[#30473B]/30 hover:shadow-lg transition-all duration-300"
            >
              <div>
                <div className="aspect-16/10 w-full overflow-hidden">
                  <EditorialImage
                    src={item.imageUrl}
                    alt={item.name}
                    aspectClassName="w-full h-full"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#71776F] font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#30473B]" />
                      <span>{item.origin}</span>
                    </span>
                    <span className="text-[10px] text-[#C58B71] uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-medium text-[#252A25] leading-snug">
                      {item.name}
                    </h3>
                    <p className="font-serif italic text-xs text-[#71776F] mt-0.5">
                      {item.scientificName}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF7F2] rounded-xl text-xs space-y-1 border border-[#30473B]/05">
                    <span className="font-mono text-[10px] uppercase text-[#30473B] font-semibold block">
                      Standardized Biomarker:
                    </span>
                    <span className="text-[#252A25] font-medium">
                      {item.activeConstituents}
                    </span>
                  </div>

                  <p className="text-xs text-[#71776F] leading-relaxed">
                    {item.purpose}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[#30473B]/05 mt-2">
                <span className="text-[10px] font-mono uppercase text-[#71776F] block mb-2">
                  Formulated in Sanctuary Ritual:
                </span>
                <div className="space-y-1">
                  {item.usedInRituals.map((r, rIdx) => (
                    <Link
                      key={rIdx}
                      href={`/rituals/${r.slug}`}
                      className="text-xs font-medium text-[#30473B] hover:underline flex items-center justify-between"
                    >
                      <span>{r.name}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-[#FFFEFA] rounded-2xl border border-[#30473B]/10">
            <p className="text-sm text-[#71776F]">
              No botanicals matched your search terms.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="mt-3 text-xs font-medium text-[#30473B] underline"
            >
              Reset Search & Filters
            </button>
          </div>
        )}
      </section>

      {/* Sourcing Manifesto Footer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#203128] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#CAD6BC]">
            The Botanical Pledge
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-normal max-w-2xl mx-auto">
            Zero Animal Gelatin. Zero Synthetic Caffeine. Zero Concealed
            Additives.
          </h2>
          <p className="text-xs sm:text-sm text-[#CAD6BC]/80 max-w-xl mx-auto leading-relaxed">
            Every raw botanical lot undergoes third-party heavy metal testing,
            microbiological assay, and HPLC fingerprinting before it enters our
            compounding ateliers.
          </p>
        </div>
      </section>
    </div>
  );
}
