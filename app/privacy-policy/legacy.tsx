import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | The Wellness House",
  description:
    "How The Wellness House protects and respects your personal consultation and inquiry information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <Link
        href="/"
        className="text-xs text-[#71776F] hover:text-[#30473B] flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Home</span>
      </Link>

      <div className="space-y-2 border-b border-[#30473B]/10 pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
          Data Stewardship
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#71776F]">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-[#71776F] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#252A25]">
            1. Overview & Information We Collect
          </h2>
          <p>
            The Wellness House respects your digital sovereignty. We collect
            only information provided intentionally when you book an atelier
            consultation, submit an inquiry, or subscribe to our circadian
            journal: specifically, your name, contact email, phone number, and
            stated wellness preferences.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#252A25]">
            2. Consultation Confidentiality
          </h2>
          <p>
            All lifestyle and circadian intake notes shared during private
            consultation sessions in our New Delhi and Mumbai ateliers remain
            strictly confidential between you and your attending botanical
            practitioner.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#252A25]">
            3. No Third-Party Data Sharing
          </h2>
          <p>
            We will never sell, lease, or monetize your contact details or
            consultation records to data brokers or advertising exchanges. Your
            contact details are utilized solely for scheduling, answering direct
            inquiries, and dispatching our botanical publications.
          </p>
        </section>
      </div>
    </div>
  );
}
