import { origin } from "@/server/security/http";
export const dynamic = "force-dynamic";
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/api", "/consultation"],
    },
    sitemap: origin() + "/sitemap.xml",
  };
}
