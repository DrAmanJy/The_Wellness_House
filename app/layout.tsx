import type { Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";
import { CustomerProvider } from "@/context/customer-context";
import { StoreProvider } from "@/context/store-context";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SearchModal } from "@/components/search-modal";
import { ToastContainer } from "@/components/toast-container";
import { CartDrawer } from "@/components/cart-drawer";
import { RouteProgress } from "@/components/motion";
import { catalog, published } from "@/server/modules/content/public";
import { jsonLd } from "@/server/modules/content/seo";
import { origin } from "@/server/security/http";
export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

const sans = localFont({
  src: "../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-sans",
  display: "swap",
});

const serif = localFont({
  src: "../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2",
  weight: "300 700",
  variable: "--font-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = (await published("site-config", "global"))?.content;
  const title = config?.title || "The Wellness House",
    description = config?.description || "Wellness, made a daily ritual.";
  const images = config?.defaultShareImage
    ? [config.defaultShareImage]
    : undefined;
  return {
    metadataBase: new URL(origin()),
    title,
    description,
    openGraph: { title, description, type: "website", images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rituals, site] = await Promise.all([
    catalog(),
    published("site-config", "global"),
  ]);
  const config = site?.content;
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <body
        style={
          config
            ? ({
                "--house-primary": config.theme.primary,
                "--house-background": config.theme.background,
                backgroundColor: config.theme.background,
              } as React.CSSProperties)
            : undefined
        }
        className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#252A25] antialiased"
        suppressHydrationWarning
      >
        {config && (
          <script
            nonce={(await headers()).get("x-nonce") || undefined}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": origin() + "/#organization",
                    name: config.title,
                    url: origin(),
                    ...(config.logo
                      ? { logo: new URL(config.logo, origin()).href }
                      : {}),
                    email: config.contactEmail,
                  },
                  {
                    "@type": "WebSite",
                    "@id": origin() + "/#website",
                    name: config.title,
                    url: origin(),
                  },
                ],
              }),
            }}
          />
        )}
        <noscript>
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important} [style*="clip-path"]{clip-path:none!important}`}</style>
        </noscript>
        {config && (
          <style>
            {`[class~="bg-[#30473B]"]{background-color:var(--house-primary)}[class~="text-[#30473B]"]{color:var(--house-primary)}[class~="bg-[#F5F1E8]"]{background-color:var(--house-background)}` +
              (config.theme.font === "sans"
                ? ".font-serif{font-family:var(--font-sans)}"
                : "") +
              (config.theme.radius === "none"
                ? '[class*="rounded"]{border-radius:0}'
                : "")}
          </style>
        )}
        <RouteProgress />
        <CustomerProvider>
          <StoreProvider initialRituals={rituals} siteConfig={config}>
            <AnnouncementBar />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <SearchModal />
            <CartDrawer />
            <ToastContainer />
          </StoreProvider>
        </CustomerProvider>
      </body>
    </html>
  );
}
