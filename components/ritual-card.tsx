'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, ShoppingBag, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RitualFormulation } from '@/lib/types';
import { EditorialImage } from '@/components/editorial-image';
import { useStore } from '@/context/store-context';

interface RitualCardProps {
  ritual: RitualFormulation;
}

export const RitualCard: React.FC<RitualCardProps> = ({ ritual }) => {
  const { addToCart } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    setTimeout(() => {
      addToCart(ritual, 1);
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }, 280);
  };

  const secondaryImage = ritual.galleryImages && ritual.galleryImages.length > 1
    ? ritual.galleryImages[1]
    : null;

  return (
    <div className="group relative flex flex-col bg-[#FFFEFA] rounded-2xl overflow-hidden border border-[#30473B]/10 hover:border-[#30473B]/30 hover:shadow-xl transition-all duration-300">
      
      {/* Visual Showcase with High-Res Photography & Smooth Hover */}
      <div className="relative aspect-4/3 w-full bg-[#FAF7F2] overflow-hidden">
        <Link href={`/rituals/${ritual.slug}`} className="block w-full h-full relative">
          {/* Primary Image */}
          <div className="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]">
            <EditorialImage
              src={ritual.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'}
              alt={ritual.title}
              fallbackVariant={ritual.artVariant}
              aspectClassName="w-full h-full"
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                secondaryImage ? 'group-hover:opacity-0' : ''
              }`}
            />
          </div>

          {/* Secondary Image Crossfade on Hover */}
          {secondaryImage && (
            <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none">
              <EditorialImage
                src={secondaryImage}
                alt={`${ritual.title} - botanical texture`}
                fallbackVariant={ritual.artVariant}
                aspectClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </Link>

        {/* Quiet Kicker Tag */}
        {ritual.badge && (
          <div className="absolute top-3 left-3 bg-[#FFFEFA]/92 backdrop-blur-xs text-[#30473B] text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-sm border border-[#30473B]/10 shadow-xs z-10">
            {ritual.badge}
          </div>
        )}


        {/* Quick Add to Bag Floating Action Button */}
        <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-xs shadow-md transition-all ${
              justAdded
                ? 'bg-[#30473B] text-white'
                : 'bg-[#FFFEFA]/95 hover:bg-[#30473B] text-[#30473B] hover:text-[#FAF7F2] border border-[#30473B]/20'
            }`}
            aria-label={`Add ${ritual.title} to Botanical Bag`}
          >
            {isAdding ? (
              <span className="w-3.5 h-3.5 border-2 border-[#30473B] border-t-transparent rounded-full animate-spin" />
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Content & Narrative */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Circadian Timing Strip */}
          <div className="flex items-center gap-1.5 text-xs text-[#30473B] font-mono mb-2">
            <Clock className="w-3.5 h-3.5 text-[#30473B]" />
            <span>{ritual.circadianTime}</span>
          </div>

          {/* Title */}
          <Link href={`/rituals/${ritual.slug}`} className="block group-hover:text-[#30473B] transition-colors">
            <h3 className="font-serif text-xl text-[#252A25] font-normal leading-snug">
              {ritual.title}
            </h3>
          </Link>

          {/* Subtitle */}
          <p className="text-xs text-[#71776F] mt-2 line-clamp-2 leading-relaxed">
            {ritual.subtitle}
          </p>

          {/* Sensory Note */}
          <div className="mt-4 pt-3 border-t border-[#30473B]/05 text-[11px] text-[#71776F]">
            <span className="font-mono uppercase text-[#30473B] text-[10px] block">Aromatic Profile:</span>
            <span className="italic font-serif text-[#252A25]">{ritual.sensoryProfile.aroma}</span>
          </div>
        </div>

        {/* Action Link */}
        <div className="pt-4 border-t border-[#30473B]/10 flex items-center justify-between">
          <span className="text-[11px] text-[#71776F] font-mono">{ritual.duration}</span>

          <Link
            href={`/rituals/${ritual.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#30473B] hover:text-[#203128] group-hover:underline"
          >
            <span>Explore Formulation</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>

    </div>
  );
};
