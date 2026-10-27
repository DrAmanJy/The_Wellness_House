"use client";

import React, { useEffect, useState } from "react";
import { Check, ShoppingBag, CreditCard, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { RitualFormulation } from "@/lib/types";
import { useStore } from "@/context/store-context";
import {
  AnimatedGallery,
  GalleryMediaItem,
  AnimatedSelection,
  AnimatedPrice,
} from "@/components/motion";
import { money, type SupplyVariant } from "@/lib/commerce";
import { getVariants } from "@/lib/variants-client";
import { useCustomer } from "@/context/customer-context";

interface Props {
  ritual: RitualFormulation;
}

export const RitualDetailInteractive: React.FC<Props> = ({ ritual }) => {
  const { beginPurchase } = useCustomer();
  const [variants, setVariants] = useState<SupplyVariant[]>([]);
  useEffect(() => {
    getVariants(ritual.slug)
      .then(setVariants)
      .catch(() => {});
  }, [ritual.slug]);
  const { showToast, addToCart } = useStore();

  const rawImages =
    ritual.galleryImages && ritual.galleryImages.length > 0
      ? ritual.galleryImages
      : [
          ritual.imageUrl ||
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        ];

  const galleryMedia: GalleryMediaItem[] = [
    ...rawImages.map((img, idx) => ({
      type: "image" as const,
      url: img,
      alt: `${ritual.title} - view ${idx + 1}`,
    })),
    {
      type: "video" as const,
      url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-preparing-green-tea-42939-large.mp4",
      posterUrl: rawImages[0],
      title: "Product demonstration",
      alt: `${ritual.title} demonstration`,
    },
  ];

  const [supplyFormat, setSupplyFormat] = useState("standard-30");
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isReserve = supplyFormat === "reserve-60";
  const selectedVariant = variants.find((v) => v.supplyCode === supplyFormat);
  const calculatedPrice = selectedVariant?.priceMinor ?? null;
  const formatPrice = money;

  const supplyOptions = [
    {
      id: "standard-30",
      label: "30-Day Supply",
      subtitle: "Daily supply in recyclable amber glass",
      badge: "Standard",
    },
    {
      id: "reserve-60",
      label: "60-Day Supply",
      subtitle: "Includes brass measuring scoop",
      badge: "Best Value",
    },
  ];

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    const added = await addToCart(ritual, 1, supplyFormat);
    setIsAdding(false);
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2500);
    }
  };

  const handleBuyNow = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      if (!selectedVariant)
        throw new Error(
          "This option is currently unavailable. Please try again.",
        );
      await beginPurchase({
        mode: "buy_now",
        variantId: selectedVariant.id,
        quantity: 1,
      });
    } catch (e) {
      showToast(
        "Unable to continue",
        e instanceof Error ? e.message : "Please try again",
        "error",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link Copied", "Product link copied to clipboard.");
    }
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
      suppressHydrationWarning
    >
      {/* Left Column: Gallery */}
      <div className="lg:col-span-6">
        <AnimatedGallery
          media={galleryMedia}
          fallbackVariant={ritual.artVariant}
          badge={ritual.badge}
          onShare={handleShare}
        />
      </div>

      {/* Right Column: Purchase Details */}
      <div className="lg:col-span-6 space-y-6">
        {/* Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal leading-tight">
            {ritual.title}
          </h1>

          <p className="text-base text-[#71776F] leading-relaxed">
            {ritual.subtitle}
          </p>
        </div>

        {/* Overview */}
        <p className="text-sm text-[#71776F] leading-relaxed border-t border-[#30473B]/10 pt-4">
          {ritual.overview}
        </p>

        {/* Variant Selection */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#30473B] block">
            Select Supply
          </span>
          <AnimatedSelection
            options={supplyOptions}
            selectedId={supplyFormat}
            onSelect={setSupplyFormat}
          />
          <div className="pt-2">
            <AnimatedPrice
              price={formatPrice(calculatedPrice)}
              badge={isReserve ? "60-Day Supply" : "30-Day Supply"}
            />
            <span className="text-xs text-[#71776F] block mt-1.5">
              Taxes included. Free shipping across India.
            </span>
          </div>
        </div>

        {/* Highlights */}
        {ritual.keyPillars && ritual.keyPillars.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-[#30473B]/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {ritual.keyPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-[#252A25]"
                >
                  <div className="w-4 h-4 rounded-full bg-[#30473B]/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#30473B]" />
                  </div>
                  <span>{pillar}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Purchase Actions */}
        <div className="pt-4 border-t border-[#30473B]/10 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* Direct Buy Now */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleBuyNow}
              disabled={isAdding || !selectedVariant}
              className="flex-1 py-4 bg-[#30473B] hover:bg-[#203128] text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>Buy Now · {formatPrice(calculatedPrice)}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </motion.button>

            {/* Add to Bag */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`flex-1 py-4 text-sm font-medium rounded-xl transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                justAdded
                  ? "bg-[#CAD6BC]/30 border-[#30473B] text-[#30473B]"
                  : "bg-[#FFFEFA] hover:bg-[#FAF7F2] border-[#30473B]/25 text-[#30473B]"
              }`}
            >
              {isAdding ? (
                <span className="w-4 h-4 border-2 border-[#30473B] border-t-transparent rounded-full animate-spin" />
              ) : justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
