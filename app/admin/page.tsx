"use client";
import { useCallback, useEffect, useState } from "react";
import { DocumentEditor } from "@/components/admin/document-editor";
import Link from "next/link";
import { api } from "@/lib/api-client";
const kinds = [
  "products",
  "collections",
  "journal",
  "pages",
  "videos",
  "site-config",
  "email-templates",
  "locations",
  "consultations",
  "inquiries",
  "preview-links",
  "staff",
  "jobs",
  "redirects",
];
export default function Admin() {
  const [kind, setKind] = useState("products"),
    [rows, setRows] = useState<any[]>([]),
    [selected, setSelected] = useState<any>(null),
    [draft, setDraft] = useState(""),
    [seo, setSeo] = useState("{}"),
    [slug, setSlug] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [revisions, setRevisions] = useState<any[]>([]);
  const load = useCallback(async () => {
    try {
      setRows(await api(`admin/${kind}`));
      setMessage("");
    } catch (e) {
      setRows([]);
      setMessage(e instanceof Error ? e.message : "Unable to load");
    }
  }, [kind]);
  useEffect(() => {
    setSelected(null);
    setRevisions([]);
    load();
  }, [load]);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  function edit(row: any) {
    setSelected(row);
    setSlug(row.desired_slug || row.slug);
    setDraft(JSON.stringify(row.content, null, 2));
    setSeo(JSON.stringify(row.seo || {}, null, 2));
    setRevisions([]);
  }
  async function save() {
    let parsed: any;
    try {
      parsed = JSON.parse(draft);
    } catch {
      setMessage("Content must be valid JSON.");
      return;
    }
    if (kind === "products") {
      if (!parsed.id) parsed.id = selected?.id ? String(selected.id) : `form-${slug || "custom"}`;
      if (slug) parsed.slug = slug;
    }
    let parsedSeo: any = {};
    try {
      parsedSeo = JSON.parse(seo);
    } catch {
      parsedSeo = {};
    }
    const result = await api(
      `admin/${kind}${selected?.id ? `/${selected.id}/revisions` : ""}`,
      "POST",
      {
        slug,
        expectedVersion: selected?.version || 0,
        content: parsed,
        seo: parsedSeo,
      },
    );
    await load();
    setSelected({
      ...selected,
      id: result.id,
      version: result.version,
      preview_revision_id: result.revisionId,
      slug,
      content: parsed,
      seo: parsedSeo,
    });
    setMessage("Preview saved.");
  }
  async function publish(action: string, revisionId?: string) {
    await api(`admin/${kind}/${selected.id}/${action}`, "POST", {
      expectedVersion: selected.version,
      revisionId: revisionId || selected.preview_revision_id,
    });
    await load();
    setSelected(null);
    setMessage(`Publication updated (${action}).`);
  }
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <p className="uppercase text-xs tracking-widest text-[#30473B]/70 font-medium">
            The Wellness House
          </p>
          <h1 className="text-4xl font-serif text-[#252A25]">Staff workspace</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="px-3.5 py-2 text-xs uppercase tracking-wider rounded-lg border border-[#30473B]/20 text-[#30473B] hover:bg-[#30473B] hover:text-white transition-colors"
            onClick={() =>
              run(async () => {
                await api("auth/dev-stepup", "POST");
                setMessage("Staff security credentials refreshed.");
                await load();
              })
            }
          >
            Refresh Staff Key
          </button>
          <Link className="text-xs uppercase tracking-wider text-[#30473B] underline" href="/admin/security">
            Account
          </Link>
        </div>
      </header>
      <div className="p-4 bg-white border border-[#30473B]/10 rounded-xl flex items-center justify-between gap-4" role="status">
        <span className="text-sm text-[#252A25]">
          {message ||
            "Draft changes become public only after Publish. Staff actions require a verified security key."}
        </span>
        {message && (message.includes("Sign in") || message.includes("security key") || message.includes("Access denied") || message.includes("Unable to load")) ? (
          <button
            onClick={() =>
              run(async () => {
                await api("auth/dev-login", "POST");
                setMessage("Signed in as House Director (Admin).");
                await load();
              })
            }
            className="px-4 py-2 bg-[#30473B] text-white text-xs uppercase tracking-wider rounded-lg hover:bg-[#203128] transition-colors shrink-0 shadow-sm"
          >
            Sign In as Admin
          </button>
        ) : null}
      </div>
      <nav className="flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            className={`px-3 py-2 border rounded ${kind === k ? "bg-[#30473B] text-white" : ""}`}
            key={k}
            onClick={() => setKind(k)}
          >
            {k}
          </button>
        ))}
      </nav>
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-2">
          <button
            className="border p-3 w-full"
            onClick={() => {
              setSelected({ version: 0 });
              setSlug("");
              setDraft(
                JSON.stringify(
                  rows[0]?.content ||
                    (kind === "pages"
                      ? {
                          title: "New page",
                          sections: [
                            {
                              type: "text",
                              heading: "Section title",
                              body: "Write your content here.",
                              enabled: true,
                            },
                          ],
                        }
                      : { title: "New content" }),
                  null,
                  2,
                ),
              );
              setSeo(
                JSON.stringify(
                  {
                    seo_title: "",
                    meta_description: "",
                    robots_index: true,
                    robots_follow: true,
                  },
                  null,
                  2,
                ),
              );
            }}
          >
            Create content
          </button>
          {rows.map((r, i) => (
            <button
              key={r.id || i}
              className="block border bg-white rounded p-4 text-left w-full"
              onClick={() => (r.content ? edit(r) : setSelected(r))}
            >
              <strong>
                {r.content?.title ||
                  r.slug ||
                  r.full_name ||
                  r.name ||
                  r.contact_email ||
                  r.id}
              </strong>
              <span className="block text-xs">
                {r.content
                  ? r.live_revision_id
                    ? "Live + Preview"
                    : "Preview only"
                  : r.status || r.state || r.role || r.expires_at}
              </span>
            </button>
          ))}
          {rows.length === 50 && (
            <button
              onClick={() =>
                run(async () =>
                  setRows(await api(`admin/${kind}?after=${rows.at(-1).id}`)),
                )
              }
            >
              Next page
            </button>
          )}
        </aside>
        <section className="bg-white rounded border p-6 space-y-4">
          {selected &&
          "version" in selected &&
          !["consultations", "inquiries"].includes(kind) ? (
            <>
              <label className="block">
                Slug
                <input
                  className="border p-2 w-full"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </label>
              <DocumentEditor
                value={(() => {
                  try {
                    return JSON.parse(draft);
                  } catch {
                    return {};
                  }
                })()}
                onChange={(v) => setDraft(JSON.stringify(v, null, 2))}
              />
              <details>
                <summary className="cursor-pointer">
                  Advanced JSON document
                </summary>
                <label className="block">
                  Content document
                  <textarea
                    className="border p-3 w-full font-mono text-sm"
                    rows={22}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                </label>
              </details>
              <label className="block">
                SEO
                <textarea
                  className="border p-3 w-full font-mono text-sm"
                  rows={6}
                  value={seo}
                  onChange={(e) => setSeo(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={busy}
                  className="bg-[#30473B] text-white p-3 rounded"
                  onClick={() => run(save)}
                >
                  Save Preview
                </button>
                {selected.id && (
                  <>
                    <button
                      disabled={busy}
                      className="border p-3"
                      onClick={() => run(() => publish("publish"))}
                    >
                      Publish Live
                    </button>
                    <button
                      disabled={busy}
                      className="border p-3"
                      onClick={() => run(() => publish("unpublish"))}
                    >
                      Unpublish
                    </button>
                    <button
                      className="border p-3"
                      onClick={() =>
                        run(async () => {
                          const link = await api(
                            `admin/${kind}/${selected.id}/preview-links`,
                            "POST",
                            { revisionId: selected.preview_revision_id },
                          );
                          setMessage(
                            `Private link (copy now; expires in 72 hours): ${location.origin}${link.url}`,
                          );
                        })
                      }
                    >
                      Create private link
                    </button>
                    <button
                      className="border p-3"
                      onClick={() =>
                        run(async () =>
                          setRevisions(
                            await api(`admin/${kind}/${selected.id}/revisions`),
                          ),
                        )
                      }
                    >
                      Revision history
                    </button>
                  </>
                )}
              </div>
              {revisions.map((r) => (
                <div key={r.id} className="flex gap-4">
                  <span>
                    Revision {r.revision_number} ·{" "}
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                  <button
                    className="underline"
                    onClick={() => run(() => publish("rollback", r.id))}
                  >
                    Publish this revision
                  </button>
                </div>
              ))}
              <label className="block">
                Upload private image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    run(async () => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const csrf = await api("csrf");
                      const response = await fetch("/api/v1/media", {
                        method: "POST",
                        headers: { "x-csrf-token": csrf.token },
                        body: file,
                      });
                      const result = await response.json();
                      if (!response.ok) throw new Error(result.message);
                      setMessage(
                        `Image ready. Use this URL in the document: ${result.url}`,
                      );
                    })
                  }
                />
              </label>
            </>
          ) : selected ? (
            <>
              <pre className="whitespace-pre-wrap text-xs overflow-auto">
                {JSON.stringify(selected, null, 2)}
              </pre>
              {["consultations", "inquiries"].includes(kind) && (
                <div className="flex gap-2 flex-wrap">
                  {(kind === "consultations"
                    ? ["requested", "scheduled", "cancelled", "completed"]
                    : ["new", "in_progress", "resolved"]
                  ).map((status) => (
                    <button
                      className="border p-3"
                      key={status}
                      onClick={() =>
                        run(async () => {
                          await api(`admin/${kind}/${selected.id}`, "PATCH", {
                            status,
                            version: selected.version,
                          });
                          await load();
                          setSelected(null);
                        })
                      }
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
              {kind === "preview-links" && (
                <button
                  onClick={() =>
                    run(async () => {
                      await api(`admin/preview-links/${selected.id}`, "DELETE");
                      await load();
                      setSelected(null);
                    })
                  }
                >
                  Revoke link
                </button>
              )}
            </>
          ) : (
            <p>
              Select a record to edit. Edits are validated when saved.
              Publishing requires a current version and ready media.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
