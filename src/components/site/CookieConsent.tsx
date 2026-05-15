import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  ACCEPT_ALL_PREFERENCES,
  COOKIE_CONSENT_EVENT,
  DEFAULT_PREFERENCES,
  readCookieConsent,
  writeCookieConsent,
  type CookiePreferences,
} from "@/lib/cookie-consent";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORIES: {
  key: keyof Omit<CookiePreferences, "essential">;
  title: string;
  description: string;
}[] = [
  {
    key: "analytics",
    title: "Analytics",
    description: "Helps us understand how visitors use the site so we can improve performance.",
  },
  {
    key: "personalization",
    title: "Personalization",
    description: "Remembers your preferences to tailor your experience on return visits.",
  },
  {
    key: "marketing",
    title: "Marketing",
    description: "Allows us to measure campaigns and show more relevant content.",
  },
];

function CookieConsentSwitch({
  className,
  ...props
}: React.ComponentProps<typeof Switch>) {
  return (
    <Switch
      className={cn(
        "cookie-consent-switch h-6 w-11 shrink-0 border-0 shadow-none",
        "data-[state=unchecked]:bg-neutral-600 data-[state=checked]:bg-white",
        "disabled:cursor-not-allowed disabled:opacity-100",
        "disabled:data-[state=checked]:bg-neutral-500",
        "[&>span]:h-5 [&>span]:w-5 [&>span]:bg-neutral-200 [&>span]:shadow-md",
        "data-[state=checked]:[&>span]:translate-x-5 data-[state=checked]:[&>span]:bg-neutral-950",
        "disabled:[&>span]:bg-neutral-300",
        className,
      )}
      {...props}
    />
  );
}

