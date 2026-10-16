'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Clock, Heart, Check, ArrowRight, Share2, Printer, 
  Sparkles, CheckCircle2, ChevronRight, ShoppingBag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RitualFormulation } from '@/lib/types';
import { useStore } from '@/context/store-context';
import { AnimatedGallery, GalleryMediaItem, AnimatedSelection, AnimatedPrice } from '@/components/motion';

interface Props {
  ritual: RitualFormulation;
}

export const RitualDetailInteractive: React.FC<Props> = ({ ritual }) => {
  const { toggleSaveRitual, isRitualSaved, showToast, addToCart } = useStore();
  const saved = isRitualSaved(ritual.slug);

  // Gallery media with high-res photography and demonstration video
  const rawImages = ritual.galleryImages && ritual.galleryImages.length > 0 
    ? ritual.galleryImages 
    : [ritual.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'];

  const galleryMedia: GalleryMediaItem[] = [
    ...rawImages.map((img, idx) => ({
      type: 'image' as const,
      url: img,
      alt: `${ritual.title} perspective ${idx + 1}`,
    })),
    // Product demonstration video
    {
      type: 'video' as const,
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-preparing-green-tea-42939-large.mp4',
      posterUrl: rawImages[0],
      title: 'Botanical Compounding Demonstration',
      alt: `${ritual.title} formulation demonstration`,
    },
  ];

  const [supplyFormat, setSupplyFormat] = useState('standard-30');
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const supplyOptions = [
    {
      id: 'standard-30',
      label: 'Standard 30-Day Protocol',
      subtitle: 'Complete diurnal supply & amber jar',
      badge: 'Popular',
    },
    {
      id: 'reserve-60',
      label: 'Reserve 60-Day Supply',
      subtitle: 'Includes brass measuring scoop & linen journal',
      badge: 'Curated',
    },
  ];

  const currentPrice = supplyFormat === 'reserve-60' ? 'Reserve Protocol · 60 Days' : 'Signature Protocol · 30 Days';

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addToCart(ritual, supplyFormat === 'reserve-60' ? 2 : 1);
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2500);
    }, 280);
  };


  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Dossier Link Copied', 'Share this botanical protocol with a friend or practitioner.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      {/* Left Column: Unified Gallery & Video Player */}
      <div className="lg:col-span-6 space-y-4">
        <AnimatedGallery
          media={galleryMedia}
          fallbackVariant={ritual.artVariant}
          badge={ritual.badge}
          onShare={handleShare}
          onToggleSave={() => toggleSaveRitual(ritual.slug)}
          isSaved={saved}
        />

        {/* Sensory Profile Strip */}
        <div className="p-5 bg-[#FFFEFA] rounded-2xl border border-[#30473B]/10 grid grid-cols-3 gap-3 text-xs shadow-xs">
          <div>
            <span className="font-mono text-[10px] uppercase text-[#C58B71] block">Olfactory Note</span>
            <span className="font-serif italic text-[#252A25] block mt-0.5">{ritual.sensoryProfile.aroma}</span>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-[#C58B71] block">Texture</span>
            <span className="font-serif italic text-[#252A25] block mt-0.5">{ritual.sensoryProfile.texture}</span>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-[#C58B71] block">Circadian Window</span>
            <span className="font-serif italic text-[#252A25] block mt-0.5">{ritual.circadianTime}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Narrative & Interactive Step-by-Step Protocol */}
      <div className="lg:col-span-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#30473B]">
            <Clock className="w-3.5 h-3.5" />
            <span>{ritual.circadianTime}</span>
            <span>·</span>
            <span>{ritual.duration}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal leading-tight">
            {ritual.title}
          </h1>

          <p className="text-base text-[#71776F] leading-relaxed pt-1">
            {ritual.subtitle}
          </p>
        </div>

        <p className="text-sm text-[#71776F] leading-relaxed border-t border-[#30473B]/10 pt-4">
          {ritual.overview}
        </p>

        {/* Rich Supply / Variant Selection */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#30473B] block">
            Select Protocol Allocation:
          </span>
          <AnimatedSelection
            options={supplyOptions}
            selectedId={supplyFormat}
            onSelect={setSupplyFormat}
          />
          <AnimatedPrice
            price={currentPrice}
            badge={supplyFormat === 'reserve-60' ? 'Complimentary Scoop' : 'Standard'}
            className="pt-1"
          />
        </div>

        {/* Formulation Highlights */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#30473B] block">Core Formulation Standards:</span>
          <div className="space-y-2">
            {ritual.keyPillars.map((pillar, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#252A25]">
                <div className="w-4 h-4 rounded-full bg-[#CAD6BC]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#30473B]" />
                </div>
                <span>{pillar}</span>
              </div>
            ))}
          </div>
        </div>


        {/* Primary E-Commerce & Atelier Purchase Controls */}
        <div className="pt-4 border-t border-[#30473B]/10 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Add to Bag Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`flex-1 py-4 text-xs font-medium uppercase tracking-widest rounded-xl transition-all text-center shadow-md flex items-center justify-center gap-2 ${
                justAdded
                  ? 'bg-[#203128] text-white'
                  : 'bg-[#30473B] hover:bg-[#203128] text-[#FAF7F2]'
              }`}
            >
              {isAdding ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Botanical Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Formulation to Bag</span>
                </>
              )}
            </motion.button>

            {/* Print Dossier */}
            <button
              onClick={handlePrint}
              className="px-5 py-4 bg-transparent border border-[#30473B]/20 text-[#30473B] text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-[#FAF7F2] transition-all flex items-center justify-center gap-2 shrink-0"
              title="Print Protocol Dossier"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Dossier</span>
            </button>
          </div>

          {/* Secondary Atelier Consultation Link */}
          <Link
            href={`/consultation?ritual=${ritual.slug}`}
            className="w-full py-3 bg-[#FAF7F2] hover:bg-[#CAD6BC]/20 text-[#30473B] border border-[#30473B]/15 text-xs font-medium uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 text-center"
          >
            <span>Or Book 1-on-1 Atelier Formulation Consultation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};
