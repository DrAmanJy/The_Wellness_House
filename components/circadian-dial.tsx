'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Sunrise, Sunset, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface CircadianPhase {
  id: string;
  name: string;
  timeWindow: string;
  solarIcon: 'sunrise' | 'sun' | 'sunset' | 'moon';
  biologyTarget: string;
  endocrineState: string;
  primaryActive: string;
  activeMarker: string;
  recommendedRitual: string;
  ritualSlug: string;
  preparationTime: string;
  guidance: string;
}

const PHASES: CircadianPhase[] = [
  {
    id: 'dawn',
    name: 'Dawn & Morning Awakening',
    timeWindow: '06:00 – 10:30',
    solarIcon: 'sunrise',
    biologyTarget: 'GLUT4 Glucose Uptake & Cortisol Awakening Response',
    endocrineState: 'Cortisol Rising · Body Temperature Climbs',
    primaryActive: 'Camellia Sinensis (Organic Darjeeling)',
    activeMarker: '50% EGCG Polyphenols',
    recommendedRitual: 'Metabolic Balance Protocol',
    ritualSlug: 'metabolic-balance-protocol',
    preparationTime: '5 Minutes Steep',
    guidance: 'Take 20 minutes before breakfast with warm spring water. Enhances cellular fat oxidation without sympathetic overdrive.'
  },
  {
    id: 'solar',
    name: 'Solar Apex & Midday Focus',
    timeWindow: '11:00 – 15:30',
    solarIcon: 'sun',
    biologyTarget: 'Post-Prandial Glycemic Stability & Hepatic Cleansing',
    endocrineState: 'Peak Digestive Thermogenesis',
    primaryActive: 'Garcinia Cambogia (Karnataka Foothills)',
    activeMarker: '60% Hydroxycitric Acid (HCA)',
    recommendedRitual: 'Botanical Cleansing & Purity Ritual',
    ritualSlug: 'botanical-cleansing-ritual',
    preparationTime: '3 Minutes Infusion',
    guidance: 'Modulates carbohydrate storage while maintaining crisp, calm mental alertness without mid-afternoon cognitive slumps.'
  },
  {
    id: 'twilight',
    name: 'Twilight & Carminative Motility',
    timeWindow: '16:00 – 20:30',
    solarIcon: 'sunset',
    biologyTarget: 'Gastric Smooth Muscle Relaxation & Gas Dispersion',
    endocrineState: 'Digestive Motility Slows · Insulin Drops',
    primaryActive: 'Whole Roasted Fennel, Cumin & Fresh Ginger',
    activeMarker: 'Volatile Essential Anethole & Gingerols',
    recommendedRitual: 'Digestive Carminative Elixir',
    ritualSlug: 'digestive-carminative-elixir',
    preparationTime: '8 Minutes Slow Simmer',
    guidance: 'Sip warm after early evening nourishment. Alleviates post-meal abdominal pressure and prepares enteric neurons for rest.'
  },
  {
    id: 'night',
    name: 'Nocturnal Restoration & Deep Slumber',
    timeWindow: '21:00 – 05:30',
    solarIcon: 'moon',
    biologyTarget: 'Parasympathetic Vagus Tone & HPA Axis Reset',
    endocrineState: 'Melatonin Surges · Core Temperature Drops',
    primaryActive: 'KSM-66® Ashwagandha & Wild Vetiver Root',
    activeMarker: '5% Withanolides & Khus Terpenes',
    recommendedRitual: 'Evening Restoration Ritual',
    ritualSlug: 'evening-restoration-ritual',
    preparationTime: '10 Minutes Warm Decoction',
    guidance: 'Take 45 minutes before bedtime in quiet dim light. Reduces nocturnal awakening and supports deep restorative slow-wave sleep.'
  }
];

