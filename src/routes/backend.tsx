import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { LogIn, LogOut, RefreshCw, Save } from "lucide-react";
import logo from "@/assets/logo.png";
import type { AdminSettingsBundle, SettingKey } from "@/lib/cms-types";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import type { AuthUserRow } from "@/lib/cms-types";
import {
  adminLogin,
  adminLogout,
  getAdminSession,
  getAdminSettingsBundle,
  getEmailDeliveryStatus,
  listAuthUsers,
  listContactSubmissions,
  markContactSubmissions,
  saveAdminSetting,
  sendTestEmail,
} from "@/server/kbeauty-rpc";

type SubmissionRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  inquiry_type: string;
  message: string;
  read_at: string | null;
  source: string | null;
};

export const Route = createFileRoute("/backend")({
  loader: async () => {
    const session = await getAdminSession();
    if (!session.authenticated) {
      return {
        session,
        settings: null as AdminSettingsBundle | null,
        rows: [] as SubmissionRow[],
        users: [] as AuthUserRow[],
        emailStatus: null,
      };
    }
    const [bundle, list, usersRes, emailStatus] = await Promise.all([
      getAdminSettingsBundle(),
      listContactSubmissions(),
      listAuthUsers(),
      getEmailDeliveryStatus(),
    ]);
    return {
      session,
      settings: bundle.ok ? bundle.settings : null,
      rows: list.ok ? list.rows : [],
      users: usersRes.ok ? usersRes.users : ([] as AuthUserRow[]),
      emailStatus: emailStatus.ok ? emailStatus : null,
    };
  },
  head: () => ({
    meta: [{ title: "Admin · K Beauty Retail" }, { name: "robots", content: "noindex" }],
  }),
  component: Backend,
});

type TabId =
  | "submissions"
  | "site"
  | "contact"
  | "images"
  | "seo"
  | "email_smtp"
  | "email_templates"
  | "admin_users";

