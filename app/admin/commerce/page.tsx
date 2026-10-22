"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { money } from "@/lib/commerce";
export default function Commerce() {
  const [data, setData] = useState<any>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      setData(await api("admin/commerce"));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Access denied");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      await load();
      setMessage("Saved and audited.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-6xl mx-auto p-6 py-12 space-y-6">
      <Link href="/admin" className="underline">
        Back to staff workspace
      </Link>
      <h1 className="font-serif text-4xl">Pricing, stock & checkout</h1>
      <p role="status">{message}</p>
      {data && (
        <>
          <p>
            Payment provider:{" "}
            {data.providerConfigured
              ? "Configured"
              : "Not configured — add server credentials before enabling orders."}
          </p>
          <form
            className="border rounded-2xl bg-white p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void run(() =>
                api("admin/commerce/settings", "PATCH", {
                  enabled: data.settings.enabled,
                  shippingMinor: String(data.settings.shipping_minor || "0"),
                  taxBasisPoints: Number(data.settings.tax_basis_points || 0),
                  postalPrefixes: data.settings.postal_prefixes,
                  version: data.settings.version,
                }).then(() => {}),
              );
            }}
          >
            <h2 className="font-serif text-2xl">Approved commercial rules</h2>
            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={data.settings.enabled}
                onChange={(e) =>
                  setData({
                    ...data,
                    settings: { ...data.settings, enabled: e.target.checked },
                  })
                }
              />
              Enable online orders after approving prices, stock and delivery
              rules
            </label>
            <label className="block">
              Shipping charge (paise)
              <input
                type="number"
                min="0"
                required
                className="border rounded p-3 block"
                value={data.settings.shipping_minor ?? ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    settings: {
                      ...data.settings,
                      shipping_minor: e.target.value,
                    },
                  })
                }
              />
            </label>
            <label className="block">
              Tax basis points (100 = 1%, exclusive of item subtotal)
              <input
                type="number"
                min="0"
                max="10000"
                required
                className="border rounded p-3 block"
                value={data.settings.tax_basis_points ?? ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    settings: {
                      ...data.settings,
                      tax_basis_points: e.target.value,
                    },
                  })
                }
              />
            </label>
            <label className="block">
              Serviceable PIN prefixes (comma-separated)
              <input
                required
                className="border rounded p-3 block w-full"
                value={data.settings.postal_prefixes.join(",")}
                onChange={(e) =>
                  setData({
                    ...data,
                    settings: {
                      ...data.settings,
                      postal_prefixes: e.target.value
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </label>
            <p className="text-xs text-[#71776F]">
              A prefix of 110 covers matching PINs; list all approved delivery
              regions explicitly. Empty coverage blocks ordering.
            </p>
            <button
              disabled={busy}
              className="bg-[#30473B] text-white rounded-xl px-5 py-3"
            >
              Save approved rules
            </button>
          </form>
          <h2 className="font-serif text-2xl">Supply variants</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {data.variants.map((v: any, index: number) => (
              <form
                key={v.id}
                className="bg-white border rounded-2xl p-5 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(() =>
                    api("admin/commerce/variants", "PATCH", {
                      id: v.id,
                      priceMinor: String(v.price_minor),
                      onHand: Number(v.on_hand),
                      active: v.active,
                      version: v.version,
                    }).then(() => {}),
                  );
                }}
              >
                <h3 className="font-medium">{v.title}</h3>
                <p className="text-xs">
                  {v.supply_code} · {v.slug}
                  <br />
                  Reserved: {v.reserved} · {money(v.price_minor)}
                </p>
                <label className="block text-sm">
                  Price (paise)
                  <input
                    required
                    min="0"
                    type="number"
                    className="border rounded p-2 block"
                    value={v.price_minor ?? ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        variants: data.variants.map((i: any, n: number) =>
                          n === index
                            ? { ...i, price_minor: e.target.value }
                            : i,
                        ),
                      })
                    }
                  />
                </label>
                <label className="block text-sm">
                  Stock on hand
                  <input
                    min={v.reserved}
                    required
                    type="number"
                    className="border rounded p-2 block"
                    value={v.on_hand}
                    onChange={(e) =>
                      setData({
                        ...data,
                        variants: data.variants.map((i: any, n: number) =>
                          n === index ? { ...i, on_hand: e.target.value } : i,
                        ),
                      })
                    }
                  />
                </label>
                <label className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={v.active}
                    onChange={(e) =>
                      setData({
                        ...data,
                        variants: data.variants.map((i: any, n: number) =>
                          n === index ? { ...i, active: e.target.checked } : i,
                        ),
                      })
                    }
                  />
                  Active
                </label>
                <button disabled={busy} className="border rounded-xl p-3">
                  Approve price & stock
                </button>
              </form>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
