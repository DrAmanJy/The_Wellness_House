import { notFound } from "next/navigation";
import { published, collectionProducts } from "@/server/modules/content/public";
import { metadata } from "@/server/modules/content/seo";
import { CmsSections } from "@/components/cms-renderer";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  return metadata(await published("pages", page), "/" + page);
}
export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const record = await published("pages", (await params).page);
  if (!record) notFound();
  return (
    <>
      <h1 className="max-w-7xl mx-auto px-6 pt-12 font-serif text-5xl">
        {record.content.title}
      </h1>
      <CmsSections
        sections={record.content.sections}
        products={await collectionProducts(record.revision_id)}
      />
    </>
  );
}
