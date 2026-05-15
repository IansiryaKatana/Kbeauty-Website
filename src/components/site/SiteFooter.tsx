import logo from "@/assets/logo.png";
import { openCookieSettings } from "@/components/site/CookieConsent";
import { useSiteData } from "@/lib/site-data-context";

export function SiteFooter() {
  const cms = useSiteData();
  const logoSrc = cms.site.logoUrl?.trim() || logo;
  const mailHref = `mailto:${cms.contact.email}`;
  const telHref = `tel:${cms.contact.phone.replace(/\s/g, "")}`;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <img src={logoSrc} alt="K Beauty Retail" className="h-10 w-auto" />
          <p className="mt-5 text-sm text-muted-foreground max-w-md leading-relaxed">
            Kbeautyretail — a UAE premium Korean skincare company for the UK and GCC markets.
          </p>
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 gap-8">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Explore
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="/#about" className="hover:text-primary">
                  About
                </a>
              </li>
              <li>
                <a href="/#maeum" className="hover:text-primary">
                  Kbeautyretail
                </a>
              </li>
              <li>
                <a href="/#markets" className="hover:text-primary">
                  Markets
                </a>
              </li>
              <li>
                <a href="/#operations" className="hover:text-primary">
                  Operations
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Contact
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href={mailHref} className="hover:text-primary">
                  {cms.contact.email}
                </a>
              </li>
              <li>
                <a href={telHref} className="hover:text-primary">
                  {cms.contact.phone}
                </a>
              </li>
              <li>{cms.contact.address}</li>
            </ul>
          </div>
        </div>
        <div className="lg:col-span-3 flex flex-col items-start lg:items-end justify-between">
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <a href="/cookies" className="hover:text-primary">
              Cookie Policy
            </a>
            <button
              type="button"
              onClick={openCookieSettings}
              className="hover:text-primary text-left"
            >
              Cookie settings
            </button>
            <p className="w-full sm:w-auto">
              © {new Date().getFullYear()} K Beauty Retail FZE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
