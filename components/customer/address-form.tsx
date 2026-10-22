"use client";
import { useState } from "react";
export const emptyAddress = {
  label: "Home",
  recipient: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  region: "",
  postal_code: "",
  country_code: "IN",
};
export function AddressForm({
  initial = emptyAddress,
  onSubmit,
  submitLabel = "Save address",
  children,
  onDirty,
}: {
  initial?: any;
  onSubmit: (address: any) => Promise<void>;
  submitLabel?: string;
  children?: React.ReactNode;
  onDirty?: () => void;
}) {
  const [address, setAddress] = useState({ ...emptyAddress, ...initial }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const fields: Record<string, string> = {
    label: "Label (Home, Work or custom)",
    recipient: "Recipient name",
    phone: "Delivery phone",
    line1: "House / street address",
    line2: "Apartment / area (optional)",
    landmark: "Landmark (optional)",
    city: "City",
    region: "State / region",
    postal_code: "PIN code",
  };
  return (
    <form
      className="space-y-4"
      onChange={() => onDirty?.()}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const value = Object.fromEntries(
            Object.keys(emptyAddress).map((k) => [k, address[k]]),
          );
          await onSubmit(value);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unable to save address");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        {Object.entries(fields).map(([key, label]) => (
          <label
            key={key}
            className={`text-sm ${key === "line1" ? "sm:col-span-2" : ""}`}
          >
            {label}
            <input
              required={!["line2", "landmark"].includes(key)}
              autoComplete={
                key === "recipient"
                  ? "name"
                  : key === "phone"
                    ? "tel"
                    : key === "postal_code"
                      ? "postal-code"
                      : key === "line1"
                        ? "address-line1"
                        : key === "line2"
                          ? "address-line2"
                          : key === "city"
                            ? "address-level2"
                            : key === "region"
                              ? "address-level1"
                              : "off"
              }
              type={key === "phone" ? "tel" : "text"}
              inputMode={key === "postal_code" ? "numeric" : undefined}
              pattern={key === "postal_code" ? "[1-9][0-9]{5}" : undefined}
              maxLength={key === "postal_code" ? 6 : key === "phone" ? 20 : 200}
              className="mt-1 w-full border border-[#30473B]/20 rounded-xl p-3 bg-white"
              value={address[key]}
              onChange={(e) =>
                setAddress({ ...address, [key]: e.target.value })
              }
            />
          </label>
        ))}
      </div>
      <p className="text-sm text-[#71776F]">
        Country: India · Delivery availability is checked at checkout.
      </p>
      {children}
      <p role="alert" className="text-sm text-red-800">
        {error}
      </p>
      <button
        disabled={busy}
        className="bg-[#30473B] text-white px-6 py-3 rounded-xl disabled:opacity-50"
      >
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
