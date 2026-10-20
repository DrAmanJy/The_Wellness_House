import type { Metadata } from "next";
import type { Published } from "./public";
import { origin } from "../../security/http";
export const jsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");
export function metadata(record: Published | null, path: string): Metadata {
  if (!record)
    return { title: "Not found", robots: { index: false, follow: false } };
  const { content: c, seo: s } = record;
  const title = s.seo_title || c.title || c.categoryName,
    description =
      s.meta_description || c.subtitle || c.excerpt || c.description || "";
  const url = new URL(s.canonical_path || path, origin()).href;
  const images = s.og_image
    ? [{ url: s.og_image, alt: title }]
    : c.imageUrl
      ? [{ url: c.imageUrl, alt: title }]
      : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: {
      index: s.robots_index !== false,
      follow: s.robots_follow !== false,
    },
    openGraph: {
      title: s.og_title || title,
      description: s.og_description || description,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((i) => i.url),
    },
  };
}
