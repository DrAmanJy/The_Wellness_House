"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { RitualFormulation, ConsultationBooking } from "@/lib/types";
import { api } from "@/lib/api-client";
import { useCustomer } from "./customer-context";
import type { SupplyVariant } from "@/lib/commerce";
interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "info" | "error";
}
export interface CartItem {
  variantId: string;
  variantTitle: string;
  supplyCode: string;
  priceMinor: string | null;
  currency: string;
  available: boolean;
  ritual: RitualFormulation;
  quantity: number;
}
interface CartSnapshot {
  id: string;
  version: number;
  items: CartItem[];
}
interface Store {
  rituals: RitualFormulation[];
  siteConfig: any;
  savedRitualSlugs: string[];
  isSearchOpen: boolean;
  isCartOpen: boolean;
  toasts: ToastMessage[];
  consultationBookings: ConsultationBooking[];
  cartItems: CartItem[];
  cartCount: number;
  cartVersion: number;
  isHydrated: boolean;
  setIsSearchOpen: (v: boolean) => void;
  setIsCartOpen: (v: boolean) => void;
  toggleSaveRitual: (slug: string) => void;
  isRitualSaved: (slug: string) => boolean;
  addConsultationBooking: (b: ConsultationBooking) => void;
  addToCart: (
    r: RitualFormulation,
    q?: number,
    supplyCode?: string,
  ) => Promise<boolean>;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, q: number) => void;
  clearCart: () => void;
  showToast: (t: string, d?: string, type?: ToastMessage["type"]) => void;
  removeToast: (id: string) => void;
  flushCart: () => Promise<void>;
  buyBag: () => Promise<void>;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({
  children,
  initialRituals,
  siteConfig,
}: {
  children: React.ReactNode;
  initialRituals: RitualFormulation[];
  siteConfig: any;
}) {
  const { status, customer, beginPurchase } = useCustomer();
  const [savedRitualSlugs, setSaved] = useState<string[]>([]),
    [isSearchOpen, setIsSearchOpen] = useState(false),
    [isCartOpen, setIsCartOpen] = useState(false),
    [toasts, setToasts] = useState<ToastMessage[]>([]),
    [consultationBookings, setBookings] = useState<ConsultationBooking[]>([]),
    [state, setState] = useState<CartSnapshot>({
      id: "",
      version: 0,
      items: [],
    }),
    [isHydrated, setHydrated] = useState(false);
  const current = useRef(state),
    queue = useRef<Promise<void>>(Promise.resolve()),
    epoch = useRef(0),
    toastCount = useRef(0);
  function accept(s: CartSnapshot) {
    current.current = s;
    setState(s);
  }
  const showToast = useCallback(function showToast(
    title: string,
    description?: string,
    type: ToastMessage["type"] = "success",
  ) {
    const id = "toast-" + ++toastCount.current;
    setToasts((t) => [...t, { id, title, description, type }]);
    setTimeout(() => setToasts((t) => t.filter((v) => v.id !== id)), 4000);
  }, []);
  const report = useCallback(
    (e: unknown) =>
      showToast(
        "Unable to save",
        e instanceof Error ? e.message : "Try again",
        "error",
      ),
    [showToast],
  );
  useEffect(() => {
    const generation = ++epoch.current;
    accept({ id: "", version: 0, items: [] });
    setSaved([]);
    setBookings([]);
    setIsCartOpen(false);
    setHydrated(false);
    if (status === "loading") return;
    Promise.all([
      api<CartSnapshot>("cart").then((v) => {
        if (epoch.current === generation) accept(v);
      }),
      api<string[]>("saved-rituals").then((v) => {
        if (epoch.current === generation) setSaved(v);
      }),
    ])
      .catch(report)
      .finally(() => {
        if (epoch.current === generation) setHydrated(true);
      });
  }, [status, customer?.userId, report]);
  function mutate(fn: () => Promise<CartSnapshot>): Promise<boolean> {
    const generation = epoch.current;
    let success = false;
    const pending = queue.current
      .then(async () => {
        if (generation !== epoch.current)
          throw new Error("Your session changed. Please try again");
        const next = await fn();
        if (generation !== epoch.current) return;
        accept(next);
        success = true;
      })
      .catch(async (e) => {
        report(e);
        try {
          const fresh = await api<CartSnapshot>("cart");
          if (generation === epoch.current) accept(fresh);
        } catch {}
      });
    queue.current = pending;
    return pending.then(() => success);
  }
  async function addToCart(
    ritual: RitualFormulation,
    quantity = 1,
    supplyCode = "standard-30",
  ) {
    const operationId = crypto.randomUUID();
    const sourceCartId = current.current.id;
    const success = await mutate(async () => {
      const variants = await api<SupplyVariant[]>("variants/" + ritual.slug);
      const variant = variants.find((v) => v.supplyCode === supplyCode);
      if (!variant) throw new Error("This supply is unavailable");
      if (!sourceCartId)
        throw new Error("Your bag is still loading. Try again in a moment.");
      return api("cart/items/" + variant.id, "POST", {
        quantity,
        operationId,
        cartId: sourceCartId,
      });
    });
    if (success) {
      setIsCartOpen(true);
      showToast("Added to Botanical Bag", ritual.title);
    }
    return success;
  }
  const removeFromCart = (variantId: string) => {
    void mutate(() =>
      api("cart/items/" + variantId, "DELETE", {
        quantity: 0,
        cartId: current.current.id,
        expectedVersion: current.current.version,
        operationId: crypto.randomUUID(),
      }),
    );
  };
  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(variantId);
    void mutate(() =>
      api("cart/items/" + variantId, "PUT", {
        quantity,
        cartId: current.current.id,
        expectedVersion: current.current.version,
        operationId: crypto.randomUUID(),
      }),
    );
  };
  const clearCart = () => {
    void mutate(() =>
      api("cart", "DELETE", { expectedVersion: current.current.version,cartId:current.current.id }),
    );
  };
  const flushCart = useCallback(() => queue.current, []);
  async function buyBag() {
    await queue.current;
    const fresh = await api<CartSnapshot>("cart");
    accept(fresh);
    if (!fresh.items.length) throw new Error("Your bag is empty");
    await beginPurchase({ mode: "cart", cartVersion: fresh.version });
    setIsCartOpen(false);
  }
  async function toggleSaveRitual(slug: string) {
    try {
      const exists = savedRitualSlugs.includes(slug);
      await api("saved-rituals", exists ? "DELETE" : "POST", { slug });
      setSaved((v) => (exists ? v.filter((s) => s !== slug) : [...v, slug]));
      showToast(exists ? "Ritual removed" : "Ritual saved");
    } catch (e) {
      report(e);
    }
  }
  return (
    <Context.Provider
      value={{
        rituals: initialRituals,
        siteConfig,
        savedRitualSlugs,
        isSearchOpen,
        isCartOpen,
        toasts,
        consultationBookings,
        cartItems: state.items,
        cartCount: state.items.reduce((n, i) => n + i.quantity, 0),
        cartVersion: state.version,
        isHydrated,
        setIsSearchOpen,
        setIsCartOpen,
        toggleSaveRitual,
        isRitualSaved: (slug) => savedRitualSlugs.includes(slug),
        addConsultationBooking: (b) => {
          setBookings((v) => [b, ...v]);
          showToast("Request received", "Our team will confirm availability.");
        },
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        showToast,
        removeToast: (id) => setToasts((v) => v.filter((t) => t.id !== id)),
        flushCart,
        buyBag,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("StoreProvider required");
  return value;
}
