import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

import { COOKIE_CONSENT_EVENT, readCookieConsent } from "@/lib/cookie-consent";
import { syncGoogleAnalytics, trackPageView } from "@/lib/google-analytics";

function analyticsAllowed() {
  return readCookieConsent()?.preferences.analytics === true;
}

export function GoogleAnalytics() {
  const pagePath = useRouterState({
    select: (s) => `${s.location.pathname}${s.location.search}`,
  });
  const pagePathRef = useRef(pagePath);
  pagePathRef.current = pagePath;
  const lastTrackedPath = useRef(pagePath);

  useEffect(() => {
    const apply = () => {
      const allowed = analyticsAllowed();
      syncGoogleAnalytics(allowed);
      if (allowed) {
        trackPageView(pagePathRef.current);
        lastTrackedPath.current = pagePathRef.current;
      }
    };

    apply();
    window.addEventListener(COOKIE_CONSENT_EVENT, apply);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, apply);
  }, []);

  useEffect(() => {
    if (!analyticsAllowed()) return;
    if (lastTrackedPath.current === pagePath) return;
    lastTrackedPath.current = pagePath;
    trackPageView(pagePath);
  }, [pagePath]);

  return null;
}
