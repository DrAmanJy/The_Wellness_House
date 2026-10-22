"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
export default function Requests() {
  const [rows, setRows] = useState<any[]>([]),
    [error, setError] = useState("");
  async function load() {
    try {
      setRows(await api("admin/customer-requests"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Access denied");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <div className="max-w-5xl mx-auto p-6 py-12 space-y-5">
      <Link href="/admin" className="underline">
        Back to workspace
      </Link>
      <h1 className="font-serif text-4xl">Customer privacy requests</h1>
      <p>
        Review retention requirements and complete the requested export or
        deletion before marking a request completed. Status changes alone do not
        erase records.
      </p>
      <p role="alert">{error}</p>
      {rows.map((r) => (
        <article
          key={r.id}
          className="bg-white border rounded-2xl p-6 space-y-3"
        >
          <h2>
            {r.display_name} · {r.contact_email}
          </h2>
          <p>
            {r.kind} · {r.status} · {new Date(r.created_at).toLocaleString()}
          </p>
          <label>
            Status
            <select
              value={r.status}
              className="border rounded p-2 ml-3"
              onChange={async (e) => {
                try {
                  await api("admin/customer-requests/" + r.id, "PATCH", {
                    status: e.target.value,
                  });
                  await load();
                } catch (error) {
                  setError(
                    error instanceof Error ? error.message : "Unable to save",
                  );
                }
              }}
            >
              {["requested", "processing", "completed", "rejected"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </article>
      ))}
    </div>
  );
}
