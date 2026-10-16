'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/store-context';

export default function ContactPage() {
  const { showToast } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'Formulation Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Inquiry Dispatched', 'Our concierge team will respond within 4 business hours.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
          Concierge & Client Care
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal mt-2">
          Connect With The House
        </h1>
        <p className="text-sm sm:text-base text-[#71776F] mt-3 leading-relaxed">
          Whether you have questions regarding batch standardization, ingredient sourcing, or building a custom routine, our botanical concierge is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-[#FFFEFA] rounded-3xl p-8 sm:p-10 border border-[#30473B]/10 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#CAD6BC]/40 flex items-center justify-center mx-auto text-[#30473B]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl text-[#30473B]">Message Received</h3>
              <p className="text-sm text-[#71776F] max-w-sm mx-auto">
                Thank you for reaching out. A dedicated botanical advisor will review your note and get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-[#FAF7F2] text-[#30473B] text-xs font-medium rounded-lg hover:bg-[#CAD6BC]/30 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#252A25] block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Aditi Sen"
                    className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#252A25] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="aditi@example.com"
                    className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#252A25] block mb-1">Inquiry Topic</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                >
                  <option>Formulation & Ingredient Inquiry</option>
                  <option>Atelier Visit & Private Appointments</option>
                  <option>Institutional & Practitioner Inquiries</option>
                  <option>Feedback or Ritual Protocol Consultation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#252A25] block mb-1">Your Note *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we assist your everyday wellness routine?"
                  className="w-full bg-[#FAF7F2] border border-[#30473B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#252A25] focus:outline-hidden focus:border-[#30473B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-lg hover:bg-[#203128] transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Dispatch Inquiry</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Atelier Info & Locations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFEFA] rounded-3xl p-8 border border-[#30473B]/10 shadow-xs space-y-6">
            <h3 className="font-serif text-2xl text-[#30473B]">Direct Channels</h3>

            <div className="space-y-4 text-xs text-[#71776F]">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#30473B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#252A25] block">Client Care Email</span>
                  <a href="mailto:care@thewellnesshouse.in" className="hover:text-[#30473B] underline">
                    care@thewellnesshouse.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#30473B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#252A25] block">Atelier Concierge Line</span>
                  <span>+91 (011) 4892-0190</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#30473B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#252A25] block">Operating Hours</span>
                  <span>Monday through Saturday, 9:30 AM – 6:30 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#30473B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#252A25] block">Atelier & Registered Office</span>
                  <span>The Wellness House Pvt. Ltd., Mehrauli-Gurgaon Road, New Delhi 110030</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#CAD6BC]/20 rounded-3xl border border-[#CAD6BC]/40 text-xs text-[#30473B] space-y-2">
            <h4 className="font-serif text-sm font-medium">Small-Batch Dispatch Policy</h4>
            <p className="leading-relaxed">
              To guarantee optimal botanical potency, our products are dispatched within 24 hours of compounding. We do not maintain old warehouse stockpiles.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
