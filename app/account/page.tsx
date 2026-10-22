"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCustomer } from "@/context/customer-context";
import { api } from "@/lib/api-client";
import { AccountDashboardLayout } from "@/components/customer/account-dashboard-layout";
import { AccountOverview } from "@/components/customer/account-overview";

function OverviewContent() {
  const { status } = useCustomer();
  const query = useSearchParams();
  const started = useRef(false);
  const [error, setError] = useState("");

  const intent = query.get("intent") || undefined;
  const requested = query.get("returnTo") || "/account";
  const returnPath =
    /^\/checkout\?session=[0-9a-f-]{36}$/.test(requested) ||
    [
      "/checkout",
      "/account/profile",
      "/account/security",
      "/account/addresses",
      "/account/preferences",
      "/account/orders",
      "/account/saved",
      "/account/verify-contact",
    ].includes(requested) ||
    /^\/account\/orders\/[0-9a-f-]{36}$/.test(requested)
      ? requested
      : "/account";

  useEffect(() => {
    if (status !== "authenticated" || started.current) return;
    if (intent) {
      started.current = true;
      api<any>(`purchase-intents/${intent}/resume`, "POST")
        .then((r) => window.location.assign(r.url))
        .catch((e) => setError(e.message));
    } else if (returnPath !== "/account") {
      window.location.assign(returnPath);
    }
  }, [status, intent, returnPath]);

  return (
    <AccountDashboardLayout activeSection="overview">
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}
      {intent && !error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#CAD6BC]/30 border border-[#30473B]/10 text-sm text-[#30473B]">
          Resuming your checkout session…
        </div>
      )}
      <AccountOverview />
    </AccountDashboardLayout>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] p-12 text-center text-sm text-[#71776F]">
          Loading account studio…
        </div>
      }
    >
      <OverviewContent />
    </Suspense>
  );
}
