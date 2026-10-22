import Legacy from "./legacy";
import { published, collectionProducts } from "@/server/modules/content/public";
import { metadata } from "@/server/modules/content/seo";
import { CmsSections } from "@/components/cms-renderer";
export async function generateMetadata() {
  const r = await published("pages", "terms-and-conditions");
  return r
    ? metadata(r, "/terms-and-conditions")
    : {
        title: "terms and conditions | The Wellness House",
        alternates: { canonical: "/terms-and-conditions" },
      };
}
export default async function Page() {
  const r = await published("pages", "terms-and-conditions");
  return r ? (
    <CmsSections
      sections={r.content.sections}
      products={await collectionProducts(r.revision_id)}
    />
  ) : (
    <Legacy />
  );
}
