import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Leaf, ShieldCheck, Heart, Sparkles, Award, MapPin, CheckCircle2 } from 'lucide-react';
import { EditorialImage } from '@/components/editorial-image';

export const metadata: Metadata = {
  title: 'Our Story & Brand Philosophy | The Wellness House',
  description: 'Discover how The Wellness House is redefining everyday self-care in India through standardized botanical formulations and sustainable rituals.',
};

export default function AboutPage() {
  const tenets = [
    {
      number: '01',
      title: 'Circadian Chronobiology First',
      desc: 'We never view human biology as a static machine. Our formulations are tuned to circadian metabolic windows—stimulating lipid composure when insulin sensitivity is high in the morning, and calming digestion when melatonin rises at night.'
    },
    {
      number: '02',
      title: 'Radical Molecular Transparency',
      desc: 'We reject proprietary blends that conceal ingredient quantities. Every bottle details standardized percentages—such as 60% HCA Garcinia and 50% EGCG Green Tea—verified by independent HPLC laboratory testing.'
    },
    {
      number: '03',
      title: 'Sensory Tactile Beauty',
      desc: 'Self-care should never feel like a grim medical prescription. We pour our teas from solid brass scoops, house our botanical tablets in fluted amber glass, and cure our bath bars on aromatic cedarwood racks.'
    },
    {
      number: '04',
      title: 'Ethical Indian Terroir',
      desc: 'India possesses one of the richest botanical pharmacopeias on earth. We source exclusively from fair-trade grower co-operatives in Darjeeling, Karnataka, Kerala, Himachal, and Rajasthan.'
    }
  ];

  return (
    <div className="pb-24 space-y-24">
      
      {/* Editorial Hero */}
      <section className="bg-[#FAF7F2] py-20 border-b border-[#30473B]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
            Our Origins & Philosophy
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#252A25] font-normal leading-tight text-balance">
            Wellness, Made a Daily Ritual.
          </h1>
          <p className="text-base sm:text-lg text-[#71776F] leading-relaxed max-w-2xl mx-auto font-sans">
            The Wellness House was born from a refusal to accept that personal wellness must be noisy, intimidating, or filled with ungrounded medical promises.
          </p>
        </div>
      </section>

      {/* Narrative Section 1 with Rich Photography */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">
              The Problem with Quick Fixes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal leading-snug">
              Why We Rejected the 7-Day Extreme Diet Industry
            </h2>
            <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
              For decades, commercial supplement brands have sold guilt: dramatic before-and-after promises, unregulated synthetic stimulants, and extreme restriction cycles that disrupt human circadian rhythms and metabolic composure.
            </p>
            <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
              We built The Wellness House on an entirely opposite foundational principle: sustainable vitality flourishes only through gentle, enjoyable micro-rituals repeated morning and night. When self-care feels beautiful to touch, smell, and consume, consistency is no longer an effort—it becomes a treasured part of your day.
            </p>
            <div className="pt-2">
              <Link
                href="/science"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#30473B] font-medium hover:underline"
              >
                <span>Read Our Circadian Science Manifesto</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-[#30473B]/10 shadow-lg">
              <EditorialImage
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury botanical still life with travertine and apothecary glass"
                aspectClassName="aspect-4/3 w-full"
                className="w-full h-full object-cover"
                caption="The Wellness House Atelier Archive"
              />
            </div>
          </div>

        </div>
      </section>

      {/* The 4 Tenets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">Our Compass</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal mt-1">
            The Four Pillars of The Wellness House
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tenets.map((t, idx) => (
            <div key={idx} className="bg-[#FFFEFA] p-8 rounded-3xl border border-[#30473B]/10 space-y-4 shadow-xs">
              <div className="font-mono text-2xl text-[#C58B71] font-light">{t.number}</div>
              <h3 className="font-serif text-2xl text-[#252A25] font-medium">{t.title}</h3>
              <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Photography Breakout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <EditorialImage
              src="https://images.unsplash.com/photo-1512290900672-1f4384c59972?auto=format&fit=crop&w=800&q=80"
              alt="Botanical compounding and pestle"
              aspectClassName="aspect-4/3 rounded-2xl overflow-hidden shadow-xs"
              caption="Botanical Compounding"
            />
            <p className="text-xs text-[#71776F] font-serif italic text-center">Standardized HPLC Extractions</p>
          </div>

          <div className="space-y-2">
            <EditorialImage
              src="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80"
              alt="Cold process artisanal soaps on stone"
              aspectClassName="aspect-4/3 rounded-2xl overflow-hidden shadow-xs"
              caption="Six-Week Curing Cellar"
            />
            <p className="text-xs text-[#71776F] font-serif italic text-center">Unbleached Seed Paper Wraps</p>
          </div>

          <div className="space-y-2">
            <EditorialImage
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
              alt="Peaceful mindfulness in morning light"
              aspectClassName="aspect-4/3 rounded-2xl overflow-hidden shadow-xs"
              caption="Slow Living"
            />
            <p className="text-xs text-[#71776F] font-serif italic text-center">Circadian Daily Synchronization</p>
          </div>
        </div>
      </section>

      {/* The Founders' Letter */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] p-8 sm:p-14 rounded-3xl border border-[#30473B]/10 space-y-6 text-[#252A25]">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">A Personal Note</span>
          <h3 className="font-serif text-3xl sm:text-4xl font-normal leading-tight">
            An Open Letter from Our Atelier
          </h3>
          <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed">
            Dear Reader,
          </p>
          <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed">
            We started The Wellness House after years of watching friends and family cycle through frustrating crash diets, stimulant caffeine pills, and synthetic cleansers that left their skin parched and their nervous systems exhausted.
          </p>
          <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed">
            We asked a simple question: What if wellness was slow? What if your morning tablet felt as natural as a glass of water, your evening tea tasted like mountain fennel, and your bath smelled of wild rain and vetiver?
          </p>
          <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed">
            We invite you to step into our ateliers, explore our formulations, and make everyday care your own personal sanctuary.
          </p>
          <div className="pt-4 border-t border-[#30473B]/10 flex items-center justify-between">
            <div>
              <div className="font-serif italic text-lg text-[#252A25]">The Founding Botanical Council</div>
              <div className="text-[11px] font-mono text-[#71776F]">The Wellness House · New Delhi & Mumbai</div>
            </div>
            <Link
              href="/consultation"
              className="px-6 py-3 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider rounded-lg hover:bg-[#203128] transition-all"
            >
              Meet the Team
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