export const CircadianDial: React.FC = () => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('dawn');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTimeStr(`${hours.toString().padStart(2, '0')}:${minutes}`);

      // Auto-select phase according to time
      if (hours >= 6 && hours < 11) {
        setSelectedPhaseId('dawn');
      } else if (hours >= 11 && hours < 16) {
        setSelectedPhaseId('solar');
      } else if (hours >= 16 && hours < 21) {
        setSelectedPhaseId('twilight');
      } else {
        setSelectedPhaseId('night');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const activePhase = PHASES.find((p) => p.id === selectedPhaseId) || PHASES[0];

  const renderIcon = (type: string) => {
    switch (type) {
      case 'sunrise':
        return <Sunrise className="w-4 h-4 text-[#C58B71]" />;
      case 'sun':
        return <Sun className="w-4 h-4 text-[#D4A373]" />;
      case 'sunset':
        return <Sunset className="w-4 h-4 text-[#C58B71]" />;
      case 'moon':
        return <Moon className="w-4 h-4 text-[#748766]" />;
      default:
        return <Clock className="w-4 h-4 text-[#30473B]" />;
    }
  };

  return (
    <div className="bg-[#FFFEFA] rounded-3xl p-6 sm:p-10 border border-[#30473B]/10 shadow-md">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#30473B]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#30473B]">
            <Clock className="w-3.5 h-3.5" />
            <span>Interactive Circadian Navigator</span>
            {currentTimeStr && (
              <>
                <span className="text-[#30473B]/30">·</span>
                <span className="text-[#C58B71] font-semibold">Local Sanctuary Clock: {currentTimeStr}</span>
              </>
            )}
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#252A25] font-normal mt-1">
            Synchronize Your Body to the 24-Hour Solar Arc
          </h3>
        </div>

        <span className="text-xs text-[#71776F] font-sans max-w-xs md:text-right">
          Click any diurnal phase below to inspect biological timing and recommended botanical extract.
        </span>
      </div>

      {/* Phase Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 py-6">
        {PHASES.map((phase) => {
          const isSelected = phase.id === selectedPhaseId;
          return (
            <button
              key={phase.id}
              onClick={() => setSelectedPhaseId(phase.id)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#30473B] text-[#FAF7F2] border-[#30473B] shadow-sm'
                  : 'bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#252A25] border-[#30473B]/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono tracking-wider">
                  {phase.timeWindow}
                </span>
                <span className={isSelected ? 'text-[#CAD6BC]' : ''}>
                  {renderIcon(phase.solarIcon)}
                </span>
              </div>
              <div className="font-serif text-base font-medium line-clamp-1">
                {phase.name.split(' & ')[0]}
              </div>
              <div className={`text-[11px] truncate mt-1 ${isSelected ? 'text-[#CAD6BC]' : 'text-[#71776F]'}`}>
                {phase.activeMarker}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Phase Detail Showcase */}
      <div className="bg-[#FAF7F2] rounded-2xl p-6 sm:p-8 border border-[#30473B]/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Biological State */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#30473B]/10 text-[#30473B] rounded-sm text-[10px] font-mono uppercase tracking-wider">
              Circadian Window: {activePhase.timeWindow}
            </span>
            <span className="text-xs text-[#71776F] font-mono">
              {activePhase.endocrineState}
            </span>
          </div>

          <h4 className="font-serif text-2xl sm:text-3xl text-[#252A25] font-normal leading-snug">
            {activePhase.name}
          </h4>

          <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed">
            {activePhase.guidance}
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FFFEFA] rounded-lg border border-[#30473B]/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#71776F] block">Endocrine Target</span>
              <span className="font-medium text-[#252A25] mt-0.5 block">{activePhase.biologyTarget}</span>
            </div>
            <div className="p-3 bg-[#FFFEFA] rounded-lg border border-[#30473B]/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C58B71] block">Standardized Phyto-Active</span>
              <span className="font-medium text-[#252A25] mt-0.5 block">{activePhase.primaryActive} ({activePhase.activeMarker})</span>
            </div>
          </div>
        </div>

        {/* Right Column: Matched Protocol Card */}
        <div className="lg:col-span-5 bg-[#FFFEFA] rounded-xl p-6 border border-[#30473B]/15 shadow-sm space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#30473B]">
            Recommended Ritual Protocol
          </div>

          <h5 className="font-serif text-xl font-medium text-[#252A25]">
            {activePhase.recommendedRitual}
          </h5>

          <div className="text-xs text-[#71776F] space-y-1.5 font-sans">
            <div className="flex items-center justify-between py-1 border-b border-[#30473B]/05">
              <span>Preparation:</span>
              <span className="font-mono text-[#252A25] font-medium">{activePhase.preparationTime}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#30473B]/05">
              <span>Active Phytochemical:</span>
              <span className="font-mono text-[#30473B] font-medium">{activePhase.activeMarker}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Formulation Dossier:</span>
              <span className="font-mono text-[#252A25]">Full Monograph Available</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/rituals/${activePhase.ritualSlug}`}
              className="w-full py-3 bg-[#30473B] hover:bg-[#203128] text-[#FAF7F2] rounded-lg text-xs font-medium uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <span>Inspect Full Protocol</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
