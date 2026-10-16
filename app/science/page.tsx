import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Compass, Clock, Leaf, ShieldCheck, CheckCircle2, Award, Sparkles, BookOpen } from 'lucide-react';
import { EditorialImage } from '@/components/editorial-image';

export const metadata: Metadata = {
  title: 'Metabolic & Circadian Science | The Wellness House',
  description: 'An architectural exploration into chronobiology, standardized botanical extraction, and the physiology of sustainable weight balance.',
};

export default function SciencePage() {
  return (
    <div className="pb-24 space-y-24">
      
      {/* Hero */}
      <section className="bg-[#FAF7F2] py-20 border-b border-[#30473B]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
            Scientific Foundations & Chronobiology
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#252A25] font-normal leading-tight text-balance">
            The Science of Everyday Balance.
          </h1>
          <p className="text-base sm:text-lg text-[#71776F] max-w-2xl mx-auto leading-relaxed font-sans">
            We reject the marketing clichés of instant fat burners, detox teas, and overnight miracles. Here is the rigorous physiological science that guides our formulations.
          </p>
        </div>
      </section>

      {/* Chapter 1: Circadian Metabolism */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">
              Chapter 01 · Chronobiology
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal leading-tight">
              Metabolism Is a 24-Hour Symphony
            </h2>
            <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
              Every cell in the human body possesses an internal molecular clock regulated by CLOCK and BMAL1 transcription factors. Insulin sensitivity, pancreatic beta-cell responsiveness, and gastric motility vary by more than 40% across a 24-hour day.
            </p>
            <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
              When modern individuals eat late at night, sleep irregularly, or consume harsh stimulant diet pills, they decouple central brain clocks from peripheral metabolic organs. The body responds by storing visceral lipid reserves and elevating circulating inflammatory markers.
            </p>
            <div className="p-5 bg-[#FFFEFA] rounded-2xl border border-[#30473B]/10 text-xs text-[#252A25] space-y-2 shadow-xs">
              <strong className="text-[#30473B] block font-serif text-sm">The Wellness House Principle:</strong>
              <span className="text-[#71776F] leading-relaxed block">
                Instead of fighting biology through chemical hunger suppressants, we provide gentle metabolic catechins when insulin sensitivity is naturally high in the morning, and digestive calming botanicals when gastric motility slows in the evening.
              </span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-[#30473B]/10 shadow-lg">
              <EditorialImage
                src="https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=1200&q=80"
                alt="Sunlit mountain landscape and natural biological rhythms"
                aspectClassName="aspect-4/3 w-full"
                className="w-full h-full object-cover"
                caption="Solar Chronobiology · Mountain Elevation"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Chapter 2: The Difference in Standardization */}
      <section className="bg-[#FAF7F2] py-20 border-y border-[#30473B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
              Chapter 02 · Phytochemistry
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal">
              Why Raw Plant Powders Differ from Standardized Extracts
            </h2>
            <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
              In commercial wellness, brands often label raw dried leaf powder as an &ldquo;extract.&rdquo; A raw leaf contains less than 1–2% of the active medicinal constituent, along with inert plant fibers. Our atelier requires standardized molecular biomarkers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FFFEFA] p-8 rounded-2xl border border-[#30473B]/10 space-y-4 shadow-xs">
              <div className="font-mono text-xs text-[#C58B71] uppercase">Bioactive 01</div>
              <h3 className="font-serif text-2xl text-[#252A25]">50% EGCG Polyphenols</h3>
              <p className="text-xs text-[#71776F] leading-relaxed">
                Epigallocatechin gallate from Darjeeling green tea leaves. Verified via High-Performance Liquid Chromatography (HPLC) to support cellular thermogenesis and reactive oxygen species scavenging.
              </p>
              <div className="text-[11px] font-mono text-[#30473B] pt-2 border-t border-[#30473B]/10">
                Found in: The Daily Metabolic Protocol
              </div>
            </div>

            <div className="bg-[#FFFEFA] p-8 rounded-2xl border border-[#30473B]/10 space-y-4 shadow-xs">
              <div className="font-mono text-xs text-[#C58B71] uppercase">Bioactive 02</div>
              <h3 className="font-serif text-2xl text-[#252A25]">60% Hydroxycitric Acid</h3>
              <p className="text-xs text-[#71776F] leading-relaxed">
                Aqueous extract from wild Garcinia gummi-gutta fruit rinds. Modulates ATP-citrate lyase, encouraging balanced carbohydrate-to-energy conversion rather than surplus fatty acid storage.
              </p>
              <div className="text-[11px] font-mono text-[#30473B] pt-2 border-t border-[#30473B]/10">
                Found in: The Daily Metabolic Protocol
              </div>
            </div>

            <div className="bg-[#FFFEFA] p-8 rounded-2xl border border-[#30473B]/10 space-y-4 shadow-xs">
              <div className="font-mono text-xs text-[#C58B71] uppercase">Bioactive 03</div>
              <h3 className="font-serif text-2xl text-[#252A25]">5% Total Withanolides</h3>
              <p className="text-xs text-[#71776F] leading-relaxed">
                Organic KSM-66® Ashwagandha root extract produced via traditional aqueous extraction without alcohol. Attenuates serum cortisol and modulates GABAergic neuro-receptors.
              </p>
              <div className="text-[11px] font-mono text-[#30473B] pt-2 border-t border-[#30473B]/10">
                Found in: Nootropic Clarity Brew
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Chapter 3: Comparative Analysis Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">Clinical Contrast</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal mt-1">
            Commercial Diet Culture vs. The Wellness House Method
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#30473B]">
                <th className="py-4 px-4 font-mono uppercase tracking-wider text-[#71776F]">Dimension</th>
                <th className="py-4 px-4 font-mono uppercase tracking-wider text-red-900 bg-red-50/50">Commercial Quick-Fix Industry</th>
                <th className="py-4 px-4 font-mono uppercase tracking-wider text-[#30473B] bg-[#CAD6BC]/20">The Wellness House Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30473B]/10">
              <tr>
                <td className="py-4 px-4 font-medium text-[#252A25]">Mechanism of Action</td>
                <td className="py-4 px-4 text-[#71776F] bg-red-50/20">Excessive synthetic caffeine, dehydrating laxatives (Senna), artificial appetite blockers.</td>
                <td className="py-4 px-4 text-[#252A25] bg-[#CAD6BC]/10 font-medium">Standardized botanical polyphenols, whole-seed carminative digestive infusions, circadian timing.</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-[#252A25]">Impact on Nervous System</td>
                <td className="py-4 px-4 text-[#71776F] bg-red-50/20">Spikes sympathetic fight-or-flight, causes heart palpitations, insomnia, and rebound bingeing.</td>
                <td className="py-4 px-4 text-[#252A25] bg-[#CAD6BC]/10 font-medium">Supports parasympathetic vagal tone; promotes evening cortisol decline and restorative delta sleep.</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-[#252A25]">Ingredient Transparency</td>
                <td className="py-4 px-4 text-[#71776F] bg-red-50/20">Proprietary blends hiding ingredient dosages; undisclosed filler starches; bovine gelatin.</td>
                <td className="py-4 px-4 text-[#252A25] bg-[#CAD6BC]/10 font-medium">100% Quantitative disclosure, verified HPLC bio-actives, 100% plant-based fruit pectin.</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-[#252A25]">Long-Term Sustainability</td>
                <td className="py-4 px-4 text-[#71776F] bg-red-50/20">Unsustainable 7-day crash regimes leading to metabolic slowing and hormonal burnout.</td>
                <td className="py-4 px-4 text-[#252A25] bg-[#CAD6BC]/10 font-medium">Gentle everyday habits repeated morning and evening as a cherished sensory ritual.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Chapter 4: Scientific Citations */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-t border-[#30473B]/10 pt-10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#71776F] mb-4">
            <BookOpen className="w-4 h-4 text-[#30473B]" />
            <span>Select Peer-Reviewed Chronobiology & Botanical Literature</span>
          </div>

          <ol className="list-decimal pl-5 space-y-3 text-xs text-[#71776F] leading-relaxed">
            <li>
              Panda, S. (2016). <em>Circadian physiology of metabolism.</em> Science, 354(6315), 1008-1015.
            </li>
            <li>
              Hursel, R., & Westerterp-Plantenga, M. S. (2010). <em>Catechin- and caffeine-rich teas for control of body weight in humans.</em> American Journal of Clinical Nutrition, 98(6), 1682S-1693S.
            </li>
            <li>
              Chandrasekhar, K., Kapoor, J., & Anishetty, S. (2012). <em>A prospective, randomized double-blind, placebo-controlled study of safety and efficacy of a high-concentration full-spectrum extract of Ashwagandha root in reducing stress and anxiety.</em> Indian Journal of Psychological Medicine, 34(3), 255-265.
            </li>
            <li>
              Scheer, F. A., et al. (2009). <em>Adverse metabolic and cardiovascular consequences of circadian misalignment.</em> Proceedings of the National Academy of Sciences, 106(11), 4453-4458.
            </li>
          </ol>
        </div>
      </section>

    </div>
  );
}
