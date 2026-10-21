'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { RitualFormulation } from '@/lib/types';
import { EditorialImage } from '@/components/editorial-image';
import { useStore } from '@/context/store-context';
import { money, type SupplyVariant } from '@/lib/commerce';
import { api } from '@/lib/api-client';

interface RitualCardProps {
  ritual: RitualFormulation;
}

export const RitualCard: React.FC<RitualCardProps> = ({ ritual }) => {
  const { addToCart } = useStore();
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    api<SupplyVariant[]>('variants/' + ritual.slug)
      .then((v) => setPrice(v.find((i) => i.supplyCode === 'standard-30')?.priceMinor ?? null))
      .catch(() => {});
  }, [ritual.slug]);

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    const success = await addToCart(ritual, 1);
    setIsAdding(false);
    if (success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const secondaryImage =
    ritual.galleryImages && ritual.galleryImages.length > 1
      ? ritual.galleryImages[1]
      : null;

  return (
    <div className="group relative flex flex-col bg-[#FFFEFA] rounded-2xl overflow-hidden border border-[#30473B]/10 hover:border-[#30473B]/25 hover:shadow-lg transition-all duration-300">
      {/* Visual Showcase */}
      <div className="relative aspect-4/3 w-full bg-[#FAF7F2] overflow-hidden">
        <Link href={`/rituals/${ritual.slug}`} className="block w-full h-full relative">
          {/* Primary Image */}
          <div className="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
            <EditorialImage
              src={
                ritual.imageUrl ||
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
              }
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
                alt={`${ritual.title} detail`}
                fallbackVariant={ritual.artVariant}
                aspectClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </Link>

        {/* Badge Tag */}
        {ritual.badge && (
          <div className="absolute top-3 left-3 bg-[#FFFEFA]/90 backdrop-blur-sm text-[#30473B] text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full border border-[#30473B]/10 shadow-xs z-10">
            {ritual.badge}
          </div>
        )}

        {/* Quick Add to Bag Floating Action Button */}
        <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md transition-all ${
              justAdded
                ? 'bg-[#30473B] text-white'
                : 'bg-[#FFFEFA] hover:bg-[#30473B] text-[#30473B] hover:text-white border border-[#30473B]/15'
            }`}
            aria-label={`Add ${ritual.title} to bag`}
          >
            {isAdding ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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

      {/* Content & Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link href={`/rituals/${ritual.slug}`} className="block group-hover:text-[#30473B] transition-colors">
            <h3 className="font-serif text-lg text-[#252A25] font-normal leading-snug">
              {ritual.title}
            </h3>
          </Link>

          {/* Subtitle / Description */}
          <p className="text-xs text-[#71776F] mt-2 line-clamp-2 leading-relaxed">
            {ritual.subtitle}
          </p>
        </div>

        {/* Pricing & Add to Bag Footer */}
        <div className="pt-4 mt-4 border-t border-[#30473B]/8 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#252A25] tabular-nums">
            {money(price)}
          </span>

          <Link
            href={`/rituals/${ritual.slug}`}
            className="text-xs font-medium text-[#30473B] hover:text-[#203128] transition-colors"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
};
