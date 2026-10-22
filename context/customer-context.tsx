"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MotionConfig } from "motion/react";
import { api } from "@/lib/api-client";
import { LoginPanel } from "@/components/customer/login-panel";
export interface Customer {
  userId: string;
  name: string;
  email: string | null;
  roles: string[];
  identities: { provider: string }[];
}
interface State {
  customer: Customer | null;
  status: "loading" | "authenticated" | "anonymous";
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  beginPurchase: (
    input:
      | { mode: "buy_now"; variantId: string; quantity: number }
      | { mode: "cart"; cartVersion: number },
  ) => Promise<void>;
  preferences: any;
}
const Context = createContext<State | null>(null);
export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null),
    [status, setStatus] = useState<State["status"]>("loading"),
    [login, setLogin] = useState<string | null>(null),
    [preferences, setPreferences] = useState<any>(null);
  const epoch = useRef(0);
  const resolved = useRef(false);
  const identity = useRef<string | null>(null);
  const channel = useRef<BroadcastChannel | null>(null);
  async function refresh() {
    const run = ++epoch.current;
    if (!resolved.current) setStatus("loading");
    try {
      const user = await api<Customer | null>("me");
      if (epoch.current !== run) return;
      resolved.current = true;
      if (identity.current !== (user?.userId || null)) {
        identity.current = user?.userId || null;
        channel.current?.postMessage("changed");
      }
      setCustomer(user);
      setStatus(user ? "authenticated" : "anonymous");
      if (user) {
        const prefs = await api("me/preferences").catch(() => null);
        if (epoch.current === run) setPreferences(prefs);
      } else setPreferences(null);
    } catch {
      if (epoch.current === run) {
        resolved.current = true;
        setCustomer(null);
        setPreferences(null);
        setStatus("anonymous");
      }
    }
  }
  useEffect(() => {
    try {
      for (const key of [
        "twh_local_cart",
        "twh_cart_items",
        "twh_consultations",
        "twh_saved_rituals",
      ])
        localStorage.removeItem(key);
    } catch {}
    void refresh();
    try {
      channel.current = new BroadcastChannel("twh-account");
      channel.current.onmessage = () => {
        setCustomer(null);
        setPreferences(null);
        void refresh();
      };
    } catch {}
    const expired = () => {
      epoch.current++;
      setCustomer(null);
      setPreferences(null);
      setStatus("anonymous");
    };
    window.addEventListener("twh-session-expired", expired);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("twh-session-expired", expired);
      channel.current?.close();
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  async function signOut() {
    await api("logout", "POST");
    epoch.current++;
    setCustomer(null);
    setPreferences(null);
    setStatus("anonymous");
    channel.current?.postMessage("changed");
    window.location.assign("/account");
  }
  async function beginPurchase(input: Parameters<State["beginPurchase"]>[0]) {
    const result = await api("purchase-intents", "POST", input);
    if (result.requiresAuth) setLogin(result.intentId);
    else window.location.assign(result.url);
  }
  return (
    <Context.Provider
      value={{ customer, status, refresh, signOut, beginPurchase, preferences }}
    >
      <MotionConfig
        reducedMotion={preferences?.reduced_motion ? "always" : "user"}
      >
        {children}
        {login && <LoginDialog intent={login} close={() => setLogin(null)} />}
      </MotionConfig>
    </Context.Provider>
  );
}
function LoginDialog({ intent, close }: { intent: string; close: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    box.current?.querySelector<HTMLElement>("button,a")?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = box.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),a[href],input",
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", onKey);
      prior?.focus();
    };
  }, [close]);
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-login-title"
        className="bg-[#FFFEFA] rounded-3xl p-7 max-w-md w-full shadow-xl"
      >
        <div className="flex justify-between gap-5 mb-4">
          <h2 id="purchase-login-title" className="font-serif text-3xl">
            Sign in to continue
          </h2>
          <button
            aria-label="Close sign-in"
            onClick={close}
            className="text-2xl"
          >
            ×
          </button>
        </div>
        <LoginPanel intent={intent} />
      </div>
    </div>
  );
}
export function useCustomer() {
  const c = useContext(Context);
  if (!c) throw new Error("CustomerProvider required");
  return c;
}
