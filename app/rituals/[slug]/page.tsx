import { RitualDossier } from "@/components/ritual-dossier";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  ShieldCheck,
  Check,
  Sparkles,
  MapPin,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Compass,
} from "lucide-react";
import { published, products } from "@/server/modules/content/public";
import { metadata, jsonLd } from "@/server/modules/content/seo";
import { origin } from "@/server/security/http";
export const dynamic = "force-dynamic";
import { EditorialImage } from "@/components/editorial-image";
import { RitualCard } from "@/components/ritual-card";
import { RitualDetailInteractive } from "./interactive-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadata(await published("products", slug), `/rituals/${slug}`);
}

export default async function RitualDetailPage({ params }: Props) {
  const { slug } = await params;
  const record = await published("products", slug);
  const ritual = record
    ? ({
        ...record.content,
        id: record.id,
        slug: record.slug,
      } as import("@/lib/types").RitualFormulation)
    : null;

  if (!ritual) {
    notFound();
  }

  const related = (await products())
    .filter((r) => r.id !== ritual.id)
    .slice(0, 3);

  return (
    <>
      <script
        nonce={(await headers()).get("x-nonce") || undefined}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            name: ritual.title,
            description: ritual.subtitle,
            url: origin() + "/rituals/" + slug,
          }),
        }}
      />
      <RitualDossier ritual={ritual} related={related} />
    </>
  );
}
