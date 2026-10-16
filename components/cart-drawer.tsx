'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Clock, 
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useStore } from '@/context/store-context';
import { EditorialImage } from '@/components/editorial-image';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cartItems, 
    removeFromCart, 
    updateCartQuantity, 
    cartCount 
  } = useStore();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-[#252A25]/50 backdrop-blur-xs"
            onClick={() => setIsCartOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-screen max-w-md bg-[#FFFEFA] shadow-2xl flex flex-col justify-between border-l border-[#30473B]/10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-heading"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#30473B]/10 flex items-center justify-between bg-[#FAF7F2]">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-[#30473B]" />
                  <h2 id="cart-heading" className="font-serif text-lg font-normal text-[#252A25]">
                    Botanical Bag
                  </h2>
                  <span className="font-mono text-xs bg-[#CAD6BC]/40 text-[#30473B] px-2 py-0.5 rounded-full font-medium">
                    {cartCount}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full text-[#71776F] hover:text-[#252A25] hover:bg-[#30473B]/5 transition-colors"
                  aria-label="Close Botanical Bag"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body / Item List */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                    <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#30473B]/10 flex items-center justify-center text-[#71776F]">
                      <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-serif text-lg text-[#252A25]">Your bag is currently empty</p>
                      <p className="text-xs text-[#71776F] max-w-xs leading-relaxed">
                        Discover our circadian formulations, botanical teas, and artisan-cured body treatments.
                      </p>
                    </div>
                    <Link
                      href="/rituals"
                      onClick={() => setIsCartOpen(false)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#30473B] text-[#FAF7F2] text-xs uppercase tracking-wider rounded-lg hover:bg-[#203128] transition-colors mt-2"
                    >
                      <span>Explore Formulations</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#30473B]/10">
                    <AnimatePresence initial={false}>
                      {cartItems.map(({ ritual, quantity }) => (
                        <motion.li
                          key={ritual.slug}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="py-5 first:pt-0 last:pb-0 overflow-hidden"
                        >
                          <div className="flex items-start gap-4">
                            {/* Thumbnail */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#30473B]/10 shrink-0 relative">
                              <EditorialImage
                                src={ritual.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'}
                                alt={ritual.title}
                                fallbackVariant={ritual.artVariant}
                                aspectClassName="w-full h-full"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <Link
                                  href={`/rituals/${ritual.slug}`}
                                  onClick={() => setIsCartOpen(false)}
                                  className="font-serif text-sm text-[#252A25] hover:text-[#30473B] transition-colors line-clamp-1 font-medium"
                                >
                                  {ritual.title}
                                </Link>
                                <button
                                  onClick={() => removeFromCart(ritual.slug)}
                                  className="text-[#71776F] hover:text-[#C58B71] transition-colors p-1"
                                  title="Remove item"
                                  aria-label={`Remove ${ritual.title} from bag`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-[#71776F] font-mono">
                                <Clock className="w-3 h-3 text-[#30473B]" />
                                <span>{ritual.circadianTime}</span>
                              </div>

                              <p className="text-[11px] text-[#71776F] italic line-clamp-1">
                                {ritual.subtitle}
                              </p>

                              {/* Quantity controls */}
                              <div className="pt-2 flex items-center justify-between">
                                <div className="inline-flex items-center border border-[#30473B]/15 rounded-md bg-[#FAF7F2] overflow-hidden">
                                  <button
                                    onClick={() => updateCartQuantity(ritual.slug, quantity - 1)}
                                    className="p-1 hover:bg-[#30473B]/10 text-[#30473B] transition-colors"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2.5 text-xs font-mono font-medium text-[#252A25]">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => updateCartQuantity(ritual.slug, quantity + 1)}
                                    className="p-1 hover:bg-[#30473B]/10 text-[#30473B] transition-colors"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <span className="text-[11px] font-mono text-[#30473B] uppercase tracking-wider">
                                  {ritual.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              {/* Footer / Checkout Actions */}
              {cartItems.length > 0 && (
                <div className="p-6 bg-[#FAF7F2] border-t border-[#30473B]/10 space-y-4">
                  {/* Complimentary Perks Banner */}
                  <div className="space-y-1.5 text-[11px] text-[#71776F]">
                    <div className="flex items-center gap-1.5 text-[#30473B]">
                      <Check className="w-3.5 h-3.5" />
                      <span className="font-medium">Complimentary Cold-Chain Terroir Shipping</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#30473B]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Includes Hand-bound Circadian Habit Journal</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <Link
                      href="/consultation"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-3.5 bg-[#30473B] hover:bg-[#203128] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Proceed to Atelier Reservation</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-2.5 bg-transparent border border-[#30473B]/15 text-[#30473B] text-xs font-medium uppercase tracking-wider rounded-lg hover:bg-[#FFFEFA] transition-colors"
                    >
                      Continue Exploring
                    </button>
                  </div>

                  <div className="text-center text-[10px] text-[#71776F] font-mono uppercase tracking-wider flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#30473B]" />
                    <span>FSSAI Compliant · ISO 9001 Batch Tested</span>
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
