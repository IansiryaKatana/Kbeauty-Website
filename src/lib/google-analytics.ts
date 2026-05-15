export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID ?? "G-YR17ZB5XLC";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Inline bootstrap — consent default must run before gtag('config'). */
export function gtagInlineInitScript(): string {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
`.trim();
}

/** Head scripts for SSR so Google Tag Assistant can detect the tag on first load. */
export function gaHeadScripts(): Array<{
  src?: string;
  async?: boolean;
  children?: string;
}> {
  if (!GA_MEASUREMENT_ID) return [];

  return [
    {
      src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
      async: true,
    },
    {
      children: gtagInlineInitScript(),
    },
  ];
}

export function setGoogleAnalyticsConsent(granted: boolean) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}

export function syncGoogleAnalytics(analyticsAllowed: boolean) {
  setGoogleAnalyticsConsent(analyticsAllowed);
}

export function trackPageView(pagePath: string) {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: pagePath });
}
