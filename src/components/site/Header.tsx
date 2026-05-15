import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { useSiteData } from "@/lib/site-data-context";

const links = [
  { hash: "home", label: "Home" },
  { hash: "about", label: "About" },
  { hash: "maeum", label: "Kbeautyretail" },
  { hash: "markets", label: "Markets" },
  { hash: "operations", label: "Operations" },
  { hash: "growth", label: "Growth" },
  { hash: "contact", label: "Contact" },
] as const;

function sectionHref(hash: string) {
  return `/#${hash}`;
}

export function Header() {
  const cms = useSiteData();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const logoSrc = cms.site.logoUrl?.trim() || logo;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setActiveSection("");
      return;
    }

    const updateActiveSection = () => {
      const offset = 140;
      const position = window.scrollY + offset;

      let current = "#home";
      for (const link of links) {
        const id = link.hash;
        const section = document.getElementById(id);
        if (!section) continue;
        if (section.offsetTop <= position) current = `#${id}`;
      }

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    window.addEventListener("hashchange", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, [isHome]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? "backdrop-blur-xl bg-background/75 border-b border-border/60 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoSrc} alt="Kbeautyretail" className="h-9 w-auto" />
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const href = sectionHref(l.hash);
            const isActive = isHome && activeSection === `#${l.hash}`;
            return (
              <a
                key={l.hash}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`px-4 py-2 text-sm font-normal transition-colors rounded-full ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {l.label}
              </a>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href={sectionHref("contact")}
            className="hidden sm:inline-flex items-center rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary transition-colors"
          >
            Talk To Us
          </a>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-border"
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span className="block w-5 h-px bg-foreground" />
              <span className="block w-5 h-px bg-foreground" />
            </div>
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4">
            {links.map((l) => {
              const href = sectionHref(l.hash);
              const isActive = isHome && activeSection === `#${l.hash}`;
              return (
                <a
                  key={l.hash}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-4 py-3 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {l.label}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </motion.header>
  );
}
