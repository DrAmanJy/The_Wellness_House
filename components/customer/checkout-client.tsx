"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCustomer } from "@/context/customer-context";
import { useStore } from "@/context/store-context";
import { api } from "@/lib/api-client";
import { money } from "@/lib/commerce";
import { LoginPanel } from "./login-panel";
import { AddressForm, emptyAddress } from "./address-form";
import { loadRazorpay, openRazorpay } from "@/lib/razorpay-checkout";

interface CheckoutClientProps {
  sessionId?: string;
}

export function CheckoutClient({ sessionId }: CheckoutClientProps) {
  const { customer, status, beginPurchase } = useCustomer();
  const { cartItems, cartVersion, isHydrated, flushCart, rituals } = useStore();

  const [checkout, setCheckout] = useState<any>(null);
  const [addresses, setAddresses] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [quoteError, setQuoteError] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [paymentPhase, setPaymentPhase] = useState<
    "idle" | "preparing" | "processing" | "confirming" | "failed" | "expired"
  >("idle");
  const [confirmationSlow, setConfirmationSlow] = useState(false);
  const [paymentRetryAllowed, setPaymentRetryAllowed] = useState(false);
  const paymentLock = useRef(false);

  // Address selection state
  const [selection, setSelection] = useState<string>("");
  const [sameBilling, setSameBilling] = useState<boolean>(true);
  const [billing, setBilling] = useState<any>(null);

  const billingRef = useRef(billing);
  billingRef.current = billing;
  const sameBillingRef = useRef(sameBilling);
  sameBillingRef.current = sameBilling;
  const loadedSessionId = useRef<string>("");

  // Modal / Management state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [addressModalView, setAddressModalView] = useState<
    "list" | "add" | "edit"
  >("list");
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [saveAddressToAccount, setSaveAddressToAccount] =
    useState<boolean>(true);
  const [makeDefaultAddress, setMakeDefaultAddress] = useState<boolean>(false);

  const initialized = useRef(false);
  const orderKey = useRef("");
  const started = useRef(false);
  const requestEpoch = useRef(0);

  // Helper to fallback ritual image
  const getRitualImage = (item: any) => {
    if (item.image_url) return item.image_url;
    const match = rituals.find(
      (r) =>
        r.slug === item.slug ||
        r.title.toLowerCase() === (item.title || "").toLowerCase() ||
        (item.title || "").toLowerCase().includes(r.title.toLowerCase()),
    );
    return match?.imageUrl || null;
  };

  // Helper to compute local subtotal when quote is pending
  const getLocalSubtotal = () => {
    if (!checkout?.items) return null;
    try {
      const total = checkout.items.reduce((acc: bigint, item: any) => {
        if (!item.price_minor) return acc;
        return acc + BigInt(item.price_minor) * BigInt(item.quantity || 1);
      }, 0n);
      return total.toString();
    } catch {
      return null;
    }
  };

  // Centralized Quote & Address Updater
  const applyAddressAndQuote = useCallback(
    async (
      targetAddressId?: string,
      customShipping?: any,
      customBilling?: any,
      currentVersion?: number,
    ) => {
      if (!sessionId) return;
      const epoch = ++requestEpoch.current;
      setIsCalculating(true);
      setQuoteError("");
      setError("");

      try {
        // 1. Fetch current session if version not passed
        const sessionToUpdate =
          currentVersion !== undefined
            ? { version: currentVersion }
            : await api<any>("checkout-sessions/" + sessionId);

        if (epoch !== requestEpoch.current) return;

        // 2. PATCH checkout session with address
        const effectiveBilling = sameBillingRef.current
          ? undefined
          : customBilling || billingRef.current;

        await api("checkout-sessions/" + sessionId, "PATCH", {
          version: sessionToUpdate.version,
          addressId: targetAddressId,
          shipping: targetAddressId ? undefined : customShipping,
          billing: effectiveBilling,
        });

        if (epoch !== requestEpoch.current) return;

        // 3. Immediately request server-authoritative quote
        await api("checkout-sessions/" + sessionId + "/quote", "POST");

        if (epoch !== requestEpoch.current) return;

        // 4. Fetch updated session state
        const refreshedSession = await api<any>(
          "checkout-sessions/" + sessionId,
        );

        if (epoch !== requestEpoch.current) return;
        setCheckout(refreshedSession);
      } catch (err: any) {
        if (epoch !== requestEpoch.current) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Unable to calculate order quote";
        setQuoteError(msg);
        // Reload session to keep version in sync
        try {
          const syncSession = await api<any>("checkout-sessions/" + sessionId);
          if (epoch === requestEpoch.current) setCheckout(syncSession);
        } catch {}
      } finally {
        if (epoch === requestEpoch.current) {
          setIsCalculating(false);
        }
      }
    },
    [sessionId],
  );

  // Initial Data Loader
  const loadInitialData = useCallback(async () => {
    if (!sessionId) return;
    const epoch = ++requestEpoch.current;

    try {
      const [session, addressBook] = await Promise.all([
        api<any>("checkout-sessions/" + sessionId),
        api<any>("me/addresses"),
      ]);

      if (epoch !== requestEpoch.current) return;

      if (session.order) {
        window.location.replace("/account/orders/" + session.order.id);
        return;
      }

      setAddresses(addressBook);

      // Determine initial billing
      if (session.billing_address) {
        setBilling(session.billing_address);
        const isSame = [
          "recipient",
          "phone",
          "line1",
          "line2",
          "landmark",
          "city",
          "region",
          "postal_code",
          "country_code",
        ].every(
          (k) => session.billing_address[k] === session.shipping_address?.[k],
        );
        setSameBilling(isSame);
      }

      // Resolve selected address
      let resolvedAddressId: string | null = null;
      if (session.shipping_address) {
        // Find matching saved address
        const match = addressBook.items?.find((a: any) =>
          [
            "recipient",
            "phone",
            "line1",
            "line2",
            "landmark",
            "city",
            "region",
            "postal_code",
            "country_code",
          ].every((k) => a[k] === session.shipping_address[k]),
        );
        resolvedAddressId = match ? match.id : null;
      } else if (addressBook.items && addressBook.items.length > 0) {
        // Default to saved address
        resolvedAddressId =
          addressBook.defaults?.shipping_address_id || addressBook.items[0].id;
      }

      setSelection(resolvedAddressId || "new");
      initialized.current = true;
      if (session.paymentAttempt) {
        setCheckout(session);
        return;
      }

      // Check if we need to auto-apply address and/or calculate quote
      if (resolvedAddressId && !session.shipping_address) {
        // Automatically apply the default address and calculate quote
        await applyAddressAndQuote(
          resolvedAddressId,
          undefined,
          undefined,
          session.version,
        );
      } else if (session.shipping_address) {
        // Address already on session: check if quote is missing or expired
        const quoteExpired =
          !session.quote ||
          !session.quote_expires_at ||
          new Date(session.quote_expires_at).getTime() <= Date.now();

        if (quoteExpired) {
          setIsCalculating(true);
          try {
            await api("checkout-sessions/" + sessionId + "/quote", "POST");
            const refreshed = await api<any>("checkout-sessions/" + sessionId);
            if (epoch === requestEpoch.current) setCheckout(refreshed);
          } catch (e: any) {
            if (epoch === requestEpoch.current) {
              setQuoteError(e.message || "Unable to calculate quote");
              setCheckout(session);
            }
          } finally {
            if (epoch === requestEpoch.current) setIsCalculating(false);
          }
        } else {
          setCheckout(session);
        }
      } else {
        // No saved address and no address on session
        setCheckout(session);
      }
    } catch (e: any) {
      if (epoch === requestEpoch.current) {
        setError(e.message || "Failed to load checkout details");
      }
    }
  }, [sessionId, applyAddressAndQuote]);

  // 1. Session Loading Effect (when sessionId exists in URL)
  useEffect(() => {
    if (status !== "authenticated" || !sessionId) {
      if (status === "anonymous") {
        setCheckout(null);
        setAddresses(null);
        loadedSessionId.current = "";
      }
      return;
    }

    if (loadedSessionId.current === sessionId) return;
    loadedSessionId.current = sessionId;
    void loadInitialData();
  }, [status, sessionId, loadInitialData]);

  // 2. Cart Purchase Initiation Effect (only when NO sessionId exists)
  useEffect(() => {
    if (status !== "authenticated" || sessionId) return;
    if (isHydrated && cartItems.length && !started.current) {
      started.current = true;
      void flushCart()
        .then(() => beginPurchase({ mode: "cart", cartVersion }))
        .catch((e) => {
          started.current = false;
          setError(e.message);
        });
    }
  }, [
    status,
    sessionId,
    isHydrated,
    cartItems.length,
    cartVersion,
    flushCart,
    beginPurchase,
  ]);

  // Handle switching to another saved address
  const handleSelectSavedAddress = async (addrId: string) => {
    if (checkout?.paymentAttempt || paymentLock.current) return;
    setSelection(addrId);
    setIsAddressModalOpen(false);
    await applyAddressAndQuote(addrId);
  };

  // Handle saving a newly created address
  const handleCreateAddress = async (formData: any) => {
    if (checkout?.paymentAttempt || paymentLock.current) return;
    setBusy(true);
    setError("");
    try {
      let createdId: string | undefined;
      if (saveAddressToAccount) {
        const saved = await api<any>("me/addresses", "POST", {
          address: formData,
          makeDefault: makeDefaultAddress,
        });
        createdId = saved?.id;
        const freshBook = await api<any>("me/addresses");
        setAddresses(freshBook);
      }

      setIsAddressModalOpen(false);
      setAddressModalView("list");

      if (createdId) {
        setSelection(createdId);
        await applyAddressAndQuote(createdId);
      } else {
        setSelection("custom");
        await applyAddressAndQuote(undefined, formData);
      }
    } catch (e: any) {
      setError(e.message || "Unable to save address");
    } finally {
      setBusy(false);
    }
  };

  // Handle editing an existing saved address
  const handleEditAddress = async (formData: any) => {
    if (checkout?.paymentAttempt || paymentLock.current) return;
    if (!editingAddress?.id) return;
    setBusy(true);
    setError("");
    try {
      await api("me/addresses/" + editingAddress.id, "PATCH", {
        address: formData,
        version: editingAddress.version,
        makeDefault: makeDefaultAddress,
      });

      const freshBook = await api<any>("me/addresses");
      setAddresses(freshBook);
      setEditingAddress(null);
      setAddressModalView("list");

      // If we edited the currently selected address, re-quote
      if (selection === editingAddress.id) {
        await applyAddressAndQuote(editingAddress.id);
      }
    } catch (e: any) {
      setError(e.message || "Unable to update address");
    } finally {
      setBusy(false);
    }
  };

  // Handle deleting a saved address
  const handleDeleteAddress = async (addrId: string) => {
    if (checkout?.paymentAttempt || paymentLock.current) return;
    if (!confirm("Are you sure you want to delete this saved address?")) return;
    setBusy(true);
    setError("");
    try {
      await api("me/addresses/" + addrId, "DELETE");
      const freshBook = await api<any>("me/addresses");
      setAddresses(freshBook);

      // If deleted address was active, fallback to next available
      if (selection === addrId) {
        if (freshBook.items?.length > 0) {
          const nextId =
            freshBook.defaults?.shipping_address_id || freshBook.items[0].id;
          setSelection(nextId);
          await applyAddressAndQuote(nextId);
        } else {
          setSelection("new");
          setCheckout((prev: any) =>
            prev ? { ...prev, shipping_address: null, quote: null } : null,
          );
        }
      }
    } catch (e: any) {
      setError(e.message || "Unable to delete address");
    } finally {
      setBusy(false);
    }
  };

  // Retry quote calculation
  const handleRetryQuote = async () => {
    if (checkout?.paymentAttempt || paymentLock.current) return;
    if (!sessionId) return;
    if (selection && selection !== "new" && selection !== "custom") {
      await applyAddressAndQuote(selection);
    } else if (checkout?.shipping_address) {
      await applyAddressAndQuote(undefined, checkout.shipping_address);
    }
  };

  const checkPayment = useCallback(async () => {
    if (!sessionId) return;
    try {
      const result = await api<any>(
        "checkout-sessions/" + sessionId + "/payment-status",
        "POST",
      );
      if (result.orderId) {
        window.location.assign("/account/orders/" + result.orderId);
      } else if (result.state === "confirming") {
        setPaymentPhase("confirming");
        setError("");
      } else if (result.state === "expired") {
        setPaymentPhase("expired");
        setError(
          "This payment session expired. Your order hasn't been placed. Start a new checkout; your bag is preserved.",
        );
      } else if (result.state === "refund_pending") {
        setPaymentPhase("expired");
        setError(
          "Your payment could not be fulfilled. A refund is being processed. Please contact us before paying again.",
        );
      } else if (result.state === "pending") {
        setPaymentPhase((phase) =>
          ["confirming", "processing", "failed"].includes(phase)
            ? phase
            : "idle",
        );
        if (!result.payment) {
          setError(
            "Payment is ready to be initiated. Click Continue to Payment to proceed.",
          );
        }
      }
      setPaymentRetryAllowed(Boolean(result.payment));
      return result;
    } catch (e: any) {
      setPaymentRetryAllowed(false);
      setError(e?.message || "Unable to check payment status.");
    }
  }, [sessionId]);

  useEffect(() => {
    if (!checkout?.paymentAttempt || status !== "authenticated") return;
    let stopped = false,
      timer: ReturnType<typeof setTimeout>,
      polls = 0;
    const poll = async () => {
      try {
        const value = await checkPayment();
        if (
          value?.orderId ||
          value?.state === "expired" ||
          value?.state === "refund_pending"
        )
          return;
      } catch {
        /* The customer can explicitly recheck; webhooks continue independently. */
      }
      if (stopped) return;
      if (++polls < 24) timer = setTimeout(poll, 5000);
      else setConfirmationSlow(true);
    };
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [checkout?.paymentAttempt, status, checkPayment]);

  // Prepare an internal payment attempt, then open the gateway on checkout.
  const handlePlaceOrder = async () => {
    if (
      paymentLock.current ||
      busy ||
      isCalculating ||
      !checkout?.quote ||
      quoteError
    )
      return;
    paymentLock.current = true;
    setBusy(true);
    setError("");
    setPaymentPhase("preparing");

    try {
      let currentVersion = checkout.version;

      // Auto-refresh quote if expired or within 20 seconds of expiring
      const expiresAt = checkout.quote_expires_at
        ? new Date(checkout.quote_expires_at).getTime()
        : 0;

      if (!checkout.paymentAttempt && Date.now() > expiresAt - 20000) {
        await api("checkout-sessions/" + sessionId + "/quote", "POST");
        const fresh = await api<any>("checkout-sessions/" + sessionId);
        setCheckout(fresh);
        currentVersion = fresh.version;
      }

      orderKey.current ||= crypto.randomUUID();
      await loadRazorpay();
      const result = await api<any>(
        "checkout-sessions/" + sessionId + "/payment-attempts",
        "POST",
        { version: currentVersion },
        orderKey.current,
      );

      setCheckout((value: any) => ({
        ...value,
        paymentAttempt: true,
        state: "ordered",
      }));
      if (result.orderId) {
        window.location.assign("/account/orders/" + result.orderId);
        return;
      }
      if (!result.payment) {
        if (result.state === "confirming") {
          setPaymentPhase("confirming");
          await checkPayment();
        } else {
          setPaymentPhase("idle");
          setPaymentRetryAllowed(true);
          setError(
            "Payment setup is pending. Please click Continue to Payment to proceed.",
          );
        }
        return;
      }
      setPaymentPhase("processing");
      const response = await openRazorpay(result.payment, () => {
        setError(
          "Payment failed. You can try again in the secure payment window.",
        );
      });
      setError("");
      setPaymentPhase("confirming");
      try {
        const verified = await api<any>(
          "checkout-sessions/" + sessionId + "/confirm-payment",
          "POST",
          {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          },
        );
        if (verified.orderId)
          window.location.assign("/account/orders/" + verified.orderId);
      } catch {
        setError(
          "Your payment is being confirmed. Please check its status before trying another payment.",
        );
      }
    } catch (e: any) {
      setPaymentPhase("failed");
      try {
        const latest = await api<any>("checkout-sessions/" + sessionId);
        setCheckout(latest);
        if (latest.order) {
          window.location.assign("/account/orders/" + latest.order.id);
          return;
        }
      } catch {}
      if (e?.code === "CHECKOUT_EXPIRED" || e?.status === 409) {
        try {
          await api("checkout-sessions/" + sessionId + "/quote", "POST");
          const fresh = await api<any>("checkout-sessions/" + sessionId);
          setCheckout(fresh);
          setError(
            "Your pricing quote was refreshed. Please click Continue to Payment to proceed.",
          );
        } catch (quoteErr: any) {
          setError(
            quoteErr.message || "Checkout session expired. Please refresh.",
          );
        }
      } else {
        setError(e instanceof Error ? e.message : "Unable to place order");
      }
    } finally {
      setBusy(false);
      paymentLock.current = false;
    }
  };

  // Resolve currently active address record
  const selectedSavedAddress = addresses?.items?.find(
    (a: any) => a.id === selection,
  );
  const activeAddress =
    selectedSavedAddress || checkout?.shipping_address || null;
  const isDefaultShipping =
    addresses?.defaults?.shipping_address_id &&
    selectedSavedAddress?.id === addresses.defaults.shipping_address_id;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Top Header ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#30473B]/10 pb-6 gap-4">
          <div className="space-y-2">
            <Link
              href="/rituals"
              className="inline-flex items-center gap-1.5 text-xs text-[#71776F] hover:text-[#30473B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue shopping</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal leading-tight">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-[#71776F]">
              Review your details and complete your purchase.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-white/80 px-3.5 py-1.5 rounded-full border border-[#30473B]/10 text-xs text-[#30473B] shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-[#30473B]" />
            <span className="font-medium">Secure SSL Checkout</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── State Loading & Auth Checks ───────────────────────── */}
        {status === "loading" ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#30473B]/10 max-w-lg mx-auto space-y-3">
            <span className="w-6 h-6 border-2 border-[#30473B] border-t-transparent rounded-full animate-spin inline-block" />
            <p className="text-sm text-[#71776F]">Verifying your session…</p>
          </div>
        ) : !customer ? (
          <div className="max-w-md mx-auto">
            <LoginPanel
              returnPath={
                sessionId ? "/checkout?session=" + sessionId : "/checkout"
              }
            />
          </div>
        ) : !sessionId ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#30473B]/10 max-w-lg mx-auto space-y-4">
            <Package className="w-10 h-10 text-[#30473B]/40 mx-auto" />
            <p className="text-sm text-[#71776F]">
              {!isHydrated
                ? "Loading your bag…"
                : !cartItems.length
                  ? "Your shopping bag is empty. Add a product to continue."
                  : "Preparing your secure checkout…"}
            </p>
            {!cartItems.length && (
              <Link
                href="/rituals"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#30473B] text-white text-xs font-medium rounded-xl hover:bg-[#203128] transition-colors"
              >
                <span>Explore products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : !checkout || !addresses ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#30473B]/10 max-w-lg mx-auto space-y-3">
            <span className="w-6 h-6 border-2 border-[#30473B] border-t-transparent rounded-full animate-spin inline-block" />
            <p className="text-sm text-[#71776F]">
              Loading your order details…
            </p>
          </div>
        ) : (
          /* ── Main Two-Column Layout ────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Column (58%): Delivery & Contact Details ──── */}
            <div
              className="lg:col-span-7 space-y-6"
              inert={checkout.paymentAttempt || busy ? true : undefined}
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-6">
                {/* Section Header */}
                <div className="border-b border-[#30473B]/8 pb-4">
                  <h2 className="font-serif text-2xl text-[#252A25]">
                    Delivery details
                  </h2>
                  <p className="text-xs sm:text-sm text-[#71776F] mt-1">
                    Choose where you would like your order delivered.
                  </p>
                </div>

                {/* Contact Email */}
                <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-[#30473B]/8 pb-4">
                  <div>
                    <span className="text-[#71776F] block text-xs">
                      Contact email
                    </span>
                    <span className="font-medium text-[#252A25] mt-0.5 block">
                      {customer.email || "Add an email in your account profile"}
                    </span>
                  </div>
                </div>

                {/* Selected Delivery Address Box */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#30473B]">
                      Selected delivery address
                    </span>
                    {addresses.items && addresses.items.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddressModalView("list");
                          setIsAddressModalOpen(true);
                        }}
                        className="text-xs font-semibold text-[#30473B] hover:text-[#203128] underline underline-offset-4 cursor-pointer transition-colors"
                      >
                        Change address
                      </button>
                    )}
                  </div>

                  {activeAddress ? (
                    <div className="p-5 rounded-2xl border border-[#30473B]/15 bg-[#FAF7F2]/60 space-y-2 text-sm transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#252A25]">
                            {activeAddress.label || "Home"}
                          </span>
                          {isDefaultShipping && (
                            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#CAD6BC]/40 text-[#30473B]">
                              Default
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-[#252A25] leading-relaxed">
                        {activeAddress.recipient && (
                          <span className="block font-medium">
                            {activeAddress.recipient}
                          </span>
                        )}
                        <span className="text-[#71776F] block mt-0.5">
                          {activeAddress.line1}
                          {activeAddress.line2
                            ? `, ${activeAddress.line2}`
                            : ""}
                        </span>
                        <span className="text-[#71776F] block">
                          {activeAddress.city}, {activeAddress.region} —{" "}
                          <span className="font-semibold text-[#252A25]">
                            {activeAddress.postal_code}
                          </span>
                        </span>
                        {activeAddress.phone && (
                          <span className="text-[#71776F] block text-xs mt-1">
                            Phone: {activeAddress.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Empty State: No address chosen */
                    <div className="p-6 rounded-2xl border border-dashed border-[#30473B]/25 bg-[#FAF7F2]/40 text-center space-y-3">
                      <p className="text-sm text-[#71776F]">
                        Add a delivery address to calculate your total and
                        continue.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAddressModalView("add");
                          setIsAddressModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#30473B] text-white text-xs font-medium rounded-xl hover:bg-[#203128] transition-colors cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add delivery address</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Billing Address Option */}
                <div className="pt-2 border-t border-[#30473B]/8 space-y-3">
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm text-[#252A25] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sameBilling}
                      onChange={(e) => {
                        setSameBilling(e.target.checked);
                        if (e.target.checked && activeAddress) {
                          void applyAddressAndQuote(
                            selection !== "new" && selection !== "custom"
                              ? selection
                              : undefined,
                            selection === "custom" ? activeAddress : undefined,
                            undefined,
                          );
                        }
                      }}
                      className="w-4 h-4 rounded border-[#30473B]/30 text-[#30473B] focus:ring-[#30473B] cursor-pointer"
                    />
                    <span>Billing address is the same as delivery address</span>
                  </label>

                  {!sameBilling && (
                    <div className="p-5 rounded-2xl border border-[#30473B]/15 bg-[#FAF7F2]/40 space-y-4 text-xs sm:text-sm">
                      <span className="font-serif text-base text-[#252A25] block">
                        Separate Billing Address
                      </span>
                      <AddressForm
                        initial={billing || emptyAddress}
                        submitLabel="Save billing address"
                        onSubmit={async (v) => {
                          setBilling(v);
                          await applyAddressAndQuote(
                            selection !== "new" && selection !== "custom"
                              ? selection
                              : undefined,
                            selection === "custom" ? activeAddress : undefined,
                            v,
                          );
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right Column (42%): Sticky Order Summary ───────── */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#30473B]/10 shadow-xs space-y-5">
                {/* Summary Header */}
                <div className="border-b border-[#30473B]/8 pb-4 flex items-center justify-between">
                  <h2 className="font-serif text-2xl text-[#252A25]">
                    Order summary
                  </h2>
                  <span className="text-xs text-[#71776F]">
                    {checkout.items.length}{" "}
                    {checkout.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {checkout.items.map((item: any) => {
                    const itemImage = getRitualImage(item);
                    const itemTitle =
                      item.product_title || item.title || "Standard Supply";
                    const supplyCode = item.supply_code;
                    const supplyLabel =
                      supplyCode === "reserve-60"
                        ? "60-day supply"
                        : "30-day supply";
                    const linePrice = item.price_minor
                      ? (
                          BigInt(item.price_minor) * BigInt(item.quantity || 1)
                        ).toString()
                      : null;

                    return (
                      <div
                        key={item.variantId}
                        className="flex items-center gap-3.5 py-1.5"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl bg-[#FAF7F2] border border-[#30473B]/10 overflow-hidden shrink-0 relative">
                          {itemImage ? (
                            <Image
                              src={itemImage}
                              alt={itemTitle}
                              width={72}
                              height={72}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#30473B]/30">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-sm text-[#252A25] truncate font-medium">
                            {itemTitle}
                          </h3>
                          <p className="text-xs text-[#71776F] mt-0.5">
                            {supplyLabel} · Qty {item.quantity}
                            {!item.available && (
                              <span className="text-red-700 ml-1.5 font-medium">
                                · Out of stock
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <span className="text-sm font-semibold text-[#252A25] tabular-nums">
                            {linePrice ? money(linePrice) : "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-[#30473B]/8 pt-4 space-y-2.5 text-sm">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-[#71776F]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#252A25] tabular-nums">
                      {money(
                        checkout.quote?.subtotalMinor || getLocalSubtotal(),
                      )}
                    </span>
                  </div>

                  {/* Delivery */}
                  <div className="flex justify-between items-center text-[#71776F]">
                    <span>Delivery</span>
                    <span className="font-medium text-[#252A25] tabular-nums">
                      {isCalculating ? (
                        <span className="text-xs text-[#71776F] italic">
                          Calculating…
                        </span>
                      ) : checkout.quote ? (
                        BigInt(checkout.quote.shippingMinor || 0) === 0n ? (
                          <span className="text-[#30473B] font-medium">
                            Free
                          </span>
                        ) : (
                          money(checkout.quote.shippingMinor)
                        )
                      ) : (
                        <span className="text-xs text-[#71776F]">—</span>
                      )}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center text-[#71776F]">
                    <span>Tax (GST)</span>
                    <span className="font-medium text-[#252A25] tabular-nums">
                      {isCalculating ? (
                        <span className="text-xs text-[#71776F] italic">
                          Calculating…
                        </span>
                      ) : checkout.quote ? (
                        money(checkout.quote.taxMinor)
                      ) : (
                        <span className="text-xs text-[#71776F]">—</span>
                      )}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="border-t border-[#30473B]/10 pt-3.5 flex justify-between items-baseline">
                    <div>
                      <span className="font-serif text-xl sm:text-2xl text-[#252A25] block">
                        Total
                      </span>
                      <span className="text-[11px] text-[#71776F]">
                        Taxes & delivery included
                      </span>
                    </div>

                    <div className="text-right">
                      {isCalculating ? (
                        <span className="text-sm font-medium text-[#71776F] animate-pulse">
                          Calculating…
                        </span>
                      ) : checkout.quote ? (
                        <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#252A25] tabular-nums">
                          {money(checkout.quote.totalMinor)}
                        </span>
                      ) : (
                        <span className="text-xs text-[#71776F]">
                          Add address to calculate
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quote Error / Warning Alert */}
                {quoteError && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{quoteError}</p>
                      <button
                        type="button"
                        onClick={handleRetryQuote}
                        className="font-semibold underline hover:text-amber-950 cursor-pointer text-xs"
                      >
                        Retry calculation
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Configuration Notice if disabled */}
                {!checkout.paymentConfigured && (
                  <p className="p-3 bg-[#FAF7F2] rounded-xl text-xs text-[#71776F] text-center">
                    Online ordering is being configured. No payment will be
                    collected.
                  </p>
                )}

                {/* Main Action Button */}
                <button
                  disabled={
                    busy ||
                    paymentPhase === "expired" ||
                    (paymentPhase === "confirming" && !paymentRetryAllowed) ||
                    isCalculating ||
                    !checkout.quote ||
                    !checkout.paymentConfigured ||
                    !!quoteError ||
                    !checkout.items.every((i: any) => i.available)
                  }
                  onClick={handlePlaceOrder}
                  className="w-full py-4 px-6 bg-[#30473B] hover:bg-[#203128] text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {busy ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>
                        {paymentPhase === "processing"
                          ? "Processing Payment…"
                          : paymentPhase === "confirming"
                            ? "Confirming Payment…"
                            : "Preparing Payment…"}
                      </span>
                    </>
                  ) : isCalculating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Calculating total…</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {paymentPhase === "failed" ||
                        (paymentPhase === "confirming" &&
                          paymentRetryAllowed) ||
                        (checkout.paymentAttempt &&
                          paymentPhase !== "confirming")
                          ? "Try Payment Again"
                          : paymentPhase === "confirming"
                            ? "Confirming Payment…"
                            : "Continue to Payment"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                {checkout.paymentAttempt && (
                  <div
                    className="text-xs text-[#71776F] space-y-2"
                    role="status"
                  >
                    {paymentPhase === "confirming" && (
                      <p>
                        {confirmationSlow
                          ? "Payment confirmation is taking longer than expected. Check the status before paying again."
                          : "Confirming your payment…"}
                      </p>
                    )}
                    <button
                      type="button"
                      className="underline"
                      onClick={() =>
                        void checkPayment().catch(() =>
                          setError(
                            "Unable to check payment status. Please try again.",
                          ),
                        )
                      }
                    >
                      Check payment status
                    </button>
                    {paymentPhase === "expired" && (
                      <Link className="block underline" href="/rituals">
                        Return to products to start a new checkout
                      </Link>
                    )}
                    <p>Your bag stays intact until payment is verified.</p>
                  </div>
                )}

                {/* Trust Information */}
                <div className="flex items-center justify-center gap-2 text-xs text-[#71776F] pt-1">
                  <Lock className="w-3.5 h-3.5 text-[#30473B]" />
                  <span>Secure 256-bit encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Address Selection & Management Modal ──────────────────── */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#30473B]/10 max-h-[90vh] overflow-y-auto space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#30473B]/8 pb-4">
                <h3 className="font-serif text-xl sm:text-2xl text-[#252A25]">
                  {addressModalView === "list"
                    ? "Delivery Addresses"
                    : addressModalView === "add"
                      ? "Add New Address"
                      : "Edit Address"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setAddressModalView("list");
                    setEditingAddress(null);
                  }}
                  className="p-1 rounded-full text-[#71776F] hover:text-[#252A25] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* View 1: Address List */}
              {addressModalView === "list" && (
                <div className="space-y-4">
                  {addresses?.items && addresses.items.length > 0 ? (
                    <div className="space-y-3">
                      {addresses.items.map((addr: any) => {
                        const isSelected = selection === addr.id;
                        const isDefault =
                          addresses.defaults?.shipping_address_id === addr.id;

                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isSelected
                                ? "border-[#30473B] bg-[#FAF7F2] shadow-xs"
                                : "border-[#30473B]/10 hover:border-[#30473B]/30 bg-white"
                            }`}
                          >
                            <div className="space-y-1 text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#252A25]">
                                  {addr.label}
                                </span>
                                {isDefault && (
                                  <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#CAD6BC]/40 text-[#30473B]">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-[#252A25] font-medium">
                                {addr.recipient}
                              </p>
                              <p className="text-[#71776F]">
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ""}
                              </p>
                              <p className="text-[#71776F]">
                                {addr.city}, {addr.region} — {addr.postal_code}
                              </p>
                              {addr.phone && (
                                <p className="text-[#71776F] text-xs">
                                  Phone: {addr.phone}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAddress(addr);
                                  setAddressModalView("edit");
                                }}
                                className="p-1.5 rounded-lg text-[#71776F] hover:text-[#30473B] hover:bg-black/5 transition-colors"
                                title="Edit address"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(addr.id);
                                }}
                                className="p-1.5 rounded-lg text-[#71776F] hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete address"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ml-1 ${
                                  isSelected
                                    ? "border-[#30473B] bg-[#30473B] text-white"
                                    : "border-[#30473B]/30"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-[#71776F] text-center py-4">
                      No saved addresses yet.
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setAddressModalView("add")}
                      className="w-full py-3.5 border border-dashed border-[#30473B]/30 rounded-2xl text-xs sm:text-sm font-medium text-[#30473B] hover:bg-[#FAF7F2] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add new address</span>
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: Add New Address */}
              {addressModalView === "add" && (
                <div className="space-y-4">
                  <AddressForm
                    submitLabel="Save and use address"
                    onSubmit={handleCreateAddress}
                  >
                    <div className="space-y-2 pt-2">
                      <label className="flex items-center gap-2 text-xs sm:text-sm text-[#252A25] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveAddressToAccount}
                          onChange={(e) =>
                            setSaveAddressToAccount(e.target.checked)
                          }
                          className="w-4 h-4 rounded border-[#30473B]/30 text-[#30473B] focus:ring-[#30473B]"
                        />
                        <span>Save this address to my account</span>
                      </label>

                      {saveAddressToAccount && (
                        <label className="flex items-center gap-2 text-xs sm:text-sm text-[#252A25] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={makeDefaultAddress}
                            onChange={(e) =>
                              setMakeDefaultAddress(e.target.checked)
                            }
                            className="w-4 h-4 rounded border-[#30473B]/30 text-[#30473B] focus:ring-[#30473B]"
                          />
                          <span>Set as default delivery address</span>
                        </label>
                      )}
                    </div>
                  </AddressForm>

                  <div className="pt-2 border-t border-[#30473B]/8 text-center">
                    <button
                      type="button"
                      onClick={() => setAddressModalView("list")}
                      className="text-xs text-[#71776F] hover:text-[#252A25] underline cursor-pointer"
                    >
                      Back to saved addresses
                    </button>
                  </div>
                </div>
              )}

              {/* View 3: Edit Address */}
              {addressModalView === "edit" && editingAddress && (
                <div className="space-y-4">
                  <AddressForm
                    initial={editingAddress}
                    submitLabel="Save changes"
                    onSubmit={handleEditAddress}
                  />
                  <div className="pt-2 border-t border-[#30473B]/8 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(null);
                        setAddressModalView("list");
                      }}
                      className="text-xs text-[#71776F] hover:text-[#252A25] underline cursor-pointer"
                    >
                      Cancel and back to list
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
