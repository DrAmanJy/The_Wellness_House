'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Check, RotateCcw, Clock, Calendar, Download, Sun, Moon, Coffee, ArrowLeft } from 'lucide-react';
import { useStore } from '@/context/store-context';
import { EditorialImage } from '@/components/editorial-image';

export const RoutineBuilder: React.FC = () => {
  const { rituals } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFocus, setSelectedFocus] = useState<string>('metabolic-balance');
  const [selectedWakeTime, setSelectedWakeTime] = useState<string>('07:15');
  const [selectedModality, setSelectedModality] = useState<string>('tea-tisane');

  const focusOptions = [
    {
      id: 'metabolic-balance',
      title: 'Circadian Metabolism & Gut Composure',
      badge: 'Digestive Symphony',
      desc: 'Gentle whole-seed carminative teas and standardized Green Tea EGCG to support natural lipid utilization without stimulants.'
    },
    {
      id: 'evening-restoration',
      title: 'Restorative Sleep & Parasympathetic Wind-Down',
      badge: 'Nocturnal Restoration',
      desc: 'Plant pectin chews with German Chamomile, green-tea L-Theanine, and micro-dosed Melatonin to transition into deep delta sleep.'
    },
    {
      id: 'adaptogenic-resilience',
      title: 'Adrenal Stress Composure & Midday Focus',
      badge: 'Neuro-Cognitive Balance',
      desc: 'Full-spectrum organic KSM-66® Ashwagandha and Brahmi to temper cortisol spikes and maintain calm cognitive clarity.'
    },
    {
      id: 'bath-and-body',
      title: 'Botanical Hydro-Therapy & Skin Purification',
      badge: 'Somatic Dermal Care',
      desc: 'Cold-processed wild neem bars and ancient Himalayan mineral crystal salts to relax somatic muscle tone.'
    }
  ];

  const wakeTimeOptions = [
    { id: '06:00', label: '06:00 AM', tag: 'Early Dawn Riser' },
    { id: '07:15', label: '07:15 AM', tag: 'Balanced Circadian' },
    { id: '08:30', label: '08:30 AM', tag: 'Extended Rest / Night Owl' }
  ];

  const modalityOptions = [
    { id: 'tea-tisane', label: 'Warm Botanical Infusions & Teas', icon: Coffee },
    { id: 'chews-elixirs', label: 'Plant Pectin Nectars & Elixirs', icon: Sun },
    { id: 'bath-mineral', label: 'Hydro-Therapy & Cured Bath Bars', icon: Moon }
  ];

  const matched = rituals.find(r => r.category === selectedFocus) || rituals[0];

  const handleReset = () => {
    setStep(1);
    setSelectedFocus('metabolic-balance');
    setSelectedWakeTime('07:15');
    setSelectedModality('tea-tisane');
  };

  return (
    <div className="bg-[#FFFEFA] rounded-3xl border border-[#30473B]/10 p-6 sm:p-12 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#30473B]/10">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B] font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C58B71]" />
            <span>Interactive Sanctuary Diagnostic</span>
          </span>
          <h3 className="font-serif text-2xl sm:text-4xl text-[#252A25] font-normal mt-1.5">
            Discover Your 24-Hour Circadian Blueprint
          </h3>
          <p className="text-xs sm:text-sm text-[#71776F] mt-1 max-w-2xl">
            Align your waking hours, metabolic windows, and twilight restoration with standardized Indian botanicals and chronobiological principles.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs transition-all duration-300 ${
                step === s
                  ? 'bg-[#30473B] text-[#FAF7F2] font-bold shadow-xs scale-105'
                  : step > s
                  ? 'bg-[#CAD6BC] text-[#30473B]'
                  : 'bg-[#FAF7F2] text-[#71776F] border border-[#30473B]/10'
              }`}
            >
              {step > s ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="w-full h-1 bg-[#FAF7F2] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#30473B]"
          initial={{ width: '33.3%' }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Animated Step Questions */}
      <AnimatePresence mode="wait">
        {/* Step 1: Primary Vitality Focus */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pt-2"
          >
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#C58B71]">Phase 01 of 03</span>
              <h4 className="font-serif text-2xl text-[#30473B] mt-0.5">What is your primary wellness aspiration?</h4>
              <p className="text-xs text-[#71776F] mt-1">Select the biological rhythm you wish to anchor with botanical care:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusOptions.map((f) => {
                const isSelected = selectedFocus === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFocus(f.id)}
                    className={`p-6 rounded-2xl text-left border transition-all duration-200 relative ${
                      isSelected
                        ? 'border-[#30473B] bg-[#FAF7F2] shadow-sm ring-1 ring-[#30473B]/15'
                        : 'border-[#30473B]/10 hover:border-[#30473B]/30 hover:bg-[#FAF7F2]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div>
                        <span className="text-[10px] font-mono tracking-wider uppercase text-[#C58B71] block">{f.badge}</span>
                        <h5 className="font-serif text-lg font-medium text-[#252A25] mt-0.5">{f.title}</h5>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                        isSelected ? 'border-[#30473B] bg-[#30473B]' : 'border-[#30473B]/30'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-xs text-[#71776F] leading-relaxed mt-2">{f.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-[#203128] transition-all flex items-center gap-2 shadow-sm"
              >
                <span>Next: Circadian Calibration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Wake Timing & Sensory Preference */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pt-2 space-y-8"
          >
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#C58B71]">Phase 02 of 03</span>
              <h4 className="font-serif text-2xl text-[#30473B] mt-0.5">When do you typically wake?</h4>
              <p className="text-xs text-[#71776F] mt-1">This sets your biological suprachiasmatic nucleus (SCN) reference clock:</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {wakeTimeOptions.map((w) => {
                  const isSelected = selectedWakeTime === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWakeTime(w.id)}
                      className={`p-4 rounded-xl text-left border transition-all duration-200 ${
                        isSelected
                          ? 'border-[#30473B] bg-[#FAF7F2] shadow-xs ring-1 ring-[#30473B]/15'
                          : 'border-[#30473B]/10 hover:border-[#30473B]/30 hover:bg-[#FAF7F2]/50'
                      }`}
                    >
                      <div className="font-mono text-lg font-medium text-[#252A25]">{w.label}</div>
                      <div className="text-[11px] text-[#71776F] mt-0.5">{w.tag}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-serif text-xl text-[#30473B]">Preferred Daily Sensory Modality</h4>
              <p className="text-xs text-[#71776F] mt-1">How do you prefer to experience botanical self-care?</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {modalityOptions.map((m) => {
                  const IconComponent = m.icon;
                  const isSelected = selectedModality === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModality(m.id)}
                      className={`p-4 rounded-xl text-left border transition-all duration-200 flex items-center gap-3 ${
                        isSelected
                          ? 'border-[#30473B] bg-[#FAF7F2] shadow-xs ring-1 ring-[#30473B]/15'
                          : 'border-[#30473B]/10 hover:border-[#30473B]/30 hover:bg-[#FAF7F2]/50'
                      }`}
                    >
                      <div className="p-2.5 rounded-lg bg-[#CAD6BC]/30 text-[#30473B]">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-[#252A25]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#30473B]/10 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#71776F] hover:text-[#30473B] flex items-center gap-1.5 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Focus</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-8 py-4 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-[#203128] transition-all flex items-center gap-2 shadow-sm"
              >
                <span>Synthesize Blueprint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Complete Tailored Schedule & Protocol */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pt-2 space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30473B]/10">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">
                  Customized Blueprint
                </span>
                <h4 className="font-serif text-2xl sm:text-3xl text-[#30473B] mt-0.5">
                  Your 24-Hour Circadian Architecture
                </h4>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-[#71776F] hover:text-[#30473B] flex items-center gap-1.5 self-start sm:self-auto font-mono uppercase"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Modify Parameters</span>
              </button>
            </div>

            {/* Matched Protocol Feature Card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 sm:p-8 border border-[#30473B]/10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/3 aspect-4/3 rounded-xl overflow-hidden bg-white border border-[#30473B]/10 shrink-0">
                <EditorialImage
                  src={matched.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'}
                  alt={matched.title}
                  fallbackVariant={matched.artVariant}
                  aspectClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#30473B]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{matched.circadianTime}</span>
                  <span>·</span>
                  <span>{matched.duration}</span>
                </div>

                <h5 className="font-serif text-2xl text-[#252A25]">{matched.title}</h5>
                <p className="text-xs text-[#71776F] leading-relaxed">{matched.overview}</p>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/rituals/${matched.slug}`}
                    className="px-6 py-3 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider rounded-lg hover:bg-[#203128] transition-colors flex items-center gap-2"
                  >
                    <span>View Dossier & Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/consultation?ritual=${matched.slug}`}
                    className="px-5 py-3 bg-white text-[#30473B] border border-[#30473B]/20 text-xs font-medium uppercase tracking-wider rounded-lg hover:bg-[#FAF7F2] transition-colors"
                  >
                    Book Formulation Session
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
