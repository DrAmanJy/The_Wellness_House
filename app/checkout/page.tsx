import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { session } from "@/server/security/session";
import { origin } from "@/server/security/http";
import { CheckoutClient } from "@/components/customer/checkout-client";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Checkout | The Wellness House",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: checkoutId } = await searchParams;
  const user = await session(
    new Request(origin(), { headers: await headers() }),
  );
  if (!user)
    redirect(
      "/account?returnTo=" +
        encodeURIComponent(
          checkoutId ? "/checkout?session=" + checkoutId : "/checkout",
        ),
    );
  return <CheckoutClient sessionId={checkoutId} />;
}
