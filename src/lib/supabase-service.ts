import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env-server";

let _serviceClient: SupabaseClient | null = null;
let _authClient: SupabaseClient | null = null;

function supabaseUrl(): string | undefined {
  return getServerEnv("SUPABASE_URL");
}

export function getSupabaseService(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = getServerEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  if (!_serviceClient)
    _serviceClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _serviceClient;
}

/** Public anon client — used for Supabase Auth sign-in on /backend */
export function getSupabaseAuth(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = getServerEnv("SUPABASE_ANON_KEY");
  if (!url || !key) return null;
  if (!_authClient)
    _authClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _authClient;
}

const ACCESS_COOKIE = "sb_access_token";
const REFRESH_COOKIE = "sb_refresh_token";

async function authCookieOptions() {
  const { getRequestProtocol } = await import("@tanstack/react-start/server");
  const secure = getRequestProtocol({ xForwardedProto: true }) === "https";
  return { path: "/", httpOnly: true, sameSite: "lax" as const, secure };
}

export async function setSupabaseAuthCookies(accessToken: string, refreshToken: string) {
  const { setCookie } = await import("@tanstack/react-start/server");
  const base = await authCookieOptions();
  setCookie(ACCESS_COOKIE, accessToken, { ...base, maxAge: 60 * 60 * 24 * 7 });
  setCookie(REFRESH_COOKIE, refreshToken, { ...base, maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSupabaseAuthCookies() {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  const base = await authCookieOptions();
  deleteCookie(ACCESS_COOKIE, base);
  deleteCookie(REFRESH_COOKIE, base);
}

/** Returns the signed-in Supabase user from the admin cookie, or null. */
export async function getSupabaseAdminUser(): Promise<User | null> {
  const { getCookie } = await import("@tanstack/react-start/server");
  const token = getCookie(ACCESS_COOKIE);
  if (!token) return null;
  const sb = getSupabaseAuth();
  if (!sb) return null;
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
