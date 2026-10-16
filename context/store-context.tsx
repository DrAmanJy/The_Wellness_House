'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { RitualFormulation, ConsultationBooking } from '@/lib/types';
import { RITUAL_FORMULATIONS } from '@/lib/rituals-data';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error';
}

export interface CartItem {
  ritual: RitualFormulation;
  quantity: number;
}

interface StoreContextType {
  rituals: RitualFormulation[];
  savedRitualSlugs: string[];
  isSearchOpen: boolean;
  toasts: ToastMessage[];
  consultationBookings: ConsultationBooking[];
  cartItems: CartItem[];
  isCartOpen: boolean;
  cartCount: number;
  isHydrated: boolean;
  
  // Actions
  setIsSearchOpen: (open: boolean) => void;
  setIsCartOpen: (open: boolean) => void;
  toggleSaveRitual: (slug: string) => void;
  isRitualSaved: (slug: string) => boolean;
  addConsultationBooking: (booking: ConsultationBooking) => void;
  addToCart: (ritual: RitualFormulation, quantity?: number) => void;
  removeFromCart: (slug: string) => void;
  updateCartQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [rituals] = useState<RitualFormulation[]>(RITUAL_FORMULATIONS);
  const [savedRitualSlugs, setSavedRitualSlugs] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [consultationBookings, setConsultationBookings] = useState<ConsultationBooking[]>([]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCountRef = useRef(0);

  // Hydrate from localStorage once mounted on client
  useEffect(() => {
    try {
      const sRituals = localStorage.getItem('twh_saved_rituals');
      if (sRituals) setSavedRitualSlugs(JSON.parse(sRituals));

      const sCart = localStorage.getItem('twh_cart_items');
      if (sCart) setCartItems(JSON.parse(sCart));

      const sBookings = localStorage.getItem('twh_consultations');
      if (sBookings) setConsultationBookings(JSON.parse(sBookings));
    } catch {
      // Ignore
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('twh_saved_rituals', JSON.stringify(savedRitualSlugs));
    } catch {
      // Ignore
    }
  }, [savedRitualSlugs, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('twh_cart_items', JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('twh_consultations', JSON.stringify(consultationBookings));
    } catch {
      // Ignore
    }
  }, [consultationBookings, isHydrated]);

  const showToast = (title: string, description?: string, type: 'success' | 'info' | 'error' = 'success') => {
    toastCountRef.current += 1;
    const id = `toast-${toastCountRef.current}`;
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleSaveRitual = (slug: string) => {
    const item = rituals.find(r => r.slug === slug);
    setSavedRitualSlugs(prev => {
      const exists = prev.includes(slug);
      if (exists) {
        showToast('Ritual Removed', item?.title, 'info');
        return prev.filter(s => s !== slug);
      } else {
        showToast('Ritual Saved to Sanctuary Log', item?.title, 'success');
        return [...prev, slug];
      }
    });
  };

  const isRitualSaved = (slug: string) => savedRitualSlugs.includes(slug);

  const addToCart = (ritual: RitualFormulation, quantity: number = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.ritual.slug === ritual.slug);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      } else {
        return [...prev, { ritual, quantity }];
      }
    });
    showToast('Added to Botanical Bag', ritual.title, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (slug: string) => {
    setCartItems(prev => prev.filter(item => item.ritual.slug !== slug));
    showToast('Removed from Bag', undefined, 'info');
  };

  const updateCartQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(slug);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.ritual.slug === slug ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const addConsultationBooking = (booking: ConsultationBooking) => {
    setConsultationBookings(prev => [booking, ...prev]);
    showToast('Consultation Request Dispatched', `Our atelier team has reserved your time on ${booking.preferredDate}.`);
  };

  return (
    <StoreContext.Provider
      value={{
        rituals,
        savedRitualSlugs,
        isSearchOpen,
        toasts,
        consultationBookings,
        cartItems,
        isCartOpen,
        cartCount,
        isHydrated,
        setIsSearchOpen,
        setIsCartOpen,
        toggleSaveRitual,
        isRitualSaved,
        addConsultationBooking,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        showToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
