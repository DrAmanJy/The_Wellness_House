import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/store-context';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SearchModal } from '@/components/search-modal';
import { ToastContainer } from '@/components/toast-container';
import { CartDrawer } from '@/components/cart-drawer';
import { RouteProgress, BrandIntro, PageEntrance } from '@/components/motion';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Wellness House | Modern Botanical Luxury & Daily Rituals',
  description: 'A sanctuary of botanical science, circadian metabolic balance, standardized adaptogens, and artisanal cold-process rituals.',
  openGraph: {
    title: 'The Wellness House | Modern Botanical Luxury & Daily Rituals',
    description: 'A sanctuary of botanical science, circadian metabolic balance, standardized adaptogens, and artisanal cold-process rituals.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Wellness House | Modern Botanical Luxury & Daily Rituals',
    description: 'A sanctuary of botanical science, circadian metabolic balance, standardized adaptogens, and artisanal cold-process rituals.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://thewellnesshouse.in/#organization',
      name: 'The Wellness House',
      url: 'https://thewellnesshouse.in',
      logo: 'https://thewellnesshouse.in/logo.png',
      description: 'Modern botanical wellness sanctuary, standardized metabolic protocols, and sensory apothecary rituals.',
      email: 'care@thewellnesshouse.in',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
        addressLocality: 'New Delhi',
        postalCode: '110030'
      }
    },
    {
      '@type': 'WebSite',
      '@id': 'https://thewellnesshouse.in/#website',
      url: 'https://thewellnesshouse.in',
      name: 'The Wellness House',
      description: 'Wellness, Made a Daily Ritual.',
      publisher: {
        '@id': 'https://thewellnesshouse.in/#organization'
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                  document.documentElement.classList.add('twh-intro-active');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#252A25] antialiased" suppressHydrationWarning>
        <RouteProgress />
        <StoreProvider>
          <BrandIntro />
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1">
            <PageEntrance>
              {children}
            </PageEntrance>
          </main>
          <Footer />
          <SearchModal />
          <CartDrawer />
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
