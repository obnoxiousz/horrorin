// Shared API client — the single place that knows how to talk to /api/*.
//
// How to extend (see src/lib/query-keys.ts for the key side):
// - Endpoint: add a thin function in the matching domain module under
//   src/lib/api/<domain>.ts using `api.get/post/patch/put/delete`. Every
//   /api string lives in exactly one domain module — never call fetch() in a
//   page/component. Return the response body unchanged; pages keep their shape.
// - Key: add/update the factory in src/lib/query-keys.ts (plain objects, no
//   concatenated strings).
// - Query factory: colocate queryOptions-style factories in the same domain
//   module (e.g. storyQueries), pairing the key factory with the endpoint
//   function and special options (retry/enabled) — global staleTime/gcTime
//   defaults stay in providers.tsx.
//
// The fetch lint guard applies everywhere except src/lib/api/** — that is why
// this is the only file allowed to call fetch().

export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | (string | number | boolean)[];

export type ClientOptions = {
  /** Query params — undefined/null are skipped, arrays are repeated keys. */
  params?: Record<string, QueryParamValue>;
  /** Forwarded from TanStack Query so cancelled/unmounted requests abort. */
  signal?: AbortSignal;
  /** Absolute origin override for server-side calls; empty = same-origin. */
  baseUrl?: string;
};

function buildSearch(params?: Record<string, QueryParamValue>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item === undefined || item === null) continue;
      search.append(key, String(item));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function throwFromResponse(res: Response): Promise<never> {
  let data: unknown;
  let message = res.statusText || `Request failed (${res.status})`;
  try {
    data = await res.json();
    const body = data as { error?: unknown };
    if (typeof body.error === "string" && body.error) {
      message = body.error;
    }
  } catch {
    // non-JSON error body (e.g. framework HTML 404) — keep statusText fallback
  }
  throw new ApiError(res.status, message, data);
}

async function request<T>(
  path: string,
  method: string,
  body: unknown,
  opts: ClientOptions | undefined
): Promise<T> {
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(
    `${opts?.baseUrl ?? ""}/api${path}${buildSearch(opts?.params)}`,
    {
      method,
      headers,
      credentials: "same-origin",
      signal: opts?.signal,
      body: isFormData
        ? (body as FormData)
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
    }
  );
  if (!res.ok) {
    await throwFromResponse(res);
  }
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, opts?: ClientOptions) =>
    request<T>(path, "GET", undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: ClientOptions) =>
    request<T>(path, "POST", body, opts),
  patch: <T>(path: string, body?: unknown, opts?: ClientOptions) =>
    request<T>(path, "PATCH", body, opts),
  put: <T>(path: string, body?: unknown, opts?: ClientOptions) =>
    request<T>(path, "PUT", body, opts),
  delete: <T>(path: string, opts?: ClientOptions) =>
    request<T>(path, "DELETE", undefined, opts),
};
