export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}
let csrfRequest: Promise<{ token: string }> | null = null;
let cachedCsrf: { token: string } | null = null;
async function csrfToken() {
  if (cachedCsrf) return cachedCsrf;
  if (!csrfRequest)
    csrfRequest = fetch("/api/v1/csrf", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok)
          throw new ApiError(
            "Unable to prepare secure request",
            "CSRF_UNAVAILABLE",
            r.status,
          );
        const value = await r.json();
        if (!/^[A-Za-z0-9_-]{43}$/.test(value.token))
          throw new Error("Invalid CSRF response");
        cachedCsrf = value;
        return value;
      })
      .finally(() => {
        csrfRequest = null;
      });
  return csrfRequest;
}
export async function api<T = any>(
  path: string,
  method = "GET",
  data?: unknown,
  key?: string,
  csrfRetried = false,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (method !== "GET") {
    const csrf = await csrfToken();
    headers["x-csrf-token"] = csrf.token;
    if (data !== undefined) headers["content-type"] = "application/json";
    if (key) headers["idempotency-key"] = key;
  }
  const response = await fetch(`/api/v1/${path}`, {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data),
    cache: "no-store",
  });
  const result = await response.json();
  if (
    response.status === 403 &&
    result.code === "CSRF" &&
    method !== "GET" &&
    !csrfRetried
  ) {
    cachedCsrf = null;
    return api<T>(path, method, data, key, true);
  }
  if (response.status === 401 && typeof window !== "undefined")
    window.dispatchEvent(new Event("twh-session-expired"));
  if (!response.ok)
    throw new ApiError(
      result.message || "Request failed",
      result.code,
      response.status,
    );
  return result;
}
