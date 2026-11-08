/**
 * Runtime-validated environment. Missing or malformed values are collected
 * in ENV_ERRORS so main.tsx can show a configuration screen.
 */
const errors: string[] = [];

function readUrl(name: string): string {
  const raw: unknown = import.meta.env[name];
  if (typeof raw !== "string" || raw.trim() === "") {
    errors.push(`${name} is not set`);
    return "";
  }
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
    return url.toString().replace(/\/+$/, "");
  } catch {
    errors.push(`${name} must be an absolute http(s) URL`);
    return "";
  }
}

export const APP_NAME = "Console";

export const API_URLS = {
  auth: readUrl("VITE_AUTH_API_URL"),
} as const;

export type ServiceList = keyof typeof API_URLS;

/** Console hosts the login page itself, so there is no external login URL. */
export const LOGIN_URL: string | null = null;

export const ENV_ERRORS: readonly string[] = errors;
