"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { useStore } from "@/context/store-context";

export const Footer: React.FC = () => {
  const { showToast, siteConfig } = useStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address", undefined, "error");
      return;
    }
    showToast(
      "Contact our team",
      "Please use the contact page for publication requests.",
      "info",
    );
    return;
    setSubscribed(true);
    showToast(
      "Welcome to the Sanctuary Circle",
      "Our botanical seasonal publication will arrive in your inbox.",
    );
    setEmail("");
  };

  return (
    <footer className="bg-[#203128] text-[#FAF7F2] border-t border-[#30473B] pt-16 pb-12">
      <nav className="max-w-7xl mx-auto px-6 mb-8 flex gap-6 flex-wrap">
        {siteConfig?.footer?.map((item: any) => (
          <Link key={item.path} href={item.path}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Story Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-[#FAF7F2]/10">
          <div className="lg:col-span-6 space-y-4">
            <span className="font-mono text-xs tracking-widest text-[#CAD6BC] uppercase">
              The Botanical Newsletter
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2] font-normal leading-tight">
              A Little Wellness in Your Inbox.
            </h3>
            <p className="text-sm text-[#CAD6BC]/80 max-w-lg leading-relaxed">
              Receive thoughtful essays on circadian health, botanical research
              from our compounding atelier, and seasonal invitations to private
              wellness gatherings.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="mt-4 flex flex-col sm:flex-row gap-3 max-w-md"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 rounded-lg px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#FAF7F2]/50 focus:outline-hidden focus:border-[#CAD6BC] transition-colors"
                disabled={subscribed}
              />
              <button
                type="submit"
                disabled={subscribed}
                className="px-6 py-3 bg-[#CAD6BC] text-[#203128] font-medium text-xs uppercase tracking-wider rounded-lg hover:bg-[#FAF7F2] transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-80"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
            <p className="text-[11px] text-[#CAD6BC]/60">
              No promotions or noise. Unsubscribe at any time.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-mono text-xs text-[#CAD6BC] uppercase tracking-wider mb-4">
                Collections & Rituals
              </h4>
              <ul className="space-y-2.5 text-sm text-[#FAF7F2]/80">
                <li>
                  <Link
                    href="/collections"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    All Collections
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collections/weight-management"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Weight Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collections/gummies"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Wellness Gummies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collections/soaps"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Soaps & Body Care
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collections/bundles"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Wellness Bundles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rituals"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    All Formulations
                  </Link>
                </li>
              </ul>
            </div>

            {/* The House */}
            <div>
              <h4 className="font-mono text-xs text-[#CAD6BC] uppercase tracking-wider mb-4">
                The Sanctuary
              </h4>
              <ul className="space-y-2.5 text-sm text-[#FAF7F2]/80">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Our Manifesto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/science"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Metabolic Science
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ingredients"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Botanical Sourcing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/atelier"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Physical Ateliers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/journal"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    The House Journal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Inquiries & Consultations */}
            <div>
              <h4 className="font-mono text-xs text-[#CAD6BC] uppercase tracking-wider mb-4">
                Appointments
              </h4>
              <ul className="space-y-2.5 text-sm text-[#FAF7F2]/80">
                <li>
                  <Link
                    href="/consultation"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Book Consultation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Atelier Concierge
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Common Inquiries
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/videos"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Commercial Studio (CMS)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="hover:text-[#CAD6BC] transition-colors"
                  >
                    Terms of Practice
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Large Wordmark Banner */}
        <div className="py-12 text-center border-b border-[#FAF7F2]/10 select-none">
          <div className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-[0.22em] text-[#FAF7F2]/20 font-light hover:text-[#FAF7F2]/30 transition-colors">
            THE WELLNESS HOUSE
          </div>
          <p className="mt-2 text-xs font-serif italic text-[#CAD6BC]/70">
            Wellness, Made a Daily Ritual.
          </p>
        </div>

        {/* Regulatory & FSSAI Declarations */}
        <div className="py-6 border-b border-[#FAF7F2]/10 text-[11px] text-[#CAD6BC]/60 space-y-2 leading-relaxed">
          <p>
            <strong className="text-[#CAD6BC]/80">
              Health Declaration & Transparency:
            </strong>{" "}
            The botanical formulations, lifestyle rituals, and guidance provided
            by The Wellness House are designed to support general nutritional,
            circadian, and sensory well-being. Our botanical supplements are not
            intended to diagnose, treat, cure, or prevent any acute or chronic
            medical condition. Always consult your qualified healthcare
            practitioner before adopting new wellness practices or supplements.
          </p>
          <p>
            Formulated in compliance with Food Safety and Standards Authority of
            India (FSSAI) guidelines. FSSAI Central License: 10021064000318.
            Cold-process bath bars saponified under cosmetic standards.
          </p>
        </div>

        {/* Bottom Copyright & Locations */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#CAD6BC]/70 gap-4">
          <div>
            <span>
              © {new Date().getFullYear()} The Wellness House Pvt. Ltd. All
              rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#CAD6BC]" />
              <span>Flagship Ateliers: New Delhi & Mumbai</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
