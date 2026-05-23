import { useAuthStore } from "@/store/authStore";
import {
  ApiError,
  AuthError,
  CorsError,
  NotConfiguredError,
  TimeoutError,
} from "./errors";

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  hostOverride?: string;
  tokenOverride?: string;
}

const DEFAULT_TIMEOUT = 8000;

export function joinUrl(host: string, path: string): string {
  // Allow same-origin relative hosts like "/zt" or ""
  if (!host || host === "/" || host.startsWith("/")) {
    const prefix = host && host !== "/" ? host.replace(/\/+$/, "") : "";
    return `${prefix}${path}`;
  }
  return `${host.replace(/\/+$/, "")}${path}`;
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  // Some endpoints return JSON without proper content-type
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      return JSON.parse(text);
    } catch {
      // fall through
    }
  }
  return text;
}

export async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  const { host, token } = useAuthStore.getState();
  const effectiveHost = opts.hostOverride ?? host;
  const effectiveToken = opts.tokenOverride ?? token;

  if (!effectiveHost || !effectiveToken) {
    throw new NotConfiguredError();
  }

  const url = joinUrl(effectiveHost, path);
  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  if (opts.signal) {
    opts.signal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "X-ZT1-Auth": effectiveToken,
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: "omit",
      mode: "cors",
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new TimeoutError(timeoutMs);
    }
    // Browser CORS / network failure surfaces as TypeError "Failed to fetch"
    throw new CorsError();
  }
  clearTimeout(timeoutId);

  const parsed = await readBody(res);

  if (res.status === 401 || res.status === 403) {
    throw new AuthError(res.status, parsed);
  }
  if (!res.ok) {
    throw new ApiError(res.status, parsed);
  }
  return parsed as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>("GET", path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("POST", path, body, opts),
  del: <T>(path: string, opts?: RequestOptions) =>
    request<T>("DELETE", path, undefined, opts),
};
