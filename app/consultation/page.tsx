'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, MapPin, CheckCircle2, ArrowRight, ShieldCheck, User, Mail, Phone } from 'lucide-react';
import { useStore } from '@/context/store-context';
import { ConsultationBooking } from '@/lib/types';
import { BotanicalArt } from '@/components/botanical-art';

function ConsultationContent() {
  const searchParams = useSearchParams();
  const preselectedRitual = searchParams.get('ritual') || '';
  const { addConsultationBooking } = useStore();

  const [submittedBooking, setSubmittedBooking] = useState<ConsultationBooking | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredAtelier: 'new-delhi' as 'new-delhi' | 'mumbai' | 'virtual-video',
    ritualFocus: preselectedRitual 
      ? preselectedRitual.replace(/-/g, ' ').toUpperCase()
      : 'Metabolic & Digestive Balance',
    preferredDate: '',
    preferredTime: '11:00 AM (Morning)',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const booking: ConsultationBooking = {
      id: 'TWH-CONS-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      ritualFocus: form.ritualFocus,
      preferredAtelier: form.preferredAtelier,
      preferredDate: form.preferredDate || 'Upcoming Available Date',
      preferredTime: form.preferredTime,
      notes: form.notes
    };

    addConsultationBooking(booking);
    setSubmittedBooking(booking);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
          Private Appointments
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal mt-2 leading-tight">
          Reserve a Private Ritual Consultation
        </h1>
        <p className="text-sm sm:text-base text-[#71776F] mt-3 leading-relaxed">
          Sit with our clinical botanical team to evaluate your daily circadian rhythm, metabolic goals, and custom herbal protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Form */}
        <div className="lg:col-span-7 bg-[#FFFEFA] rounded-3xl p-8 sm:p-10 border border-[#30473B]/10 shadow-xs">
          {submittedBooking ? (
            <div className="text-center py-12 space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#CAD6BC]/40 flex items-center justify-center mx-auto text-[#30473B]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="font-mono text-xs uppercase text-[#C58B71] tracking-wider">
                  Reservation Dispatched
                </span>
                <h3 className="font-serif text-3xl text-[#252A25] mt-1">
                  We Look Forward to Welcoming You
                </h3>
              </div>

              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#30473B]/10 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#71776F]">Booking ID:</span>
                  <span className="font-mono font-bold text-[#30473B]">{submittedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71776F]">Guest Name:</span>
                  <span className="font-medium text-[#252A25]">{submittedBooking.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71776F]">Location:</span>
                  <span className="font-medium text-[#252A25] uppercase font-mono text-[11px]">
                    {submittedBooking.preferredAtelier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71776F]">Time & Date:</span>
                  <span className="font-medium text-[#252A25]">
                    {submittedBooking.preferredDate} · {submittedBooking.preferredTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71776F]">Focus:</span>
                  <span className="font-medium text-[#30473B]">{submittedBooking.ritualFocus}</span>
                </div>
              </div>

              <p className="text-xs text-[#71776F] max-w-sm mx-auto">
                A calendar invitation and preparatory questionnaire have been dispatched to <strong>{submittedBooking.email}</strong>.
              </p>

              <button
                onClick={() => setSubmittedBooking(null)}
                className="px-6 py-2.5 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-wider rounded-lg hover:bg-[#203128] transition-colors"
              >
                Schedule Another Consultation
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Consultation Type */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#30473B] block">
                  1. Select Sanctuary Location or Mode:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'new-delhi', label: 'New Delhi Atelier', sub: 'Mehrauli Enclave' },
                    { id: 'mumbai', label: 'Mumbai Atelier', sub: 'Kala Ghoda District' },
                    { id: 'virtual-video', label: 'Virtual Consultation', sub: 'Private HD Video' }
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setForm({ ...form, preferredAtelier: loc.id as any })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        form.preferredAtelier === loc.id
                          ? 'border-[#30473B] bg-[#FAF7F2] shadow-xs'
                          : 'border-[#30473B]/10 hover:bg-[#FAF7F2]/50'
                      }`}
                    >
                      <div className="text-xs font-medium text-[#252A25]">{loc.label}</div>
                      <div className="text-[10px] text-[#71776F] mt-0.5">{loc.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ritual Focus */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#30473B] block">
                  2. Primary Wellness Focus:
                </label>
                <select
                  value={form.ritualFocus}
                  onChange={(e) => setForm({ ...form, ritualFocus: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-xl px-4 py-3 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                >
                  <option>Metabolic Rhythm & Weight Management</option>
                  <option>Circadian Sleep & Evening Restoration</option>
                  <option>Botanical Skin Barrier & Cold-Process Cleansing</option>
                  <option>Adrenal Cortisol & Full-Spectrum Adaptogens</option>
                  <option>Complete 24-Hour Lifestyle Audit</option>
                </select>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 pt-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#30473B] block">
                  3. Guest Contact Details:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-[#71776F] block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Vikramaditya Singhania"
                      className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#71776F] block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="vikram@example.com"
                      className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#71776F] block mb-1">Mobile Phone (For WhatsApp confirmations) *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] text-[#71776F] block mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={form.preferredDate}
                    onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#71776F] block mb-1">Preferred Time Window</label>
                  <select
                    value={form.preferredTime}
                    onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                  >
                    <option>11:00 AM (Morning Stillness)</option>
                    <option>14:30 PM (Midday Restoration)</option>
                    <option>17:00 PM (Sunset Tea Window)</option>
                    <option>18:30 PM (Evening Wind-Down)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#71776F] block mb-1">Notes or Health Context (Optional)</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Share any specific sleep patterns, digestion questions, or daily routines you wish to explore."
                  className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-[#203128] transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Confirm Consultation Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFEFA] rounded-3xl p-8 border border-[#30473B]/10 shadow-xs space-y-6">
            <h3 className="font-serif text-2xl text-[#30473B]">What to Expect During Your Session</h3>
            
            <div className="space-y-4 text-xs text-[#71776F]">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#CAD6BC]/40 font-mono text-xs font-bold text-[#30473B] flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-[#252A25]">Circadian Rhythm Mapping</h4>
                  <p className="mt-0.5 leading-relaxed">We analyze your waking, eating, and sleeping windows to locate temporal stressors.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#CAD6BC]/40 font-mono text-xs font-bold text-[#30473B] flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-[#252A25]">Botanical Tasting & Olfactory Evaluation</h4>
                  <p className="mt-0.5 leading-relaxed">Experience single-origin herbal infusions, botanical saponifications, and cold extracts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#CAD6BC]/40 font-mono text-xs font-bold text-[#30473B] flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-[#252A25]">Personal Daily Protocol Dossier</h4>
                  <p className="mt-0.5 leading-relaxed">Receive a customized morning-to-night lifestyle and herbal schedule to practice at home.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-[#30473B]/10 bg-[#FFFEFA] shadow-xs aspect-16/10">
            <BotanicalArt variant="tea_ceremony" className="w-full h-full object-contain" />
          </div>
        </div>

      </div>

    </div>
  );
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading consultation form...</div>}>
      <ConsultationContent />
    </Suspense>
  );
}