function ConsentButton({
  variant,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "outline" | "solid" | "reject";
}) {
  return (
    <button
      type="button"
      className={cn(
        "cookie-consent-btn w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors",
        variant === "outline" &&
          "cookie-consent-btn--outline bg-transparent text-white hover:bg-white/10",
        variant === "solid" &&
          "cookie-consent-btn--solid bg-white text-neutral-950 hover:bg-white/90",
        variant === "reject" &&
          "cookie-consent-btn--reject border-red-600/80 bg-red-600 text-white hover:bg-red-500",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function CustomizeBody({
  draft,
  onDraftChange,
  onSave,
}: {
  draft: CookiePreferences;
  onDraftChange: (next: CookiePreferences) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/15 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Essential</p>
            <p className="mt-1 text-xs text-white/70 leading-relaxed">
              Required for the site to work. These cannot be turned off.
            </p>
          </div>
          <CookieConsentSwitch checked disabled aria-readonly />
        </div>
      </div>

      {CATEGORIES.map((category) => (
        <div
          key={category.key}
          className="flex items-start justify-between gap-4 rounded-xl border border-white/15 bg-white/5 p-4"
        >
          <div>
            <p className="text-sm font-medium text-white">{category.title}</p>
            <p className="mt-1 text-xs text-white/70 leading-relaxed">{category.description}</p>
          </div>
          <CookieConsentSwitch
            checked={draft[category.key]}
            onCheckedChange={(checked) =>
              onDraftChange({ ...draft, [category.key]: checked })
            }
          />
        </div>
      ))}

      <ConsentButton variant="solid" onClick={onSave}>
        Save preferences
      </ConsentButton>
    </div>
  );
}

function CookieBanner({
  onCustomize,
  onRejectAll,
  onAcceptAll,
}: {
  onCustomize: () => void;
  onRejectAll: () => void;
  onAcceptAll: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-labelledby="cookie-settings-title"
      aria-describedby="cookie-settings-description"
      className="cookie-consent-panel pointer-events-auto w-full max-w-md rounded-3xl bg-neutral-950 p-6 text-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.55)] sm:p-7"
    >
      <h2
        id="cookie-settings-title"
        className="cookie-consent-serif text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]"
      >
        Cookie settings
      </h2>
      <p
        id="cookie-settings-description"
        className="mt-4 text-sm leading-relaxed text-white/85"
      >
        We use cookies to deliver and improve our services, analyze site usage, and if you agree,
        to customize or personalize your experience and market our services to you. You can read
        our{" "}
        <Link to="/cookies" className="underline underline-offset-2 hover:text-white">
          Cookie Policy
        </Link>{" "}
        here.
      </p>

      <div className="mt-6 space-y-3">
        <ConsentButton variant="outline" onClick={onCustomize}>
          Customize cookie settings
        </ConsentButton>
        <div className="grid grid-cols-2 gap-3">
          <ConsentButton variant="reject" onClick={onRejectAll}>
            Reject all cookies
          </ConsentButton>
          <ConsentButton variant="solid" onClick={onAcceptAll}>
            Accept all cookies
          </ConsentButton>
        </div>
      </div>
    </div>
  );
}

function CustomizeShell({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: CookiePreferences;
  onDraftChange: (next: CookiePreferences) => void;
  onSave: () => void;
}) {
  const isMobile = useIsMobile();
  const title = "Customize cookie settings";
  const description = "Choose which optional cookies we may use. Essential cookies are always active.";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="mb-0 max-h-[90vh] rounded-t-3xl border-0 bg-neutral-950 px-5 pb-6 pt-2 text-white">
          <DrawerHeader className="px-0 text-left">
            <DrawerTitle className="cookie-consent-serif text-xl text-white">{title}</DrawerTitle>
            <DrawerDescription className="text-white/70">{description}</DrawerDescription>
          </DrawerHeader>
          <CustomizeBody draft={draft} onDraftChange={onDraftChange} onSave={onSave} />
          <DrawerClose className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl border-0 bg-neutral-950 p-6 text-white sm:p-7 [&>button]:absolute [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:p-2 [&>button]:text-white/80 [&>button]:opacity-100 [&>button]:hover:bg-white/10 [&>button]:hover:text-white">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="cookie-consent-serif text-xl text-white">{title}</DialogTitle>
          <DialogDescription className="text-white/70">{description}</DialogDescription>
        </DialogHeader>
        <CustomizeBody draft={draft} onDraftChange={onDraftChange} onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [draft, setDraft] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  const applyPreferences = useCallback((preferences: CookiePreferences) => {
    writeCookieConsent(preferences);
    setVisible(false);
    setCustomizeOpen(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    const existing = readCookieConsent();
    if (existing?.decided) {
      setDraft(existing.preferences);
      return;
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    const onConsentChange = () => {
      const existing = readCookieConsent();
      if (existing?.decided) {
        setDraft(existing.preferences);
        setVisible(false);
      }
    };
    const onReopen = () => {
      const existing = readCookieConsent();
      setDraft(existing?.preferences ?? DEFAULT_PREFERENCES);
      setVisible(false);
      setCustomizeOpen(true);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    window.addEventListener("kbeauty:open-cookie-settings", onReopen);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
      window.removeEventListener("kbeauty:open-cookie-settings", onReopen);
    };
  }, []);

  if (!mounted || (!visible && !customizeOpen)) return null;

  return (
    <>
      {visible && (
        <div className="pointer-events-none fixed bottom-0 right-0 z-[60] p-4 sm:p-6">
          <CookieBanner
            onCustomize={() => {
              setDraft(readCookieConsent()?.preferences ?? DEFAULT_PREFERENCES);
              setCustomizeOpen(true);
            }}
            onRejectAll={() => applyPreferences(DEFAULT_PREFERENCES)}
            onAcceptAll={() => applyPreferences(ACCEPT_ALL_PREFERENCES)}
          />
        </div>
      )}

      <CustomizeShell
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        draft={draft}
        onDraftChange={setDraft}
        onSave={() => applyPreferences(draft)}
      />
    </>
  );
}

export function openCookieSettings() {
  window.dispatchEvent(new Event("kbeauty:open-cookie-settings"));
}
