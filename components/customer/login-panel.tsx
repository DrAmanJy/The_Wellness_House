"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
export function LoginPanel({
  intent,
  returnPath = "/account",
}: {
  intent?: string;
  returnPath?: string;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function login(provider: string) {
    setBusy(true);
    setMessage("");
    try {
      const result = await api(`auth/${provider}`, "POST", {
        intentId: intent,
        returnPath,
      });
      window.location.assign(result.url);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sign-in failed");
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <p className="text-sm text-[#71776F]">
        Sign in securely with Google or Apple. Your selected items will be
        waiting when you return.
      </p>
      <div className="grid gap-3">
        {["google", "apple"].map((p) => (
          <button
            key={p}
            disabled={busy}
            onClick={() => login(p)}
            className="border border-[#30473B]/20 bg-[#30473B] text-white rounded-xl p-4 disabled:opacity-50"
          >
            Continue with {p === "google" ? "Google" : "Apple"}
          </button>
        ))}
      </div>
      <p role="alert" className="text-sm text-red-800">
        {message}
      </p>
      {intent && (
        <Link className="text-sm underline" href={"/account?intent=" + intent}>
          Open full sign-in page
        </Link>
      )}
      <p className="text-xs text-[#71776F]">
        Your bag is preserved if you cancel sign-in.
      </p>
    </div>
  );
}
