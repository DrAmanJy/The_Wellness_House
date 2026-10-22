"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomer } from "@/context/customer-context";
export function AccountNavigation() {
  const path = usePathname(),
    { customer } = useCustomer();
  return (
    <nav aria-label="Account settings" className="flex flex-wrap gap-2 mb-8">
      {[
        ["/account", "Overview"],
        ["/account/profile", "Profile"],
        ["/account/addresses", "Addresses"],
        ["/account/preferences", "Preferences"],
        ["/account/orders", "Orders"],
        ["/account/saved", "Saved rituals"],
        ["/account/security", "Sign-in & privacy"],
      ].map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={`border rounded-xl px-4 py-2 text-sm ${path === href ? "bg-[#30473B] text-white" : "bg-white"}`}
        >
          {label}
        </Link>
      ))}
      {!!customer?.roles.length && (
        <Link href="/admin" className="underline p-2 text-sm">
          Staff workspace
        </Link>
      )}
    </nav>
  );
}
