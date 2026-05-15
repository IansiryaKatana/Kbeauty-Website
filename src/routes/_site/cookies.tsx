import { createFileRoute, Link } from "@tanstack/react-router";

import { openCookieSettings } from "@/components/site/CookieConsent";

export const Route = createFileRoute("/_site/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy | Kbeautyretail" },
      {
        name: "description",
        content:
          "Learn how Kbeautyretail uses cookies and manage your cookie preferences.",
      },
    ],
  }),
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  return (
    <main className="pt-28 pb-16 lg:pt-32 lg:pb-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Legal</p>
        <h1 className="mt-3 text-3xl tracking-tight sm:text-4xl">Cookie Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg tracking-tight">What are cookies?</h2>
            <p className="mt-3 text-muted-foreground">
              Cookies are small text files stored on your device when you visit our website. They
              help us run the site, understand usage, and—only with your consent—personalize your
              experience or support marketing.
            </p>
          </section>

          <section>
            <h2 className="text-lg tracking-tight">How we use cookies</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Essential:</strong> Required for security and
                core functionality. Always active.
              </li>
              <li>
                <strong className="text-foreground">Analytics:</strong> Help us measure traffic and
                improve the site.
              </li>
              <li>
                <strong className="text-foreground">Personalization:</strong> Remember preferences
                for a tailored experience.
              </li>
              <li>
                <strong className="text-foreground">Marketing:</strong> Support campaign
                measurement and relevant outreach.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg tracking-tight">Managing your preferences</h2>
            <p className="mt-3 text-muted-foreground">
              You can accept all cookies, reject non-essential cookies, or customize your choices at
              any time.
            </p>
            <button
              type="button"
              onClick={openCookieSettings}
              className="mt-4 inline-flex items-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              Manage cookie settings
            </button>
          </section>

          <section>
            <h2 className="text-lg tracking-tight">Contact</h2>
            <p className="mt-3 text-muted-foreground">
              For questions about this policy, contact us via the details on our{" "}
              <Link to="/" hash="contact" className="text-primary hover:underline">
                contact section
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
