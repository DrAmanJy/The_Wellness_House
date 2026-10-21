"use client";
import React from "react";
type Value =
  string | number | boolean | null | Value[] | { [key: string]: Value };
export function DocumentEditor({
  value,
  onChange,
  label = "Content",
}: {
  value: Value;
  onChange: (v: Value) => void;
  label?: string;
}) {
  const title = label.replace(/([A-Z])/g, " $1").replaceAll("_", " ");
  if (Array.isArray(value))
    return (
      <fieldset className="border rounded p-4 space-y-4">
        <legend className="px-2 capitalize font-medium">{title}</legend>
        {value.map((item, index) => (
          <div className="border-l-2 pl-3 space-y-2" key={index}>
            <DocumentEditor
              label={`${index + 1}`}
              value={item}
              onChange={(next) =>
                onChange(value.map((v, i) => (i === index ? next : v)))
              }
            />
            <button
              className="text-xs underline"
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              Remove
            </button>
            {index > 0 && (
              <button
                className="text-xs underline ml-3"
                type="button"
                onClick={() => {
                  const copy = [...value];
                  [copy[index - 1], copy[index]] = [
                    copy[index],
                    copy[index - 1],
                  ];
                  onChange(copy);
                }}
              >
                Move up
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="border rounded px-3 py-2 text-sm"
          onClick={() =>
            onChange([
              ...value,
              value.length ? structuredClone(value[value.length - 1]) : "",
            ])
          }
        >
          Add item
        </button>
      </fieldset>
    );
  if (value && typeof value === "object")
    return (
      <fieldset className="space-y-4">
        <legend className="capitalize font-medium mb-3">{title}</legend>
        {Object.entries(value).map(([key, item]) => (
          <DocumentEditor
            key={key}
            label={key}
            value={item}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ))}
      </fieldset>
    );
  if (typeof value === "boolean")
    return (
      <label className="flex gap-3 items-center capitalize">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {title}
      </label>
    );
  return (
    <label className="block text-sm capitalize">
      {title}
      {typeof value === "string" &&
      (value.length > 150 ||
        ["body", "overview", "content", "theScience", "description"].includes(
          label,
        )) ? (
        <textarea
          rows={4}
          className="block w-full border rounded p-3 mt-1 normal-case"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="block w-full border rounded p-3 mt-1 normal-case"
          type={typeof value === "number" ? "number" : "text"}
          value={value ?? ""}
          onChange={(e) =>
            onChange(
              typeof value === "number"
                ? Number(e.target.value)
                : e.target.value,
            )
          }
        />
      )}
    </label>
  );
}