function Backend() {
  const router = useRouter();
  const loaderData = Route.useLoaderData();
  const { session, settings: loadedSettings, rows: loadedRows, users: authUsers, emailStatus } =
    loaderData;

  const loginFn = useServerFn(adminLogin);
  const logoutFn = useServerFn(adminLogout);
  const saveSettingFn = useServerFn(saveAdminSetting);
  const markFn = useServerFn(markContactSubmissions);
  const testEmailFn = useServerFn(sendTestEmail);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [tab, setTab] = useState<TabId>("submissions");
  /** Local edits on top of loader snapshot; cleared after successful save or router refresh. */
  const [settingsDraft, setSettingsDraft] = useState<AdminSettingsBundle | null>(null);
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const settings = settingsDraft ?? loadedSettings;
  const rows = loadedRows;

  const refresh = () => void router.invalidate();

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    const res = await loginFn({ data: { email, password } });
    if (!res.ok) {
      const map: Record<string, string> = {
        INVALID_CREDENTIALS: "Invalid email or password. Use your Supabase Authentication user.",
        AUTH_NOT_CONFIGURED:
          "Add SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_SUPABASE_*) to your .env file.",
      };
      setLoginErr(map[res.error] ?? "Sign in failed.");
      return;
    }
    toast.success("Signed in");
    setPassword("");
    await router.invalidate();
  };

  const onLogout = async () => {
    await logoutFn();
    toast.success("Signed out");
    setSettingsDraft(null);
    await router.invalidate();
  };

  const saveKey = async (key: SettingKey, value: unknown) => {
    setSaving(true);
    try {
      const res = await saveSettingFn({ data: { key, value } });
      if (!res.ok) {
        if (res.error === "UNAUTHORIZED") await router.invalidate();
        else toast.error("Save failed.");
        return;
      }
      toast.success("Saved");
      setSettingsDraft(null);
      await router.invalidate();
    } finally {
      setSaving(false);
    }
  };

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  if (!session.authenticated) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/40 p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-4">
            <img src={logo} alt="" className="h-9 w-auto shrink-0" />
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-primary whitespace-nowrap"
            >
              Back to website
            </Link>
          </div>
          <h1 className="mt-6 text-2xl tracking-tight">Admin Sign In</h1>
          <p className="mt-1 text-sm text-muted-foreground">K Beauty Retail backend</p>
          <form onSubmit={onLogin} className="mt-6 space-y-4">
            <input
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Email"
              autoComplete="username"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
            {loginErr ? <p className="text-xs text-destructive">{loginErr}</p> : null}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:bg-primary transition-colors"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          </form>
          <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
            Sign in with the same email and password as your user in{" "}
            <strong className="font-medium text-foreground/80">Supabase → Authentication</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (!loadedSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-6 text-sm text-muted-foreground">
        Could not load settings. Check Supabase environment variables and try signing in again.
      </div>
    );
  }

  const patchSettings = (reducer: (b: AdminSettingsBundle) => AdminSettingsBundle) => {
    setSettingsDraft((p) => reducer(p ?? loadedSettings));
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "submissions", label: "Form Submissions" },
    { id: "site", label: "Site Settings" },
    { id: "contact", label: "Contact" },
    { id: "images", label: "Images" },
    { id: "seo", label: "SEO" },
    { id: "email_smtp", label: "Email (Zoho / SMTP)" },
    { id: "email_templates", label: "Email Templates" },
    { id: "admin_users", label: "Admin Users" },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-background border-b border-border">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="" className="h-7 w-auto shrink-0" />
            <span className="text-sm text-muted-foreground truncate">Admin</span>
            {session.email ? (
              <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                {session.email}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              Back to website
            </Link>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl tracking-tight">Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage site content, SEO, email templates, Zoho SMTP fields, and contact inquiries.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-border bg-background px-4 py-2 text-sm hover:border-primary/50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm transition-colors ${
                tab === t.id
                  ? "bg-foreground text-background"
                  : "bg-card border border-border hover:border-primary/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          {tab === "submissions" ? (
            <SubmissionsPanel
              rows={rows}
              loading={false}
              selected={selected}
              setSelected={setSelected}
              onReload={() => refresh()}
              onMarkRead={async (read) => {
                if (!selectedIds.length) {
                  toast.message("Select at least one row.");
                  return;
                }
                const res = await markFn({ data: { ids: selectedIds, read } });
                if (!res.ok) {
                  toast.error("Update failed.");
                  return;
                }
                toast.success(read ? "Marked as read" : "Marked as unread");
                setSelected({});
                await router.invalidate();
              }}
              selectedIds={selectedIds}
            />
          ) : null}

          {tab === "site" ? (
            <SitePanel
              draft={settings.site}
              onChange={(next) => patchSettings((b) => ({ ...b, site: next }))}
              saving={saving}
              onSave={() => void saveKey("site", settings.site)}
            />
          ) : null}

          {tab === "contact" ? (
            <JsonFieldsPanel
              title="Contact Information"
              draft={settings.contact}
              onChange={(next) => patchSettings((b) => ({ ...b, contact: next }))}
              saving={saving}
              onSave={() => void saveKey("contact", settings.contact)}
            />
          ) : null}

          {tab === "images" ? (
            <ImagesPanel
              draft={settings.images}
              onChange={(next) => patchSettings((b) => ({ ...b, images: next }))}
              saving={saving}
              onSave={() => void saveKey("images", settings.images)}
            />
          ) : null}

          {tab === "seo" ? (
            <SeoPanel
              draft={settings.seo}
              onChange={(next) => patchSettings((b) => ({ ...b, seo: next }))}
              saving={saving}
              onSave={() => void saveKey("seo", settings.seo)}
            />
          ) : null}

          {tab === "email_smtp" ? (
            <SmtpPanel
              draft={settings.email_smtp}
              onChange={(next) => patchSettings((b) => ({ ...b, email_smtp: next }))}
              saving={saving}
              onSave={() => void saveKey("email_smtp", settings.email_smtp)}
              emailStatus={emailStatus}
              onTestEmail={async (to) => {
                const res = await testEmailFn({ data: to ? { to } : {} });
                if (!res.ok) {
                  const map: Record<string, string> = {
                    EMAIL_NOT_CONFIGURED:
                      "Set Zoho SMTP in admin + ZOHO_SMTP_PASSWORD in .env (or Resend fallback).",
                    ZOHO_SMTP_FAILED:
                      "Zoho SMTP failed. Check app password, host/port, and From address.",
                    RESEND_NOT_CONFIGURED: "Zoho failed and Resend is not configured.",
                  };
                  toast.error(
                    map[res.error] ??
                      ("message" in res && res.message ? res.message : "Test email failed."),
                  );
                  return;
                }
                const via = "provider" in res && res.provider === "resend" ? "Resend" : "Zoho";
                toast.success(`Test email sent via ${via} to ${res.to}`);
              }}
            />
          ) : null}

          {tab === "email_templates" ? (
            <TemplatesPanel
              draft={settings.email_templates}
              onChange={(next) => patchSettings((b) => ({ ...b, email_templates: next }))}
              saving={saving}
              onSave={() => void saveKey("email_templates", settings.email_templates)}
            />
          ) : null}

          {tab === "admin_users" && session.userId ? (
            <AdminUsersPanel
              users={authUsers}
              currentUserId={session.userId}
              onChanged={refresh}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function SubmissionsPanel({
  rows,
  loading,
  selected,
  setSelected,
  onReload,
  onMarkRead,
  selectedIds,
}: {
  rows: Array<{
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    inquiry_type: string;
    message: string;
    read_at: string | null;
    source: string | null;
  }>;
  loading: boolean;
  selected: Record<string, boolean>;
  setSelected: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onReload: () => void;
  onMarkRead: (read: boolean) => void | Promise<void>;
  selectedIds: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-medium">Form Submissions</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReload}
            className="rounded-full border border-border px-4 py-2 text-xs hover:border-primary/40"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => onMarkRead(true)}
            className="rounded-full bg-foreground text-background px-4 py-2 text-xs hover:bg-primary"
          >
            Mark read
          </button>
          <button
            type="button"
            onClick={() => onMarkRead(false)}
            className="rounded-full border border-border px-4 py-2 text-xs hover:border-primary/40"
          >
            Mark unread
          </button>
        </div>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm min-w-[720px]">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3 w-10">
                <span className="sr-only">Select</span>
              </th>
              <th className="p-3">Date</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Type</th>
              <th className="p-3">Read</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={!!selected[r.id]}
                    onChange={(e) =>
                      setSelected((prev) => ({
                        ...prev,
                        [r.id]: e.target.checked,
                      }))
                    }
                  />
                </td>
                <td className="p-3 whitespace-nowrap text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">
                  <a href={`mailto:${r.email}`} className="text-primary hover:underline">
                    {r.email}
                  </a>
                </td>
                <td className="p-3">{r.inquiry_type}</td>
                <td className="p-3">{r.read_at ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No submissions yet.</p>
        ) : null}
      </div>
      {rows.length > 0 ? (
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer text-foreground">
            Show messages (selected: {selectedIds.length})
          </summary>
          <ul className="mt-3 space-y-3">
            {rows.map((r) => (
              <li key={`m-${r.id}`} className="rounded-lg border border-border p-3 bg-background">
                <div className="text-xs text-muted-foreground mb-1">{r.email}</div>
                <p className="whitespace-pre-wrap text-foreground">{r.message}</p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function SitePanel({
  draft,
  onChange,
  saving,
  onSave,
}: {
  draft: AdminSettingsBundle["site"];
  onChange: (v: AdminSettingsBundle["site"]) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-lg font-medium">Site Settings</h2>
      <Field
        label="Logo URL"
        value={draft.logoUrl ?? ""}
        onChange={(v) => onChange({ ...draft, logoUrl: v || null })}
      />
      <Field
        label="Favicon URL"
        value={draft.faviconUrl ?? ""}
        onChange={(v) => onChange({ ...draft, faviconUrl: v || null })}
      />
      <Field
        label="Primary color (CSS)"
        value={draft.primaryColor ?? ""}
        onChange={(v) => onChange({ ...draft, primaryColor: v || null })}
      />
      <Field
        label="Instagram URL"
        value={draft.social?.instagram ?? ""}
        onChange={(v) => onChange({ ...draft, social: { ...draft.social, instagram: v } })}
      />
      <Field
        label="LinkedIn URL"
        value={draft.social?.linkedin ?? ""}
        onChange={(v) => onChange({ ...draft, social: { ...draft.social, linkedin: v } })}
      />
      <Field
        label="TikTok URL"
        value={draft.social?.tiktok ?? ""}
        onChange={(v) => onChange({ ...draft, social: { ...draft.social, tiktok: v } })}
      />
      <Field
        label="Hero eyebrow"
        value={draft.heroEyebrow ?? ""}
        onChange={(v) => onChange({ ...draft, heroEyebrow: v })}
      />
      <Field
        label="Hero title line 1"
        value={draft.heroTitleLine1 ?? ""}
        onChange={(v) => onChange({ ...draft, heroTitleLine1: v })}
      />
      <Field
        label="Hero title line 2"
        value={draft.heroTitleLine2 ?? ""}
        onChange={(v) => onChange({ ...draft, heroTitleLine2: v })}
      />
      <Field
        label="Hero title line 3"
        value={draft.heroTitleLine3 ?? ""}
        onChange={(v) => onChange({ ...draft, heroTitleLine3: v })}
      />
      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          Hero subtitle
        </label>
        <textarea
          value={draft.heroSubtitle ?? ""}
          onChange={(e) => onChange({ ...draft, heroSubtitle: e.target.value })}
          rows={4}
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
        />
      </div>
      <SaveRow saving={saving} onSave={onSave} />
    </div>
  );
}

function JsonFieldsPanel({
  title,
  draft,
  onChange,
  saving,
  onSave,
}: {
  title: string;
  draft: AdminSettingsBundle["contact"];
  onChange: (v: AdminSettingsBundle["contact"]) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-lg font-medium">{title}</h2>
      <Field label="Email" value={draft.email} onChange={(v) => onChange({ ...draft, email: v })} />
      <Field label="Phone" value={draft.phone} onChange={(v) => onChange({ ...draft, phone: v })} />
      <Field
        label="Address"
        value={draft.address}
        onChange={(v) => onChange({ ...draft, address: v })}
      />
      <Field
        label="Business hours"
        value={draft.businessHours ?? ""}
        onChange={(v) => onChange({ ...draft, businessHours: v })}
      />
      <SaveRow saving={saving} onSave={onSave} />
    </div>
  );
}

function ImagesPanel({
  draft,
  onChange,
  saving,
  onSave,
}: {
  draft: AdminSettingsBundle["images"];
  onChange: (v: AdminSettingsBundle["images"]) => void;
  saving: boolean;
  onSave: () => void;
}) {
  const pairs: [keyof AdminSettingsBundle["images"], string][] = [
    ["hero", "Hero"],
    ["about", "About"],
    ["maeum", "Kbeautyretail"],
    ["uk", "UK market"],
    ["gcc", "GCC market"],
    ["manufacturing", "Manufacturing"],
    ["logistics", "Logistics"],
  ];
  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-lg font-medium">Image URLs</h2>
      <p className="text-sm text-muted-foreground">
        Paste CDN or Supabase Storage public URLs. Leave blank to use built-in assets.
      </p>
      {pairs.map(([key, label]) => (
        <Field
          key={key}
          label={label}
          value={(draft[key] as string | null | undefined) ?? ""}
          onChange={(v) => onChange({ ...draft, [key]: v || null })}
        />
      ))}
      <SaveRow saving={saving} onSave={onSave} />
    </div>
  );
}

function SeoPanel({
  draft,
  onChange,
  saving,
  onSave,
}: {
  draft: AdminSettingsBundle["seo"];
  onChange: (v: AdminSettingsBundle["seo"]) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-lg font-medium">SEO</h2>
      <Field
        label="Meta title"
        value={draft.title}
        onChange={(v) => onChange({ ...draft, title: v })}
      />
      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          Meta description
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          rows={3}
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
        />
      </div>
      <Field
        label="Keywords"
        value={draft.keywords ?? ""}
        onChange={(v) => onChange({ ...draft, keywords: v })}
      />
      <Field
        label="OG image URL"
        value={draft.ogImage ?? ""}
        onChange={(v) => onChange({ ...draft, ogImage: v || null })}
      />
      <SaveRow saving={saving} onSave={onSave} />
    </div>
  );
}

function SmtpPanel({
  draft,
  onChange,
  saving,
  onSave,
  emailStatus,
  onTestEmail,
}: {
  draft: AdminSettingsBundle["email_smtp"];
  onChange: (v: AdminSettingsBundle["email_smtp"]) => void;
  saving: boolean;
  onSave: () => void;
  emailStatus: {
    zohoReady: boolean;
    zohoPasswordSet: boolean;
    zohoHost: boolean;
    zohoUser: boolean;
    zohoFrom: boolean;
    resendReady: boolean;
    resendKey: boolean;
    primary: "zoho" | "resend" | "none";
    fromConfigured: boolean;
    recipientCount: number;
    recipients: string[];
    hasApiKey: boolean;
  } | null;
  onTestEmail: (to?: string) => Promise<void>;
}) {
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-medium">Zoho SMTP</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Contact form emails send through your Zoho mailbox. Put the app-specific password in{" "}
          <code className="text-xs">ZOHO_SMTP_PASSWORD</code> in <code className="text-xs">.env</code>{" "}
          (not your normal webmail password).
        </p>
      </div>

      {emailStatus ? (
        <ul className="text-sm space-y-1 rounded-xl border border-border bg-background p-4">
          <li>
            Active provider:{" "}
            <span className="font-medium text-primary">
              {emailStatus.primary === "zoho"
                ? "Zoho SMTP"
                : emailStatus.primary === "resend"
                  ? "Resend (fallback)"
                  : "Not configured"}
            </span>
          </li>
          <li>
            Zoho app password in .env:{" "}
            <span className={emailStatus.zohoPasswordSet ? "text-primary" : "text-destructive"}>
              {emailStatus.zohoPasswordSet ? "Set" : "Missing ZOHO_SMTP_PASSWORD"}
            </span>
          </li>
          <li>
            SMTP host / user / from:{" "}
            <span
              className={
                emailStatus.zohoHost && emailStatus.zohoUser && emailStatus.zohoFrom
                  ? "text-primary"
                  : "text-destructive"
              }
            >
              {emailStatus.zohoHost && emailStatus.zohoUser && emailStatus.zohoFrom
                ? "Ready"
                : "Complete fields below and save"}
            </span>
          </li>
          <li>
            Resend fallback:{" "}
            <span className={emailStatus.resendReady ? "text-primary" : "text-muted-foreground"}>
              {emailStatus.resendReady ? "Available" : "Optional — not set"}
            </span>
          </li>
          <li>
            Notification inboxes: {emailStatus.recipientCount}
            {emailStatus.recipients.length > 0 ? (
              <span className="text-muted-foreground"> ({emailStatus.recipients.join(", ")})</span>
            ) : null}
          </li>
        </ul>
      ) : null}

      <Field label="SMTP host" value={draft.host ?? ""} onChange={(v) => onChange({ ...draft, host: v })} />
      <Field
        label="Port"
        value={draft.port != null ? String(draft.port) : ""}
        onChange={(v) => onChange({ ...draft, port: v ? Number(v) : undefined })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!draft.secure}
          onChange={(e) => onChange({ ...draft, secure: e.target.checked })}
        />
        SSL / TLS (use for port 465)
      </label>
      <Field
        label="SMTP user (full email, e.g. info@kbeautyretail.com)"
        value={draft.user ?? ""}
        onChange={(v) => onChange({ ...draft, user: v })}
      />
      <Field
        label="From email (what recipients see)"
        value={draft.fromEmail ?? ""}
        onChange={(v) => onChange({ ...draft, fromEmail: v })}
      />
      <Field label="Reply-to" value={draft.replyTo ?? ""} onChange={(v) => onChange({ ...draft, replyTo: v })} />
      <Field
        label="Notification emails (comma-separated)"
        value={draft.notificationEmails ?? ""}
        onChange={(v) => onChange({ ...draft, notificationEmails: v })}
      />

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
        <div className="flex-1">
          <Field label="Send test email to (optional)" value={testTo} onChange={setTestTo} />
        </div>
        <button
          type="button"
          disabled={testing}
          onClick={async () => {
            setTesting(true);
            try {
              await onTestEmail(testTo.trim() || undefined);
            } finally {
              setTesting(false);
            }
          }}
          className="rounded-full border border-border px-5 py-3 text-sm hover:border-primary/50 disabled:opacity-50 whitespace-nowrap"
        >
          {testing ? "Sending…" : "Send test"}
        </button>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Resend fallback (optional)
        </summary>
        <div className="mt-4 space-y-4 pt-2 border-t border-border">
          <p className="text-muted-foreground text-xs">
            Used if Zoho SMTP fails. Set{" "}
            <code className="text-xs">RESEND_API_KEY</code> in <code className="text-xs">.env</code>.
          </p>
          <Field
            label="Resend From (e.g. K Beauty Retail <hello@yourdomain.com>)"
            value={draft.resendFrom ?? ""}
            onChange={(v) => onChange({ ...draft, resendFrom: v })}
          />
        </div>
      </details>

      <SaveRow saving={saving} onSave={onSave} />
    </div>
  );
}

function TemplatesPanel({
  draft,
  onChange,
  saving,
  onSave,
}: {
  draft: AdminSettingsBundle["email_templates"];
  onChange: (v: AdminSettingsBundle["email_templates"]) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-lg font-medium">Email templates</h2>
      <p className="text-sm text-muted-foreground">
        Placeholders:{" "}
        {"{{name}} {{email}} {{phone}} {{company}} {{inquiry_type}} {{message}} {{id}}"}
      </p>
      <Field
        label="Confirmation subject"
        value={draft.confirmationSubject}
        onChange={(v) => onChange({ ...draft, confirmationSubject: v })}
      />
      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          Confirmation body
        </label>
        <textarea
          value={draft.confirmationBody}
          onChange={(e) => onChange({ ...draft, confirmationBody: e.target.value })}
          rows={8}
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-mono"
        />
      </div>
      <Field
        label="Internal notification subject"
        value={draft.notificationSubject}
        onChange={(v) => onChange({ ...draft, notificationSubject: v })}
      />
      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          Internal notification body
        </label>
        <textarea
          value={draft.notificationBody}
          onChange={(e) => onChange({ ...draft, notificationBody: e.target.value })}
          rows={8}
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-mono"
        />
      </div>
      <SaveRow saving={saving} onSave={onSave} />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function SaveRow({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  return (
    <div className="pt-4">
      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:bg-primary disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
