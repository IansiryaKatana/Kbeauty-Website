export const COOKIE_CONSENT_KEY = "kbeauty_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "kbeauty:cookie-consent";

export type CookieCategory = "analytics" | "personalization" | "marketing";

export type CookiePreferences = {
  essential: true;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
};

export type CookieConsentState = {
  decided: boolean;
  preferences: CookiePreferences;
  updatedAt: string;
};

export const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  personalization: false,
  marketing: false,
};

export const ACCEPT_ALL_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: true,
  personalization: true,
  marketing: true,
};

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (!parsed?.preferences) return null;
    return {
      decided: Boolean(parsed.decided),
      preferences: { ...DEFAULT_PREFERENCES, ...parsed.preferences, essential: true },
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeCookieConsent(preferences: CookiePreferences) {
  const state: CookieConsentState = {
    decided: true,
    preferences: { ...preferences, essential: true },
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_EVENT, { detail: state }),
  );
  return state;
}

export function hasCookieConsent(): boolean {
  return readCookieConsent()?.decided === true;
}
