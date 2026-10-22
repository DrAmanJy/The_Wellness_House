import Legacy from "./legacy";
import { published, collectionProducts } from "@/server/modules/content/public";
import { metadata } from "@/server/modules/content/seo";
import { CmsSections } from "@/components/cms-renderer";
export async function generateMetadata() {
  const r = await published("pages", "ingredients");
  return r
    ? metadata(r, "/ingredients")
    : {
        title: "ingredients | The Wellness House",
        alternates: { canonical: "/ingredients" },
      };
}
export default async function Page() {
  const r = await published("pages", "ingredients");
  return r ? (
    <CmsSections
      sections={r.content.sections}
      products={await collectionProducts(r.revision_id)}
    />
  ) : (
    <Legacy />
  );
}
