import Legacy from "./legacy";
import { published, collectionProducts } from "@/server/modules/content/public";
import { metadata } from "@/server/modules/content/seo";
import { CmsSections } from "@/components/cms-renderer";
export async function generateMetadata() {
  const r = await published("pages", "privacy-policy");
  return r
    ? metadata(r, "/privacy-policy")
    : {
        title: "privacy policy | The Wellness House",
        alternates: { canonical: "/privacy-policy" },
      };
}
export default async function Page() {
  const r = await published("pages", "privacy-policy");
  return r ? (
    <CmsSections
      sections={r.content.sections}
      products={await collectionProducts(r.revision_id)}
    />
  ) : (
    <Legacy />
  );
}
