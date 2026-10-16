import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Clock, Heart, ShieldCheck, Check, Sparkles, 
  MapPin, ArrowLeft, ArrowRight, BookOpen, Compass 
} from 'lucide-react';
import { RITUAL_FORMULATIONS } from '@/lib/rituals-data';
import { EditorialImage } from '@/components/editorial-image';
import { RitualCard } from '@/components/ritual-card';
import { RitualDetailInteractive } from './interactive-client';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ritual = RITUAL_FORMULATIONS.find((r) => r.slug === slug);
  if (!ritual) return { title: 'Ritual Not Found | The Wellness House' };

  return {
    title: `${ritual.title} | Formulation Dossier | The Wellness House`,
    description: ritual.subtitle,
    openGraph: {
      title: `${ritual.title} | The Wellness House`,
      description: ritual.subtitle,
    },
  };
}

export default async function RitualDetailPage({ params }: Props) {
  const { slug } = await params;
  const ritual = RITUAL_FORMULATIONS.find((r) => r.slug === slug);

  if (!ritual) {
    notFound();
  }

  const related = RITUAL_FORMULATIONS.filter((r) => r.id !== ritual.id).slice(0, 3);

  return (
    <div className="pb-24 space-y-16">
      
      {/* Top Breadcrumb */}
      <div className="bg-[#FAF7F2] border-b border-[#30473B]/05 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-[#71776F] flex items-center gap-2">
          <Link href="/" className="hover:text-[#30473B] transition-colors">Sanctuary</Link>
          <span>/</span>
          <Link href="/rituals" className="hover:text-[#30473B] transition-colors">Daily Rituals</Link>
          <span>/</span>
          <span className="text-[#252A25] font-medium truncate">{ritual.title}</span>
        </div>
      </div>

      {/* Main Dossier Header Split with Client Interactivity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RitualDetailInteractive ritual={ritual} />
      </div>

      {/* Deep Science Breakdown Section */}
      <div className="bg-[#FAF7F2] py-16 border-y border-[#30473B]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">Biological Architecture</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#252A25]">The Science Behind The Formulation</h2>
          <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
            {ritual.theScience}
          </p>
        </div>
      </div>

      {/* Included Physical Components */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">Protocol Anatomy</span>
          <h2 className="font-serif text-3xl text-[#252A25] mt-1">Included Formulation Components</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ritual.components.map((comp, idx) => (
            <div key={idx} className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#30473B]/10 space-y-2 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-[#C58B71]">{comp.format}</div>
              <h3 className="font-serif text-lg font-medium text-[#252A25]">{comp.title}</h3>
              <p className="text-xs text-[#71776F] leading-relaxed">{comp.purpose}</p>
              <div className="pt-2 text-[11px] font-mono text-[#30473B]">
                Timing: {comp.dailyTiming}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botanical Actives Traceability Table */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">Traceability Dossier</span>
          <h2 className="font-serif text-3xl text-[#252A25] mt-1">Active Botanical Origin & Chemistry</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ritual.botanicalActives.map((active, idx) => (
            <div key={idx} className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#30473B]/10 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#71776F]">
                <span className="font-mono text-[#C58B71]">{active.sourceRegion}</span>
                <MapPin className="w-3.5 h-3.5 text-[#30473B]" />
              </div>

              <div>
                <h3 className="font-serif text-xl font-medium text-[#252A25]">{active.name}</h3>
                <p className="font-serif italic text-xs text-[#71776F]">{active.scientificName}</p>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs space-y-0.5">
                <span className="font-mono text-[10px] uppercase text-[#30473B] font-semibold block">Active Compound:</span>
                <span className="text-[#252A25]">{active.activeCompound}</span>
              </div>

              <p className="text-xs text-[#71776F] leading-relaxed">
                {active.therapeuticFunction}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety & FSSAI Compliance Box */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFEFA] p-6 sm:p-8 rounded-2xl border border-[#30473B]/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#30473B]">
            <ShieldCheck className="w-4 h-4 text-[#30473B]" />
            <span>FSSAI Quality & Manufacturing Declarations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#71776F]">
            <div>
              <strong className="text-[#252A25] block mb-1">Precautions & Medical Advisement:</strong>
              <ul className="list-disc pl-4 space-y-1">
                {ritual.precautions.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong className="text-[#252A25] block mb-1">Manufacturing Standards:</strong>
              <p>
                Compounded in GMP-certified, ISO 22000 compliant facilities under strict batch quarantine and microbiological assays. FSSAI Central License: 10021064000318.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Formulations Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8 border-t border-[#30473B]/10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#252A25]">Complementary Circadian Protocols</h2>
          <Link href="/rituals" className="text-xs font-medium text-[#30473B] hover:underline flex items-center gap-1 font-mono uppercase tracking-wider">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {related.map((r) => (
            <RitualCard key={r.id} ritual={r} />
          ))}
        </div>
      </div>

    </div>
  );
}
