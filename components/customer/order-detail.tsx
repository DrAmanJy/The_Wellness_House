"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  CreditCard,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { money } from "@/lib/commerce";
import { useCustomer } from "@/context/customer-context";
import { AccountDashboardLayout } from "./account-dashboard-layout";

export function OrderDetail({ id }: { id: string }) {
  const { customer, status } = useCustomer();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      setOrder(null);
      return;
    }
    setOrder(null);
    let alive = true;
    const load = () =>
      api("me/orders/" + id)
        .then((o) => {
          if (alive) setOrder(o);
        })
        .catch((e) => {
          if (alive) setError(e.message);
        });
    void load();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 5000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [id, status, customer?.userId]);

  return (
    <AccountDashboardLayout activeSection="orders">
      <div className="space-y-6">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#30473B] hover:text-[#252A25] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>

          {order && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#71776F] hover:text-[#252A25] px-3 py-1.5 rounded-lg border border-[#30473B]/10 bg-white shadow-2xs hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Record</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        {!order ? (
          <div className="bg-white rounded-3xl p-12 border border-[#30473B]/10 text-center space-y-3">
            <span className="w-6 h-6 border-2 border-[#30473B] border-t-transparent rounded-full animate-spin inline-block" />
            <p className="text-sm text-[#71776F]">Loading order details…</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Primary Order Details Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#30473B]/10 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#30473B]/8 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#252A25]">
                      {order.public_reference}
                    </h2>
                    {order.payment_status === "paid" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#CAD6BC]/40 text-[#30473B]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {order.payment_status.replaceAll("_", " ")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#71776F] mt-1">
                    Fulfillment status:{" "}
                    <span className="capitalize font-medium text-[#252A25]">
                      {order.fulfillment_status || "Processing"}
                    </span>
                  </p>
                </div>

                {order.payment?.keyId?.startsWith("rzp_test_") && (
                  <span className="text-[11px] font-mono text-[#71776F] bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#30473B]/10 self-start sm:self-auto">
                    Test Mode (No real charge)
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <span className="font-mono text-xs uppercase tracking-wider text-[#71776F]">
                  Purchased Items ({order.items.length})
                </span>
                <div className="divide-y divide-[#30473B]/8 border-y border-[#30473B]/8">
                  {order.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#30473B]/10 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-[#30473B]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#252A25]">
                            {item.title_snapshot}
                          </p>
                          <p className="text-xs text-[#71776F]">
                            Qty: {item.quantity} · Unit Price:{" "}
                            {money(BigInt(item.unit_price_minor).toString())}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-medium text-[#252A25]">
                        {money(
                          (
                            BigInt(item.unit_price_minor) *
                            BigInt(item.quantity)
                          ).toString(),
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid: Address & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Shipping Address */}
                <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#30473B]/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#30473B]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Shipping Address</span>
                  </div>
                  <div className="text-xs text-[#252A25] leading-relaxed pt-1">
                    <p className="font-semibold text-sm">
                      {order.shipping_address.recipient}
                    </p>
                    <p>{order.shipping_address.line1}</p>
                    {order.shipping_address.line2 && (
                      <p>{order.shipping_address.line2}</p>
                    )}
                    <p>
                      {order.shipping_address.city},{" "}
                      {order.shipping_address.region}{" "}
                      {order.shipping_address.postal_code}
                    </p>
                    {order.shipping_address.phone && (
                      <p className="text-[#71776F] pt-1">
                        Phone: {order.shipping_address.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#30473B]/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#30473B]">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Cost Breakdown</span>
                  </div>
                  <dl className="space-y-1.5 text-xs text-[#71776F] pt-1">
                    {[
                      ["Subtotal", order.subtotal_minor],
                      ["Delivery", order.shipping_minor],
                      ["Tax", order.tax_minor],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between">
                        <dt>{label}</dt>
                        <dd className="font-mono text-[#252A25]">
                          {money(val)}
                        </dd>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-[#30473B]/10 pt-2 font-medium text-sm text-[#252A25]">
                      <dt>Total Amount</dt>
                      <dd className="font-mono font-bold text-[#30473B]">
                        {money(order.total_minor)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountDashboardLayout>
  );
}
