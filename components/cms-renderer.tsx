import Link from "next/link";
import type { z } from "zod";
import type { section } from "@/server/modules/content/schemas";
import { RitualCard } from "./ritual-card";
import type { RitualFormulation } from "@/lib/types";
export function CmsSections({
  sections,
  products = [],
}: {
  sections: z.infer<typeof section>[];
  products?: RitualFormulation[];
}) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {sections
        .filter((s) => s.enabled)
        .map((s, i) => (
          <section key={i} className="space-y-5">
            <h2 className="font-serif text-4xl">{s.heading}</h2>
            {(s.type === "text" || s.type === "hero") && (
              <p className="whitespace-pre-wrap leading-relaxed">{s.body}</p>
            )}
            {s.type === "hero" && (
              <>
                {s.image && (
                  <img
                    src={s.image}
                    alt={s.heading}
                    className="rounded-2xl w-full max-h-[550px] object-cover"
                  />
                )}
                {s.ctaPath && (
                  <Link
                    className="inline-block bg-[#30473B] text-white p-4 rounded"
                    href={s.ctaPath}
                  >
                    {s.ctaLabel || "Explore"}
                  </Link>
                )}
              </>
            )}
            {s.type === "faq" &&
              s.items.map((item, n) => (
                <details key={n} className="border-b p-4">
                  <summary>{item.question}</summary>
                  <p className="py-3 whitespace-pre-wrap">{item.answer}</p>
                </details>
              ))}
            {s.type === "products" && (
              <div className="grid md:grid-cols-3 gap-6">
                {products
                  .filter((p) => s.productIds.includes(p.id))
                  .map((p) => (
                    <RitualCard key={p.id} ritual={p} />
                  ))}
              </div>
            )}
          </section>
        ))}
    </div>
  );
}
