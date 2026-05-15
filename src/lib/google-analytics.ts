export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID ?? "G-YR17ZB5XLC";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;

function ensureGtag() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
}

export function setGoogleAnalyticsConsent(granted: boolean) {
  if (!window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}

export function loadGoogleAnalytics() {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID || loaded) return;

  ensureGtag();

  window.gtag!("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (!document.getElementById("gtag-js")) {
    const script = document.createElement("script");
    script.id = "gtag-js";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.gtag!("js", new Date());
  window.gtag!("config", GA_MEASUREMENT_ID, { anonymize_ip: true });

  loaded = true;
}

export function trackPageView(pagePath: string) {
  if (!loaded || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: pagePath });
}

export function syncGoogleAnalytics(analyticsAllowed: boolean) {
  if (analyticsAllowed) {
    loadGoogleAnalytics();
    setGoogleAnalyticsConsent(true);
  } else if (loaded) {
    setGoogleAnalyticsConsent(false);
  }
}
