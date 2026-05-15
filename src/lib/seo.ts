import { resolveSiteUrl } from "@/lib/site-url";

export type SitemapEntry = {
  path: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

/** Public pages included in sitemap and allowed in robots.txt. */
export const INDEXABLE_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: 1 },
  { path: "/cookies", changefreq: "monthly", priority: 0.5 },
];

export const DISALLOWED_PATHS = ["/backend"];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSitemapXml(request?: Request): string {
  const lastmod = new Date().toISOString().split("T")[0]!;
  const urls = INDEXABLE_ROUTES.map((route) => {
    const loc = escapeXml(resolveSiteUrl(route.path, request));
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function buildRobotsTxt(request?: Request): string {
  const sitemapUrl = resolveSiteUrl("/sitemap.xml", request);
  const disallow = DISALLOWED_PATHS.map((path) => `Disallow: ${path}`).join("\n");

  return `User-agent: *
Allow: /
${disallow}

Sitemap: ${sitemapUrl}
`;
}

export function canonicalLink(path: string, request?: Request) {
  return { rel: "canonical" as const, href: resolveSiteUrl(path, request) };
}

export function organizationJsonLd(request?: Request) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kbeautyretail",
    url: resolveSiteUrl("/", request),
    logo: resolveSiteUrl("/favicon.png", request),
    email: "info@kbeautyretail.com",
    description:
      "Kbeautyretail is a UAE premium Korean skincare company serving the UK and GCC beauty markets.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "AE",
    },
  };
}
