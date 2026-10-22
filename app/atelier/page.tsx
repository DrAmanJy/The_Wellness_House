import Legacy from "./legacy";
import { published, collectionProducts } from "@/server/modules/content/public";
import { metadata } from "@/server/modules/content/seo";
import { CmsSections } from "@/components/cms-renderer";
export async function generateMetadata() {
  const r = await published("pages", "atelier");
  return r
    ? metadata(r, "/atelier")
    : {
        title: "atelier | The Wellness House",
        alternates: { canonical: "/atelier" },
      };
}
export default async function Page() {
  const r = await published("pages", "atelier");
  return r ? (
    <CmsSections
      sections={r.content.sections}
      products={await collectionProducts(r.revision_id)}
    />
  ) : (
    <Legacy />
  );
}
