"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  MapPin,
  Heart,
  User,
  Sliders,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Check,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  Globe,
  Coins,
  ShieldAlert,
  Smartphone,
  Laptop,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useCustomer } from "@/context/customer-context";
import { useStore } from "@/context/store-context";
import { AccountDashboardLayout } from "./account-dashboard-layout";
import { AddressForm, emptyAddress } from "./address-form";
import { money } from "@/lib/commerce";
import { LoginPanel } from "./login-panel";

interface AccountSettingsProps {
  section: string;
}

// Accessible Toggle Component
function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-40 ${
        checked ? "bg-[#30473B]" : "bg-[#30473B]/20"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function AccountSettings({ section }: AccountSettingsProps) {
  return (
    <AccountDashboardLayout activeSection={section}>
      <SettingsContent section={section} />
    </AccountDashboardLayout>
  );
}

function SettingsContent({ section }: { section: string }) {
  const { customer, refresh, signOut } = useCustomer();
  const { rituals, addToCart, showToast } = useStore();

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  // Address editing state
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [makeDefaultAddress, setMakeDefaultAddress] = useState(false);

  // API Endpoint mapping
  const endpoint =
    section === "security"
      ? "me/sessions"
      : section === "saved"
        ? "saved-rituals"
        : "me/" + section;

  const load = useCallback(async () => {
    try {
      setData(await api(endpoint));
    } catch (e: any) {
      setError(e instanceof Error ? e.message : "Unable to load details");
    }
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e: any) {
      setError(e instanceof Error ? e.message : "Unable to complete action");
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#30473B]/10 space-y-3">
        <span className="w-5 h-5 border-2 border-[#30473B] border-t-transparent rounded-full animate-spin inline-block" />
        <p className="text-sm text-[#71776F]">{error || "Loading your details…"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Global Alerts ────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="flex-1 font-medium">{error}</p>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-2xl bg-[#CAD6BC]/30 border border-[#30473B]/20 text-sm text-[#30473B] flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#30473B] shrink-0 mt-0.5" />
          <p className="flex-1 font-medium">{message}</p>
          <button onClick={() => setMessage("")} className="text-[#30473B]/70 hover:text-[#30473B]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          1. PROFILE SECTION
         ══════════════════════════════════════════════════════════════ */}
      {section === "profile" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-6">
          <div className="border-b border-[#30473B]/8 pb-4">
            <h2 className="font-serif text-2xl text-[#252A25]">My Profile</h2>
            <p className="text-xs sm:text-sm text-[#71776F] mt-1">
              Manage your personal and contact information.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                const result = await api<any>("me/profile", "PATCH", {
                  name: data.name,
                  email: data.email,
                  phone: data.phone,
                  version: data.version,
                });
                setMessage(
                  result?.emailVerificationPending
                    ? "Profile updated. Check your inbox for a verification link."
                    : "Profile changes saved successfully.",
                );
                await load();
                await refresh();
              });
            }}
            className="space-y-6"
          >
            {/* Personal Information Group */}
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-wider text-[#30473B] block font-medium">
                Personal Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs sm:text-sm text-[#252A25] font-medium sm:col-span-2">
                  Display Name
                  <input
                    required
                    type="text"
                    value={data.name || ""}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="mt-1.5 w-full border border-[#30473B]/20 rounded-xl p-3 bg-white text-sm text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                    placeholder="Full name"
                  />
                </label>
              </div>
            </div>

            {/* Contact Information Group */}
            <div className="space-y-4 pt-4 border-t border-[#30473B]/8">
              <span className="font-mono text-xs uppercase tracking-wider text-[#30473B] block font-medium">
                Contact Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs sm:text-sm text-[#252A25] font-medium">
                  Contact Email
                  <input
                    required
                    type="email"
                    value={data.email || ""}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="mt-1.5 w-full border border-[#30473B]/20 rounded-xl p-3 bg-white text-sm text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                    placeholder="name@example.com"
                  />
                </label>

                <label className="block text-xs sm:text-sm text-[#252A25] font-medium">
                  Phone (Optional)
                  <input
                    type="tel"
                    value={data.phone || ""}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    className="mt-1.5 w-full border border-[#30473B]/20 rounded-xl p-3 bg-white text-sm text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                    placeholder="+91 98765 43210"
                  />
                </label>
              </div>

              <p className="text-xs text-[#71776F] leading-relaxed">
                Order receipts and shipping updates are sent to your contact email.
                Changing your email requires email verification.
              </p>
            </div>

            <div className="pt-4 border-t border-[#30473B]/8 flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="px-6 py-3 bg-[#30473B] hover:bg-[#203128] text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {busy && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          2. ADDRESSES SECTION
         ══════════════════════════════════════════════════════════════ */}
      {section === "addresses" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#30473B]/8 pb-4 gap-4">
            <div>
              <h2 className="font-serif text-2xl text-[#252A25]">My Addresses</h2>
              <p className="text-xs sm:text-sm text-[#71776F] mt-1">
                Manage saved shipping and billing locations for faster checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setMakeDefaultAddress(false);
                setIsAddressModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#30473B] text-white text-xs font-medium rounded-xl hover:bg-[#203128] transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Addresses Grid */}
          {data.items && data.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {data.items.map((addr: any) => {
                const isDefault = data.defaults?.shipping_address_id === addr.id;

                return (
                  <div
                    key={addr.id}
                    className="p-5 rounded-2xl border border-[#30473B]/10 bg-[#FAF7F2]/40 hover:border-[#30473B]/30 hover:bg-white transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-[#252A25]">
                          {addr.label || "Address"}
                        </span>
                        {isDefault && (
                          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#CAD6BC]/40 text-[#30473B] font-medium">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-[#252A25] space-y-0.5 leading-relaxed">
                        <p className="font-medium">{addr.recipient}</p>
                        <p className="text-[#71776F]">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}
                        </p>
                        <p className="text-[#71776F]">
                          {addr.city}, {addr.region} — {addr.postal_code}
                        </p>
                        {addr.phone && (
                          <p className="text-[#71776F] text-xs pt-0.5">
                            Phone: {addr.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#30473B]/8 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddress(addr);
                            setMakeDefaultAddress(isDefault);
                            setIsAddressModalOpen(true);
                          }}
                          className="font-medium text-[#30473B] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            if (
                              confirm(
                                "Delete this saved address? Existing placed orders will retain their original records.",
                              )
                            ) {
                              void run(async () => {
                                await api("me/addresses/" + addr.id, "DELETE");
                                await load();
                                setMessage("Address removed.");
                              });
                            }
                          }}
                          className="text-[#71776F] hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>

                      {!isDefault && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(async () => {
                              await api("me/default-addresses", "PUT", {
                                addressId: addr.id,
                              });
                              await load();
                              setMessage("Default delivery address updated.");
                            })
                          }
                          className="font-medium text-[#30473B] hover:underline cursor-pointer"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <MapPin className="w-10 h-10 text-[#30473B]/30 mx-auto" />
              <p className="font-serif text-lg text-[#252A25]">No saved addresses</p>
              <p className="text-xs text-[#71776F] max-w-sm mx-auto">
                Save your home or work address for seamless, one-click checkout quotes.
              </p>
            </div>
          )}

          {/* Add / Edit Address Modal */}
          {isAddressModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#30473B]/10 max-h-[90vh] overflow-y-auto space-y-6">
                <div className="flex items-center justify-between border-b border-[#30473B]/8 pb-4">
                  <h3 className="font-serif text-xl text-[#252A25]">
                    {editingAddress?.id ? "Edit Address" : "Add New Address"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="p-1 rounded-full text-[#71776F] hover:text-[#252A25]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <AddressForm
                  initial={editingAddress || emptyAddress}
                  submitLabel={editingAddress?.id ? "Save Changes" : "Save Address"}
                  onSubmit={async (addressValues) => {
                    await api(
                      "me/addresses" +
                        (editingAddress?.id ? "/" + editingAddress.id : ""),
                      editingAddress?.id ? "PATCH" : "POST",
                      {
                        address: addressValues,
                        version: editingAddress?.version,
                        makeDefault: makeDefaultAddress,
                      },
                    );
                    setIsAddressModalOpen(false);
                    await load();
                    setMessage("Address saved successfully.");
                  }}
                >
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm text-[#252A25] cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={makeDefaultAddress}
                      onChange={(e) => setMakeDefaultAddress(e.target.checked)}
                      className="w-4 h-4 rounded border-[#30473B]/30 text-[#30473B] focus:ring-[#30473B]"
                    />
                    <span>Set as default delivery address</span>
                  </label>
                </AddressForm>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          3. PREFERENCES SECTION
         ══════════════════════════════════════════════════════════════ */}
      {section === "preferences" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-6">
          <div className="border-b border-[#30473B]/8 pb-4">
            <h2 className="font-serif text-2xl text-[#252A25]">Preferences</h2>
            <p className="text-xs sm:text-sm text-[#71776F] mt-1">
              Personalize your display, motion, and communication preferences.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await api("me/preferences", "PATCH", {
                  locale: data.locale,
                  reduced_motion: data.reduced_motion,
                  marketing_email: data.marketing_email,
                  version: data.version,
                });
                await load();
                await refresh();
                setMessage("Preferences saved across your devices.");
              });
            }}
            className="space-y-6"
          >
            {/* Section A: Shopping Preferences */}
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-wider text-[#30473B] block font-medium">
                Shopping & Regional Settings
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F2]/50 border border-[#30473B]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#30473B]" />
                    <div>
                      <span className="text-xs text-[#71776F] block">Language</span>
                      <span className="text-sm font-medium text-[#252A25]">
                        English (India)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 rounded-full border border-[#30473B]/10 text-[#71776F]">
                    Standard
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2]/50 border border-[#30473B]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins className="w-4 h-4 text-[#30473B]" />
                    <div>
                      <span className="text-xs text-[#71776F] block">Currency</span>
                      <span className="text-sm font-medium text-[#252A25]">
                        Indian Rupee (INR · ₹)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 rounded-full border border-[#30473B]/10 text-[#71776F]">
                    Authoritative
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Accessibility */}
            <div className="space-y-4 pt-4 border-t border-[#30473B]/8">
              <span className="font-mono text-xs uppercase tracking-wider text-[#30473B] block font-medium">
                Accessibility
              </span>
              <div className="p-4 rounded-2xl border border-[#30473B]/10 bg-white flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-[#252A25] block">
                    Reduce motion and transitions
                  </span>
                  <p className="text-xs text-[#71776F] leading-relaxed">
                    Minimize animated reveals and transitions throughout the website.
                  </p>
                </div>
                <Toggle
                  checked={!!data.reduced_motion}
                  onChange={(checked) =>
                    setData({ ...data, reduced_motion: checked })
                  }
                />
              </div>
            </div>

            {/* Section C: Communication Preferences */}
            <div className="space-y-4 pt-4 border-t border-[#30473B]/8">
              <span className="font-mono text-xs uppercase tracking-wider text-[#30473B] block font-medium">
                Communication Preferences
              </span>
              <div className="p-4 rounded-2xl border border-[#30473B]/10 bg-white flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-[#252A25] block">
                    Product news and seasonal updates
                  </span>
                  <p className="text-xs text-[#71776F] leading-relaxed">
                    Receive occasional updates about new seasonal harvests and formulation releases.
                  </p>
                </div>
                <Toggle
                  checked={!!data.marketing_email}
                  onChange={(checked) =>
                    setData({ ...data, marketing_email: checked })
                  }
                />
              </div>
              <p className="text-xs text-[#71776F]">
                Essential transactional notices (such as order confirmations and shipping tracking) are always sent.
              </p>
            </div>

            <div className="pt-4 border-t border-[#30473B]/8 flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="px-6 py-3 bg-[#30473B] hover:bg-[#203128] text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {busy && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          4. ORDERS SECTION
         ══════════════════════════════════════════════════════════════ */}
      {section === "orders" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-6">
          <div className="border-b border-[#30473B]/8 pb-4">
            <h2 className="font-serif text-2xl text-[#252A25]">My Orders</h2>
            <p className="text-xs sm:text-sm text-[#71776F] mt-1">
              View your order history, receipts, and delivery tracking.
            </p>
          </div>

          {data.length > 0 ? (
            <div className="space-y-4">
              {data.map((order: any) => {
                const isPaid = order.payment_status === "paid";
                const isProcessing =
                  order.payment_status === "processing" ||
                  order.payment_status === "authorized";
                const dateStr = new Date(order.created_at).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                );

                return (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 rounded-2xl border border-[#30473B]/10 bg-[#FAF7F2]/30 hover:border-[#30473B]/30 hover:bg-white transition-all space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#30473B]/8 gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-semibold text-[#252A25]">
                            {order.public_reference}
                          </span>
                          <span
                            className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              isPaid
                                ? "bg-[#CAD6BC]/40 text-[#30473B]"
                                : isProcessing
                                  ? "bg-amber-100/70 text-amber-900"
                                  : "bg-black/5 text-[#71776F]"
                            }`}
                          >
                            {order.payment_status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-[#71776F]">Placed on {dateStr}</p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="font-serif text-lg font-semibold text-[#252A25] tabular-nums">
                          {money(order.total_minor)}
                        </span>
                      </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[#71776F]">
                        Fulfillment:{" "}
                        <strong className="text-[#252A25] capitalize font-medium">
                          {order.fulfillment_status || "Pending"}
                        </strong>
                      </span>

                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 font-medium text-[#30473B] hover:underline"
                      >
                        <span>View Order Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Package className="w-10 h-10 text-[#30473B]/30 mx-auto" />
              <p className="font-serif text-lg text-[#252A25]">No orders yet</p>
              <p className="text-xs text-[#71776F] max-w-sm mx-auto">
                Your purchases, shipments, and tracking updates will appear here.
              </p>
              <div className="pt-2">
                <Link
                  href="/rituals"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#30473B] text-white text-xs font-medium rounded-xl hover:bg-[#203128] transition-colors"
                >
                  <span>Explore Formulations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          5. SAVED RITUALS SECTION
         ══════════════════════════════════════════════════════════════ */}
      {section === "saved" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-6">
          <div className="border-b border-[#30473B]/8 pb-4">
            <h2 className="font-serif text-2xl text-[#252A25]">Saved Rituals</h2>
            <p className="text-xs sm:text-sm text-[#71776F] mt-1">
              Your bookmarked formulations and personal wellness essentials.
            </p>
          </div>

          {data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {data.map((slug: string) => {
                const ritual = rituals.find((r) => r.slug === slug);
                const title = ritual?.title || slug.replaceAll("-", " ");
                const subtitle = ritual?.subtitle || "Botanical Formulation";
                const imageUrl = ritual?.imageUrl;

                return (
                  <div
                    key={slug}
                    className="p-4 sm:p-5 rounded-2xl border border-[#30473B]/10 bg-[#FAF7F2]/40 hover:bg-white transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {imageUrl && (
                        <div className="w-16 h-16 rounded-xl bg-[#FAF7F2] border border-[#30473B]/10 overflow-hidden shrink-0">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0">
                        <Link
                          href={`/rituals/${slug}`}
                          className="font-serif text-base text-[#252A25] font-medium hover:text-[#30473B] transition-colors truncate block"
                        >
                          {title}
                        </Link>
                        <p className="text-xs text-[#71776F] line-clamp-2">
                          {subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#30473B]/8 flex items-center justify-between text-xs">
                      {ritual && (
                        <button
                          type="button"
                          onClick={async () => {
                            const added = await addToCart(ritual, 1);
                            if (added) {
                              showToast(
                                "Added to bag",
                                `${ritual.title} was added to your bag.`,
                              );
                            }
                          }}
                          className="font-medium text-[#30473B] hover:underline"
                        >
                          Add to Bag
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          run(async () => {
                            await api("saved-rituals", "DELETE", { slug });
                            await load();
                            setMessage("Ritual removed from saved list.");
                          })
                        }
                        className="text-[#71776F] hover:text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Heart className="w-10 h-10 text-[#30473B]/30 mx-auto" />
              <p className="font-serif text-lg text-[#252A25]">No saved rituals</p>
              <p className="text-xs text-[#71776F] max-w-sm mx-auto">
                Explore our botanical portfolio and tap the heart icon to save your favorite formulations.
              </p>
              <div className="pt-2">
                <Link
                  href="/rituals"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#30473B] text-white text-xs font-medium rounded-xl hover:bg-[#203128] transition-colors"
                >
                  <span>Browse Collections</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          6. SECURITY & PRIVACY SECTION
         ══════════════════════════════════════════════════════════════ */}
      {section === "security" && (
        <div className="space-y-6">
          {/* Card 1: Connected Sign-In Methods */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-6">
            <div className="border-b border-[#30473B]/8 pb-4">
              <h2 className="font-serif text-2xl text-[#252A25]">
                Sign-in & Security
              </h2>
              <p className="text-xs sm:text-sm text-[#71776F] mt-1">
                Manage your connected authentication providers and access credentials.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#30473B] block font-medium">
                Connected Sign-in Methods
              </span>

              {["google", "apple"].map((provider) => {
                const linked = customer?.identities.some(
                  (i) => i.provider === provider,
                );

                return (
                  <div
                    key={provider}
                    className="p-4 rounded-2xl border border-[#30473B]/10 bg-[#FAF7F2]/40 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#30473B]/10 flex items-center justify-center text-[#30473B] font-semibold text-xs uppercase">
                        {provider.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[#252A25] capitalize block">
                          {provider}
                        </span>
                        <span className="text-xs text-[#71776F]">
                          {linked ? "Connected to your account" : "Not connected"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          if (linked) {
                            if ((customer?.identities?.length ?? 0) <= 1) {
                              setError(
                                "Cannot disconnect your only active sign-in method.",
                              );
                              return;
                            }
                            await api("account/unlink", "POST", { provider });
                            await refresh();
                            setMessage(`${provider} account disconnected.`);
                          } else {
                            const r = await api<any>(
                              "auth/" + provider + "/link",
                              "POST",
                              { returnPath: "/account/security" },
                            );
                            window.location.assign(r.url);
                          }
                        })
                      }
                      className={`text-xs font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                        linked
                          ? "border border-red-200 text-red-700 hover:bg-red-50"
                          : "bg-[#30473B] text-white hover:bg-[#203128]"
                      }`}
                    >
                      {linked ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Re-Authentication Prompt */}
            <div className="pt-2">
              <details className="p-4 rounded-2xl border border-[#30473B]/10 bg-[#FAF7F2]/30 text-xs">
                <summary className="font-medium text-[#252A25] cursor-pointer select-none">
                  Need to re-authenticate for sensitive settings?
                </summary>
                <div className="pt-4">
                  <LoginPanel returnPath="/account/security" />
                </div>
              </details>
            </div>
          </div>

          {/* Card 2: Active Sessions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-6">
            <div className="border-b border-[#30473B]/8 pb-4">
              <h3 className="font-serif text-xl text-[#252A25]">Active Sessions</h3>
              <p className="text-xs sm:text-sm text-[#71776F] mt-1">
                Devices currently signed into your Wellness House account.
              </p>
            </div>

            <div className="divide-y divide-[#30473B]/8">
              {Array.isArray(data) &&
                data.map((s: any) => {
                  const dateStr = new Date(s.last_seen_at).toLocaleString();

                  return (
                    <div
                      key={s.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#30473B]/10 flex items-center justify-center text-[#30473B]">
                          {s.current ? (
                            <Laptop className="w-4 h-4" />
                          ) : (
                            <Smartphone className="w-4 h-4" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-medium text-[#252A25]">
                              {s.current ? "Current Device" : "Other Device"}
                            </span>
                            {s.current && (
                              <span className="text-[10px] font-medium bg-[#CAD6BC]/40 text-[#30473B] px-2 py-0.2 rounded-full">
                                Active now
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#71776F]">
                            Last activity: {dateStr}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await api("me/sessions/" + s.id, "DELETE");
                            if (s.current) await refresh();
                            else await load();
                            setMessage("Session terminated.");
                          })
                        }
                        className="text-xs font-medium text-[#71776F] hover:text-red-700 underline cursor-pointer"
                      >
                        Sign out
                      </button>
                    </div>
                  );
                })}
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => run(signOut)}
                className="px-4 py-2.5 rounded-xl border border-[#30473B]/20 text-xs font-medium text-[#252A25] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Sign Out Current Session
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (
                    confirm(
                      "Sign out of all devices? You will need to sign in again everywhere.",
                    )
                  ) {
                    void run(async () => {
                      await api("me/sign-out-all", "POST");
                      await signOut();
                    });
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Sign Out All Other Devices
              </button>
            </div>
          </div>

          {/* Card 3: Privacy & Data Rights */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-4">
            <div className="border-b border-[#30473B]/8 pb-4">
              <h3 className="font-serif text-xl text-[#252A25]">
                Privacy & Data Requests
              </h3>
              <p className="text-xs sm:text-sm text-[#71776F] mt-1">
                Exercise your data portability and account rights under applicable privacy laws.
              </p>
            </div>

            <p className="text-xs text-[#71776F] leading-relaxed">
              Export and deletion requests are audited by our compliance team. Tax,
              payment, and delivery records are retained as required by statutory regulations.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await api("me/privacy-requests", "POST", { kind: "export" });
                    setMessage(
                      "Your personal data export request was received. We will prepare your archive.",
                    );
                  })
                }
                className="px-4 py-2.5 rounded-xl border border-[#30473B]/20 text-xs font-medium text-[#252A25] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Request Data Export
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (
                    confirm(
                      "Request permanent account deletion? Legally mandated order records will be retained in accordance with consumer regulations.",
                    )
                  ) {
                    void run(async () => {
                      await api("me/privacy-requests", "POST", {
                        kind: "deletion",
                      });
                      setMessage(
                        "Your account deletion request has been submitted for review.",
                      );
                    });
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Request Account Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
