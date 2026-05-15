const DEFAULT_SITE_URL = "https://kbeautyretail.com";

function readEnvSiteUrl(): string | undefined {
  try {
    const vite = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    const fromVite = vite?.VITE_SITE_URL?.trim();
    if (fromVite) return fromVite.replace(/\/+$/, "");
  } catch {
    /* import.meta unavailable */
  }

  if (typeof process !== "undefined" && process.env) {
    const fromProcess = process.env.VITE_SITE_URL?.trim() || process.env.SITE_URL?.trim();
    if (fromProcess) return fromProcess.replace(/\/+$/, "");
  }

  return undefined;
}

/** Production / canonical base URL (no trailing slash). */
export function getSiteUrl(request?: Request): string {
  const configured = readEnvSiteUrl();
  if (configured) return configured;

  if (request) {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }

  return DEFAULT_SITE_URL;
}

/** Absolute URL for a site path (`/` or `/cookies`). */
export function resolveSiteUrl(path: string, request?: Request): string {
  const base = getSiteUrl(request);
  if (path === "/" || path === "") return `${base}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
