"use client";
import { useEffect, useState } from "react";
import { useCustomer } from "@/context/customer-context";
import { api } from "@/lib/api-client";
import { LoginPanel } from "@/components/customer/login-panel";
export default function Verify() {
  const { customer, status, refresh } = useCustomer(),
    [token, setToken] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setToken(new URLSearchParams(location.hash.slice(1)).get("token") || "");
    history.replaceState(null, "", "/account/verify-contact");
  }, []);
  return (
    <div className="max-w-lg mx-auto p-8 py-16 space-y-5">
      <h1 className="font-serif text-3xl">Verify contact email</h1>
      <p role="status">{message}</p>
      {status === "loading" ? (
        <p>Checking session…</p>
      ) : !customer ? (
        <>
          <p>Sign in, then reopen the verification link from your email.</p>
          <LoginPanel returnPath="/account/verify-contact" />
        </>
      ) : (
        <button
          disabled={busy || !token}
          className="bg-[#30473B] text-white rounded-xl p-4"
          onClick={async () => {
            setBusy(true);
            try {
              await api("me/verify-contact", "POST", { token });
              setMessage("Your contact email is verified.");
              setToken("");
              await refresh();
            } catch (e) {
              setMessage(
                e instanceof Error ? e.message : "Verification failed",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          Confirm my contact email
        </button>
      )}
    </div>
  );
}
