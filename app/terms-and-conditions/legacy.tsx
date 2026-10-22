import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Practice | The Wellness House",
  description:
    "Operating terms, regulatory disclosures, and wellness guidelines for The Wellness House sanctuary and publications.",
};

export default function TermsAndConditionsPage() {
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
          Sanctuary Protocols
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal">
          Terms of Practice & Health Disclaimers
        </h1>
        <p className="text-xs text-[#71776F]">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-[#71776F] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#252A25]">
            1. General Health & Botanical Disclaimer
          </h2>
          <p>
            The botanical formulations, lifestyle rituals, chronobiology guides,
            and sensory bathing practices presented on this platform and within
            our physical ateliers are formulated to support general nutritional,
            circadian, and sensory well-being. They are{" "}
            <strong>not medicinal drugs</strong> and are{" "}
            <strong>
              not intended to diagnose, mitigate, treat, cure, or prevent any
              acute or chronic disease, syndrome, or medical disorder
            </strong>
            .
          </p>
          <p>
            Statements regarding herbal bio-actives have not been evaluated as
            pharmaceutical cures. Results vary between individuals based on
            individual chronobiology, baseline metabolic markers, lifestyle
            consistency, and balanced nutrition.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#252A25]">
            2. Medical Advice Caution
          </h2>
          <p>
            Educational essays, routine calculators, and botanical herbarium
            entries provided on this platform are for informational and
            reflective purposes. They do not constitute formal medical diagnoses
            or clinical prescriptions. Always consult a licensed medical
            physician before adopting new intensive botanicals, particularly if
            you have pre-existing cardiovascular conditions, autoimmune
            conditions, or are pregnant or nursing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#252A25]">
            3. Atelier Consultations & Code of Conduct
          </h2>
          <p>
            Consultations at our New Delhi and Mumbai ateliers are scheduled to
            provide dedicated, uninterrupted guidance. We request guests arrive
            punctually. Cancellation or rescheduling of booked appointments
            should be communicated at least 24 hours in advance via our
            concierge.
          </p>
        </section>
      </div>
    </div>
  );
}
