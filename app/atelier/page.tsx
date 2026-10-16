import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Clock, Phone, Mail, ArrowRight, CheckCircle2, Calendar, Coffee, Sparkles } from 'lucide-react';
import { EditorialImage } from '@/components/editorial-image';

export const metadata: Metadata = {
  title: 'The Ateliers & Physical Sanctuaries | The Wellness House',
  description: 'Step into our quiet architectural sanctuaries in New Delhi and Mumbai for private botanical consultations, mindful tea ceremonies, and compounding sessions.',
};

export default function AtelierPage() {
  const ateliers = [
    {
      city: 'New Delhi Flagship',
      neighborhood: 'Mehrauli Botanical Enclave',
      address: 'The Wellness House, MG Road, Sultanpur, New Delhi 110030',
      hours: 'Tuesday – Sunday: 10:00 AM – 7:30 PM (Mondays Closed for Compounding)',
      phone: '+91 (011) 4892-0190',
      imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
      description: 'Nestled beside historic sandstone ruins and heritage neem groves, our Delhi flagship is framed in unpolished teakwood, lime plaster, and warm travertine pedestals.',
      features: [
        'Private Circadian Consultation Suites',
        'Traditional High-Ceiling Tea Pavilion',
        'Live Saponification Curing Cellar',
        'Sensory Botanical Testing Counters'
      ]
    },
    {
      city: 'Mumbai Atelier',
      neighborhood: 'Kala Ghoda Heritage Arts District',
      address: 'The Wellness House, Ropewalk Lane, Fort, Mumbai 400001',
      hours: 'Monday – Saturday: 10:30 AM – 8:00 PM (Sundays by Private Appointment)',
      phone: '+91 (022) 2284-9011',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      description: 'Situated within a restored 19th-century colonial stone arches building, offering serene acoustic seclusion just steps away from the bustling art galleries of South Mumbai.',
      features: [
        'Acoustically Isolated Consultation Lounge',
        'Bespoke Olfactory Essential Oil Bar',
        'Himalayan Cold-Press Herbal Tasting',
        'Botanical Library & Reading Sanctum'
      ]
    }
  ];

  const spaces = [
    {
      title: 'The Sensory Tea Bar',
      desc: 'Guests are welcomed with a warm seasonal decoction brewed in solid brass kettles using organic Darjeeling tea, roasted fennel, and wild ginger.',
      imageUrl: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55'
    },
    {
      title: 'The Compounding Apothecary',
      desc: 'Our pharmaceutical-grade compounding laboratory where standardized plant extracts, adaptogen powders, and botanical oils are inspected and tailored.',
      imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'The Saponification Cellar',
      desc: 'Where handcrafted cold-process botanical cleansing bars rest on slatted cedar racks for six weeks of natural vegetable curing.',
      imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'The Acoustic Sound Chamber',
      desc: 'Quiet relaxation room treated with acoustic natural cork and linen wall panels for guided breathwork and sensory stress attenuation.',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="pb-24 space-y-20">
      
      {/* Hero */}
      <section className="bg-[#FAF7F2] py-20 border-b border-[#30473B]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
            Architectural Sanctuaries
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#252A25] font-normal leading-tight text-balance">
            Spaces of Stillness & Sensory Grace.
          </h1>
          <p className="text-base sm:text-lg text-[#71776F] max-w-2xl mx-auto leading-relaxed">
            Designed as quiet refuges away from urban sensory overload. Visit our physical ateliers in New Delhi and Mumbai for private formulation consultations, slow tea ceremonies, and personalized circadian rhythm planning.
          </p>
        </div>
      </section>

      {/* Flagship Locations Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">Flagship Destinations</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal mt-1">
            Where Architecture Meets Botanical Care
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {ateliers.map((atelier, idx) => (
            <div key={idx} className="bg-[#FFFEFA] rounded-3xl overflow-hidden border border-[#30473B]/10 shadow-sm flex flex-col justify-between group">
              <div>
                <div className="aspect-16/10 w-full overflow-hidden">
                  <EditorialImage
                    src={atelier.imageUrl}
                    alt={atelier.city}
                    aspectClassName="w-full h-full"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#C58B71] block">{atelier.neighborhood}</span>
                    <h3 className="font-serif text-3xl font-medium text-[#252A25] mt-1">{atelier.city}</h3>
                    <p className="text-xs sm:text-sm text-[#71776F] mt-2 leading-relaxed">
                      {atelier.description}
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs text-[#252A25] pt-2 border-t border-[#30473B]/05">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#30473B] shrink-0 mt-0.5" />
                      <span>{atelier.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#30473B] shrink-0" />
                      <span>{atelier.hours}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#30473B] shrink-0" />
                      <span>{atelier.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#30473B]/05">
                    <span className="font-mono text-[10px] uppercase text-[#71776F] block">Sanctuary Features:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#252A25]">
                      {atelier.features.map((f, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#30473B]" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0">
                <Link
                  href={`/consultation?atelier=${idx === 0 ? 'new-delhi' : 'mumbai'}`}
                  className="w-full py-4 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-lg hover:bg-[#203128] transition-all flex items-center justify-center gap-2"
                >
                  <span>Reserve Atelier Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Atelier Spaces Walkthrough */}
      <section className="bg-[#FAF7F2] py-20 border-y border-[#30473B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">Sensory Chambers</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#252A25] font-normal mt-1">
              Inside The House Experience
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {spaces.map((space, idx) => (
              <div key={idx} className="bg-[#FFFEFA] rounded-2xl overflow-hidden border border-[#30473B]/10 shadow-xs group">
                <div className="aspect-4/3 w-full overflow-hidden">
                  <EditorialImage
                    src={space.imageUrl}
                    alt={space.title}
                    aspectClassName="w-full h-full"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="font-serif text-lg font-medium text-[#252A25]">{space.title}</h4>
                  <p className="text-xs text-[#71776F] leading-relaxed">{space.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visitor Etiquette & Protocol */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFEFA] rounded-3xl p-8 sm:p-12 border border-[#30473B]/10 space-y-6 shadow-xs">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C58B71]">Visitor Etiquette</span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#252A25]">A Respectful, Quiet Sanctuary</h3>
          <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed">
            To preserve the calm acoustic serenity of our spaces, we invite all visitors to switch mobile phones to silent upon entry. Walk-ins are welcomed at our tea tasting bar, while one-on-one chronobiological and botanical consultations require advance reservation.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/consultation"
              className="px-8 py-3.5 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-lg hover:bg-[#203128] transition-all"
            >
              Book Private Consultation
            </Link>
            <Link
              href="/contact"
              className="text-xs font-medium text-[#30473B] hover:underline"
            >
              Inquire for Group Gatherings or Masterclasses
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
