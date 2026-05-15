/** Server-only env (createServerFn handlers, loaders). */
export function getServerEnv(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env && typeof process.env[key] === "string") {
    return process.env[key];
  }
  try {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    if (env?.[key]) return env[key];
    // Vite exposes VITE_* to import.meta.env (e.g. VITE_SUPABASE_ANON_KEY)
    const viteKey = `VITE_${key}`;
    if (env?.[viteKey]) return env[viteKey];
    if (key === "SUPABASE_URL" && env?.VITE_SUPABASE_URL) return env.VITE_SUPABASE_URL;
    if (key === "SUPABASE_ANON_KEY" && env?.VITE_SUPABASE_ANON_KEY) return env.VITE_SUPABASE_ANON_KEY;
  } catch {
    return undefined;
  }
  return undefined;
}

export function requireServerEnv(key: string): string {
  const v = getServerEnv(key);
  if (!v) throw new Error(`Missing required environment variable: ${key}`);
  return v;
}
