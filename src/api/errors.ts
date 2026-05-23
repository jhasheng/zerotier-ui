export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export class AuthError extends ApiError {
  constructor(status = 401, body: unknown = null) {
    super(status, body, "Authentication failed — token rejected by controller");
    this.name = "AuthError";
  }
}

export class CorsError extends Error {
  constructor() {
    super(
      "Browser blocked the request. ZeroTier controller does not return CORS headers. " +
        "Use a same-origin reverse proxy (see README) or the bundled dev proxy.",
    );
    this.name = "CorsError";
  }
}

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Request timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

export class NotConfiguredError extends Error {
  constructor() {
    super("Controller host / token not configured");
    this.name = "NotConfiguredError";
  }
}

export function isAuthError(e: unknown): e is AuthError {
  return e instanceof AuthError;
}

export function isCorsError(e: unknown): e is CorsError {
  return e instanceof CorsError;
}

export function describeError(e: unknown): string {
  if (e instanceof ApiError) {
    const detail =
      typeof e.body === "string"
        ? e.body
        : e.body && typeof e.body === "object"
          ? JSON.stringify(e.body)
          : "";
    return detail ? `${e.message}: ${detail}` : e.message;
  }
  if (e instanceof Error) return e.message;
  return String(e);
}
