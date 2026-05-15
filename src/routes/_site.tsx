import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Header } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteDataProvider } from "@/lib/site-data-context";
import { getPublicSiteData } from "@/server/kbeauty-rpc";

export const Route = createFileRoute("/_site")({
  loader: () => getPublicSiteData(),
  component: SiteLayout,
});

function SiteLayout() {
  const cms = Route.useLoaderData();

  return (
    <SiteDataProvider value={cms}>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <Outlet />
        <SiteFooter />
      </div>
    </SiteDataProvider>
  );
}
