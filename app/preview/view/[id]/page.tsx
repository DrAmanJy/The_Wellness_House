import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { preview } from "@/server/modules/content/service";
import { cookieValue, origin } from "@/server/security/http";
import { session } from "@/server/security/session";
import { RitualDossier } from "@/components/ritual-dossier";
import { CmsSections } from "@/components/cms-renderer";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private preview",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const req = new Request(origin(), { headers: await headers() });
  const record = await preview(cookieValue(req, "preview"), await session(req));
  if (!record || record.id !== (await params).id) notFound();
  const c = record.content;
  return (
    <div>
      <div className="p-4 text-center bg-amber-100 sticky top-0 z-50">
        Private Preview · This link shows a fixed revision · Purchasing is
        unavailable
      </div>
      {record.kind === "products" ? (
        <RitualDossier ritual={{ ...c, id: record.id }} isPreview />
      ) : record.kind === "pages" ? (
        <CmsSections sections={c.sections} />
      ) : (
        <article className="max-w-4xl mx-auto p-8 space-y-6">
          <h1 className="text-5xl font-serif">{c.title || c.categoryName}</h1>
          <p>{c.subtitle || c.excerpt || c.description}</p>
          {c.imageUrl && <img src={c.imageUrl} alt={c.title} />}
          <p className="whitespace-pre-wrap">{c.overview || c.content}</p>
          <p className="whitespace-pre-wrap">{c.theScience}</p>
          {c.stepByStepProtocol?.map((s: any) => (
            <section key={s.step}>
              <h2>{s.title}</h2>
              <p>{s.instruction}</p>
            </section>
          ))}
        </article>
      )}
    </div>
  );
}
