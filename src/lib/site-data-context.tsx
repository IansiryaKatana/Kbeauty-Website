import { createContext, useContext, type ReactNode } from "react";
import type { PublicSiteData } from "@/lib/cms-types";

const SiteDataContext = createContext<PublicSiteData | null>(null);

export function SiteDataProvider({
  value,
  children,
}: {
  value: PublicSiteData;
  children: ReactNode;
}) {
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): PublicSiteData {
  const v = useContext(SiteDataContext);
  if (!v) {
    throw new Error("useSiteData must be used within SiteDataProvider");
  }
  return v;
}
