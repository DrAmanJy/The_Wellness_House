"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  User,
  MapPin,
  Sliders,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { useCustomer } from "@/context/customer-context";
import { LoginPanel } from "./login-panel";

interface AccountDashboardLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
}

export function AccountDashboardLayout({
  children,
  activeSection,
}: AccountDashboardLayoutProps) {
  const pathname = usePathname();
  const { customer, status, signOut } = useCustomer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Grouped Navigation Items
  const navGroups = [
    {
      group: "OVERVIEW",
      items: [
        {
          label: "Dashboard",
          href: "/account",
          icon: LayoutDashboard,
          active: pathname === "/account",
        },
      ],
    },
    {
      group: "SHOPPING",
      items: [
        {
          label: "My Orders",
          href: "/account/orders",
          icon: Package,
          active:
            pathname === "/account/orders" ||
            pathname.startsWith("/account/orders/"),
        },
        {
          label: "Saved Rituals",
          href: "/account/saved",
          icon: Heart,
          active: pathname === "/account/saved",
        },
      ],
    },
    {
      group: "ACCOUNT",
      items: [
        {
          label: "My Profile",
          href: "/account/profile",
          icon: User,
          active: pathname === "/account/profile",
        },
        {
          label: "Address Book",
          href: "/account/addresses",
          icon: MapPin,
          active: pathname === "/account/addresses",
        },
        {
          label: "Preferences",
          href: "/account/preferences",
          icon: Sliders,
          active: pathname === "/account/preferences",
        },
      ],
    },
    {
      group: "SECURITY",
      items: [
        {
          label: "Sign-in & Security",
          href: "/account/security",
          icon: ShieldCheck,
          active: pathname === "/account/security",
        },
      ],
    },
  ];

  // Helper for customer initial
  const userInitial =
    customer?.name?.trim().charAt(0).toUpperCase() ||
    customer?.email?.trim().charAt(0).toUpperCase() ||
    "U";

  const firstName = customer?.name?.trim().split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Dashboard Header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#30473B]/10 pb-6 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
              The Wellness House · Account Studio
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal mt-1">
              My Account
            </h1>
            <p className="text-xs sm:text-sm text-[#71776F] mt-1">
              Manage your orders, saved addresses, and personal details.
            </p>
          </div>

          {customer && (
            <div className="flex items-center gap-3 bg-white/80 p-2 sm:p-2.5 rounded-2xl border border-[#30473B]/10 shadow-2xs self-start sm:self-auto">
              <div className="w-10 h-10 rounded-xl bg-[#30473B] text-white flex items-center justify-center font-serif text-lg font-medium shadow-xs">
                {userInitial}
              </div>
              <div className="text-xs pr-2">
                <span className="font-medium text-[#252A25] block truncate max-w-[160px]">
                  {customer.name || "Member"}
                </span>
                <span className="text-[#71776F] block truncate max-w-[160px]">
                  {customer.email || "No email on record"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── State Loading & Auth Check ──────────────────────────── */}
        {status === "loading" ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#30473B]/10 max-w-md mx-auto space-y-3">
            <span className="w-6 h-6 border-2 border-[#30473B] border-t-transparent rounded-full animate-spin inline-block" />
            <p className="text-sm text-[#71776F]">Verifying your session…</p>
          </div>
        ) : !customer ? (
          <div className="max-w-md mx-auto">
            <LoginPanel returnPath={pathname} />
          </div>
        ) : (
          /* ── Main Two-Column Layout ─────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Mobile Navigation Trigger / Drawer ───────────────── */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full bg-white p-4 rounded-2xl border border-[#30473B]/10 flex items-center justify-between text-sm font-medium text-[#252A25] shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Menu className="w-4 h-4 text-[#30473B]" />
                  <span>Account Menu</span>
                </div>
                <span className="text-xs text-[#71776F] capitalize">
                  {activeSection || "Dashboard"}
                </span>
              </button>

              {mobileMenuOpen && (
                <div className="mt-3 bg-white p-4 rounded-2xl border border-[#30473B]/10 space-y-4 shadow-lg">
                  {navGroups.map((group) => (
                    <div key={group.group} className="space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#71776F] block px-3">
                        {group.group}
                      </span>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              item.active
                                ? "bg-[#CAD6BC]/30 text-[#30473B] font-semibold"
                                : "text-[#252A25] hover:bg-[#FAF7F2]"
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}

                  <div className="pt-2 border-t border-[#30473B]/8">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        void signOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Persistent Desktop Sidebar (approx 260px) ────────── */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6">
              <nav
                aria-label="Account navigation"
                className="bg-white rounded-3xl p-5 border border-[#30473B]/10 shadow-xs space-y-6"
              >
                {navGroups.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#71776F] block px-3 mb-2 font-medium">
                      {group.group}
                    </span>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                              item.active
                                ? "bg-[#CAD6BC]/35 text-[#30473B] font-semibold shadow-2xs"
                                : "text-[#252A25] hover:bg-[#FAF7F2] hover:text-[#30473B]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 shrink-0 text-[#30473B]" />
                              <span>{item.label}</span>
                            </div>
                            {item.active && (
                              <ChevronRight className="w-3.5 h-3.5 text-[#30473B]" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Staff Link & Sign Out */}
                <div className="pt-4 border-t border-[#30473B]/8 space-y-1">
                  {!!customer?.roles?.length && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider text-[#30473B] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Staff Workspace</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#71776F] hover:text-red-700 hover:bg-red-50/60 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#71776F]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </aside>

            {/* ── Main Content Area (Remaining width) ──────────────── */}
            <main className="lg:col-span-8 xl:col-span-9 min-h-[500px]">
              {children}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
