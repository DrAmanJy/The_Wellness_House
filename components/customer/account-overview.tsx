"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  MapPin,
  Heart,
  ArrowRight,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useCustomer } from "@/context/customer-context";
import { api } from "@/lib/api-client";
import { money } from "@/lib/commerce";

export function AccountOverview() {
  const { customer } = useCustomer();
  const [orders, setOrders] = useState<any[]>([]);
  const [addressData, setAddressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const firstName = customer?.name?.trim().split(" ")[0] || "";

  useEffect(() => {
    let alive = true;
    Promise.all([
      api<any[]>("me/orders").catch(() => []),
      api<any>("me/addresses").catch(() => null),
    ]).then(([ordersRes, addressesRes]) => {
      if (alive) {
        setOrders(ordersRes || []);
        setAddressData(addressesRes);
        setLoading(false);
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  const recentOrders = orders.slice(0, 3);
  const defaultAddress = addressData?.items?.find(
    (a: any) => a.id === addressData?.defaults?.shipping_address_id,
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Welcome Banner Card ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#30473B]">
          Account Overview
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#252A25] font-normal">
          {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
        </h2>
        <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed max-w-xl">
          Your orders, saved addresses, and wellness essentials, all in one place.
        </p>
      </div>

      {/* ── Quick Action Cards (3 cards grid) ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Orders */}
        <Link
          href="/account/orders"
          className="group bg-white rounded-3xl p-6 border border-[#30473B]/10 hover:border-[#30473B]/30 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#30473B]/10 flex items-center justify-center text-[#30473B] group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#252A25] font-medium">
                My Orders
              </h3>
              <p className="text-xs text-[#71776F] mt-1">
                View purchase history and track active deliveries
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#30473B] group-hover:underline">
            <span>View orders</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Card 2: Addresses */}
        <Link
          href="/account/addresses"
          className="group bg-white rounded-3xl p-6 border border-[#30473B]/10 hover:border-[#30473B]/30 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#30473B]/10 flex items-center justify-center text-[#30473B] group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#252A25] font-medium">
                My Addresses
              </h3>
              <p className="text-xs text-[#71776F] mt-1">
                Manage saved shipping and billing locations
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#30473B] group-hover:underline">
            <span>Manage addresses</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Card 3: Saved Rituals */}
        <Link
          href="/account/saved"
          className="group bg-white rounded-3xl p-6 border border-[#30473B]/10 hover:border-[#30473B]/30 hover:shadow-md transition-all flex flex-col justify-between space-y-4 sm:col-span-2 xl:col-span-1"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#30473B]/10 flex items-center justify-center text-[#30473B] group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#252A25] font-medium">
                Saved Rituals
              </h3>
              <p className="text-xs text-[#71776F] mt-1">
                Access your bookmarked formulas and daily regimens
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#30473B] group-hover:underline">
            <span>View saved rituals</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* ── Recent Orders Section ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#30473B]/8 pb-4">
          <div>
            <h3 className="font-serif text-xl text-[#252A25]">Recent Orders</h3>
            <p className="text-xs text-[#71776F] mt-0.5">
              Your latest purchases and fulfillment updates
            </p>
          </div>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-xs font-medium text-[#30473B] hover:underline flex items-center gap-1"
            >
              <span>View all ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#71776F] space-y-2">
            <span className="w-5 h-5 border-2 border-[#30473B] border-t-transparent rounded-full animate-spin inline-block" />
            <p>Loading recent activity…</p>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="divide-y divide-[#30473B]/8">
            {recentOrders.map((order) => {
              const status = order.payment_status;
              const isPaid = status === "paid";
              const isProcessing = status === "processing" || status === "authorized";
              const dateStr = new Date(order.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="py-4.5 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#30473B]/10 flex items-center justify-center text-[#30473B] shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#252A25]">
                          {order.public_reference}
                        </span>
                        <span
                          className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
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
                      <p className="text-xs text-[#71776F]">
                        Ordered on {dateStr} · {money(order.total_minor)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="self-end sm:self-auto text-xs font-medium text-[#30473B] hover:text-[#203128] hover:underline flex items-center gap-1.5 transition-colors"
                  >
                    <span>View details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-10 text-center space-y-3">
            <Package className="w-10 h-10 text-[#30473B]/30 mx-auto" />
            <div className="space-y-1">
              <p className="font-serif text-lg text-[#252A25]">No orders yet</p>
              <p className="text-xs text-[#71776F] max-w-sm mx-auto">
                When you purchase formulations or living suites, your order tracking will appear here.
              </p>
            </div>
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

      {/* ── Default Address Preview ────────────────────────────────── */}
      {defaultAddress && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#30473B]/8 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg text-[#252A25]">
                Default Shipping Address
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#CAD6BC]/40 text-[#30473B]">
                Default
              </span>
            </div>
            <Link
              href="/account/addresses"
              className="text-xs font-medium text-[#30473B] hover:underline"
            >
              Manage addresses →
            </Link>
          </div>

          <div className="text-xs sm:text-sm text-[#252A25] space-y-0.5 leading-relaxed">
            <p className="font-medium">{defaultAddress.recipient}</p>
            <p className="text-[#71776F]">
              {defaultAddress.line1}
              {defaultAddress.line2 ? `, ${defaultAddress.line2}` : ""}
            </p>
            <p className="text-[#71776F]">
              {defaultAddress.city}, {defaultAddress.region} — {defaultAddress.postal_code}
            </p>
            {defaultAddress.phone && (
              <p className="text-[#71776F] text-xs pt-1">Phone: {defaultAddress.phone}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
