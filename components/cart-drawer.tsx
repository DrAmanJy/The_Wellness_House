"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "@/context/store-context";
import { EditorialImage } from "@/components/editorial-image";
import { money } from "@/lib/commerce";

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    updateCartQuantity,
    cartCount,
    buyBag,
    showToast,
  } = useStore();

  const [buying, setBuying] = useState(false);
  const subtotal = cartItems.every((i) => i.priceMinor !== null)
    ? cartItems
        .reduce((n, i) => n + BigInt(i.priceMinor!) * BigInt(i.quantity), 0n)
        .toString()
    : null;

  async function proceed() {
    if (buying) return;
    setBuying(true);
    try {
      await buyBag();
    } catch (e) {
      showToast(
        "Unable to continue",
        e instanceof Error ? e.message : "Try again",
        "error",
      );
    } finally {
      setBuying(false);
    }
  }

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-[#252A25]/40 backdrop-blur-xs"
            onClick={() => setIsCartOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              ref={drawerRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-screen max-w-[460px] bg-[#FFFEFA] shadow-2xl flex flex-col border-l border-[#30473B]/8"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-heading"
            >
              {/* ── Header ─────────────────────────────────────── */}
              <div className="px-6 py-5 border-b border-[#30473B]/8 flex items-center justify-between shrink-0">
                <h2
                  id="cart-heading"
                  className="text-[15px] font-medium text-[#252A25] tracking-[-0.01em]"
                >
                  Your Bag
                  {cartCount > 0 && (
                    <span className="text-[#71776F] font-normal ml-1.5">
                      ({cartCount})
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 -mr-1.5 rounded-full text-[#71776F] hover:text-[#252A25] transition-colors"
                  aria-label="Close bag"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ── Item List ──────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-16">
                    <div className="w-16 h-16 rounded-full bg-[#F5F1E8] flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-[#71776F] stroke-[1.5]" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-serif text-xl text-[#252A25]">
                        Your bag is empty
                      </p>
                      <p className="text-sm text-[#71776F] max-w-[260px] leading-relaxed">
                        Discover our wellness products and add something you
                        love.
                      </p>
                    </div>
                    <Link
                      href="/rituals"
                      onClick={() => setIsCartOpen(false)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#30473B] text-white text-sm font-medium rounded-xl hover:bg-[#203128] transition-colors"
                    >
                      <span>Shop Products</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <ul>
                    <AnimatePresence initial={false}>
                      {cartItems.map(
                        ({
                          ritual,
                          quantity,
                          variantId,
                          supplyCode,
                          priceMinor,
                          available,
                        }) => (
                          <motion.li
                            key={variantId}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.22,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="py-5 border-b border-[#30473B]/6 last:border-b-0 overflow-hidden"
                          >
                            <div className="flex gap-4">
                              {/* Thumbnail */}
                              <Link
                                href={`/rituals/${ritual.slug}`}
                                onClick={() => setIsCartOpen(false)}
                                className="w-[88px] h-[88px] rounded-xl overflow-hidden bg-[#F5F1E8] shrink-0 block"
                              >
                                <EditorialImage
                                  src={
                                    ritual.imageUrl ||
                                    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80"
                                  }
                                  alt={ritual.title}
                                  fallbackVariant={ritual.artVariant}
                                  aspectClassName="w-full h-full"
                                  className="w-full h-full object-cover"
                                />
                              </Link>

                              {/* Details */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div className="space-y-0.5">
                                  <Link
                                    href={`/rituals/${ritual.slug}`}
                                    onClick={() => setIsCartOpen(false)}
                                    className="text-sm font-medium text-[#252A25] hover:text-[#30473B] transition-colors line-clamp-2 leading-snug block"
                                  >
                                    {ritual.title}
                                  </Link>
                                  <p className="text-[13px] text-[#71776F]">
                                    {supplyCode === "reserve-60"
                                      ? "60-day supply"
                                      : "30-day supply"}
                                    {!available && (
                                      <span className="text-[#C58B71] ml-1">
                                        · Unavailable
                                      </span>
                                    )}
                                  </p>
                                </div>

                                <div className="flex items-end justify-between mt-3">
                                  {/* Quantity controls */}
                                  <div className="inline-flex items-center border border-[#30473B]/12 rounded-lg overflow-hidden bg-[#F5F1E8]/60">
                                    <button
                                      onClick={() =>
                                        updateCartQuantity(
                                          variantId,
                                          quantity - 1,
                                        )
                                      }
                                      className="w-8 h-8 flex items-center justify-center hover:bg-[#30473B]/6 text-[#30473B] transition-colors"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-[#252A25] tabular-nums">
                                      {quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateCartQuantity(
                                          variantId,
                                          quantity + 1,
                                        )
                                      }
                                      className="w-8 h-8 flex items-center justify-center hover:bg-[#30473B]/6 text-[#30473B] transition-colors"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Price + Remove */}
                                  <div className="text-right space-y-1">
                                    <span className="text-sm font-semibold text-[#252A25] tabular-nums block">
                                      {money(
                                        priceMinor === null
                                          ? null
                                          : (
                                              BigInt(priceMinor) *
                                              BigInt(quantity)
                                            ).toString(),
                                      )}
                                    </span>
                                    <button
                                      onClick={() => removeFromCart(variantId)}
                                      className="text-xs text-[#71776F] hover:text-[#C58B71] transition-colors underline underline-offset-2"
                                      aria-label={`Remove ${ritual.title} from bag`}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        ),
                      )}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              {/* ── Footer / Checkout ──────────────────────────── */}
              {cartItems.length > 0 && (
                <div className="shrink-0 border-t border-[#30473B]/8 bg-[#FFFEFA] p-6 space-y-4">
                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#252A25]">Subtotal</span>
                      <span className="text-base font-semibold text-[#252A25] tabular-nums">
                        {money(subtotal)}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#71776F]">
                      Shipping calculated at checkout
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5">
                    <button
                      disabled={buying}
                      onClick={proceed}
                      className="w-full py-3.5 bg-[#30473B] hover:bg-[#203128] text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <span>{buying ? "Please wait…" : "Checkout"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-3 text-sm font-medium text-[#30473B] hover:text-[#203128] transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
