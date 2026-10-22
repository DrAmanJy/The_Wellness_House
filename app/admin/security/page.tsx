"use client";
import { useState } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import Link from "next/link";
import { useCustomer } from "@/context/customer-context";
import { LoginPanel } from "@/components/customer/login-panel";
import { api } from "@/lib/api-client";
export default function StaffSecurity() {
  const { customer, status } = useCustomer(),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function key(register: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const mode = register ? "register" : "verify",
        optionsJSON = await api(`mfa/${mode}/options`, "POST");
      const response = register
        ? await startRegistration({ optionsJSON })
        : await startAuthentication({ optionsJSON });
      await api(`mfa/${mode}/verify`, "POST", { response });
      setMessage(
        "Security key verified. Staff access is active for 15 minutes.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-xl mx-auto p-8 py-16 space-y-5">
      <h1 className="font-serif text-4xl">Staff security</h1>
      <p role="status">{message}</p>
      {status === "loading" ? (
        <p>Checking session…</p>
      ) : !customer ? (
        <LoginPanel returnPath="/admin/security" />
      ) : !customer.roles.length ? (
        <p>This workspace is available to authorized staff.</p>
      ) : (
        <>
          <p>
            Use a passkey or security key to enroll or confirm staff access.
          </p>
          <div className="flex gap-4">
            <button
              disabled={busy}
              className="border p-3 rounded-xl"
              onClick={() => key(true)}
            >
              Enroll security key
            </button>
            <button
              disabled={busy}
              className="bg-[#30473B] text-white p-3 rounded-xl"
              onClick={() => key(false)}
            >
              Verify security key
            </button>
          </div>
          <Link href="/admin" className="underline">
            Open staff workspace
          </Link>
          <details>
            <summary>Sign in again</summary>
            <LoginPanel returnPath="/admin/security" />
          </details>
        </>
      )}
    </div>
  );
}
