/* TanStack Start's `useSession` is server request-scoped session state, not a React hook. */
/* eslint-disable react-hooks/rules-of-hooks */
import { createServerFn } from "@tanstack/react-start";
import {
  SETTING_KEYS,
  adminLoginSchema,
  contactSubmitSchema,
  createAuthUserSchema,
  deleteAuthUserSchema,
  markSubmissionsSchema,
  mergeAdminSettings,
  mergePublicSiteData,
  parseSetting,
  saveSettingSchema,
  sendTestEmailSchema,
  updateAuthUserSchema,
  type AdminSettingsBundle,
  type AuthUserRow,
  type EmailSmtp,
  type PublicSiteData,
  type SettingKey,
} from "@/lib/cms-types";
import {
  getDeliveryStatus,
  resolveNotificationRecipients,
  sendOutboundEmail,
} from "@/lib/send-email";
import {
  clearSupabaseAuthCookies,
  getSupabaseAdminUser,
  getSupabaseAuth,
  getSupabaseService,
  setSupabaseAuthCookies,
} from "@/lib/supabase-service";

function applyTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

async function loadSettingRows(): Promise<Partial<Record<SettingKey, unknown>>> {
  const sb = getSupabaseService();
  if (!sb) return {};
  const { data, error } = await sb.from("app_settings").select("key,value");
  if (error) {
    console.error(error);
    return {};
  }
  const map: Partial<Record<SettingKey, unknown>> = {};
  for (const row of data ?? []) {
    const k = row.key as string;
    if (SETTING_KEYS.includes(k as SettingKey)) {
      map[k as SettingKey] = row.value;
    }
  }
  return map;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function notifyAfterSubmission(
  row: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    inquiry_type: string;
    message: string;
  },
  templates: AdminSettingsBundle["email_templates"],
  smtp: EmailSmtp,
) {
  const vars: Record<string, string> = {
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    company: row.company ?? "",
    inquiry_type: row.inquiry_type,
    message: row.message,
    id: row.id,
  };

  const confirmSubject = applyTemplate(templates.confirmationSubject, vars);
  const confirmBody = applyTemplate(templates.confirmationBody, vars);
  const notifSubject = applyTemplate(templates.notificationSubject, vars);
  const notifBody = applyTemplate(templates.notificationBody, vars);

  const confirmHtml = `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(confirmBody)}</pre>`;
  const notifHtml = `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(notifBody)}</pre>`;

  await sendOutboundEmail(row.email, confirmSubject, confirmHtml, smtp);

  for (const to of resolveNotificationRecipients(smtp)) {
    await sendOutboundEmail(to, notifSubject, notifHtml, smtp);
  }
}

export const getPublicSiteData = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSiteData> => {
    const map = await loadSettingRows();
    return mergePublicSiteData(map);
  },
);

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSubmitSchema.parse(data))
  .handler(async ({ data }) => {
    const sb = getSupabaseService();
    if (!sb) {
      return { ok: false as const, error: "NOT_CONFIGURED" as const };
    }

    const { companyWebsite: _hp, ...rest } = data;
    void _hp;

    const insert = {
      name: rest.name,
      email: rest.email,
      phone: rest.phone?.trim() || null,
      company: rest.company?.trim() || null,
      inquiry_type: rest.inquiryType,
      message: rest.message,
      source: "website",
    };

    const { data: inserted, error } = await sb
      .from("contact_submissions")
      .insert(insert)
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return { ok: false as const, error: "SAVE_FAILED" as const };
    }

    const id = inserted?.id as string;
    const bundle = mergeAdminSettings(await loadSettingRows());

    void notifyAfterSubmission(
      {
        id,
        name: insert.name,
        email: insert.email,
        phone: insert.phone,
        company: insert.company,
        inquiry_type: insert.inquiry_type,
        message: insert.message,
      },
      bundle.email_templates,
      bundle.email_smtp,
    ).catch((e) => console.error(e));

    return { ok: true as const, id };
  });

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getSupabaseAdminUser();
  if (!user) return { authenticated: false as const };
  return { authenticated: true as const, email: user.email ?? "", userId: user.id };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => adminLoginSchema.parse(data))
  .handler(async ({ data }) => {
    const sb = getSupabaseAuth();
    if (!sb) {
      return { ok: false as const, error: "AUTH_NOT_CONFIGURED" as const };
    }

    const { data: auth, error } = await sb.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password,
    });

    if (error || !auth.session) {
      return { ok: false as const, error: "INVALID_CREDENTIALS" as const };
    }

    await setSupabaseAuthCookies(auth.session.access_token, auth.session.refresh_token);
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  await clearSupabaseAuthCookies();
  return { ok: true as const };
});

async function requireAdmin() {
  const user = await getSupabaseAdminUser();
  if (!user) return { error: "UNAUTHORIZED" as const };
  return { user };
}

export const getAdminSettingsBundle = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false as const, error: auth.error };
  const sb = getSupabaseService();
  if (!sb) return { ok: false as const, error: "NOT_CONFIGURED" as const };
  const map = await loadSettingRows();
  const settings = mergeAdminSettings(map);
  return { ok: true as const, settings };
});

export const saveAdminSetting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => saveSettingSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await requireAdmin();
    if ("error" in auth) return { ok: false as const, error: auth.error };
    const sb = getSupabaseService();
    if (!sb) return { ok: false as const, error: "NOT_CONFIGURED" as const };

    const parsed = parseSetting(data.key, data.value);
    const { error } = await sb.from("app_settings").upsert(
      {
        key: data.key,
        value: parsed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );

    if (error) {
      console.error(error);
      return { ok: false as const, error: "SAVE_FAILED" as const };
    }

    return { ok: true as const };
  });

export const listContactSubmissions = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false as const, error: auth.error };
  const sb = getSupabaseService();
  if (!sb) return { ok: false as const, error: "NOT_CONFIGURED" as const };

  const { data, error } = await sb
    .from("contact_submissions")
    .select("id,created_at,name,email,phone,company,inquiry_type,message,read_at,source")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error(error);
    return { ok: false as const, error: "LOAD_FAILED" as const };
  }

  return { ok: true as const, rows: data ?? [] };
});

function mapAuthUser(u: {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string | null;
}): AuthUserRow {
  return {
    id: u.id,
    email: u.email ?? "",
    createdAt: u.created_at ?? "",
    lastSignInAt: u.last_sign_in_at ?? null,
    emailConfirmed: !!u.email_confirmed_at,
  };
}

export const listAuthUsers = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false as const, error: auth.error };
  const sb = getSupabaseService();
  if (!sb) return { ok: false as const, error: "NOT_CONFIGURED" as const };

  const { data, error } = await sb.auth.admin.listUsers({ perPage: 200, page: 1 });
  if (error) {
    console.error(error);
    return { ok: false as const, error: "LOAD_FAILED" as const };
  }

  const users = (data.users ?? []).map(mapAuthUser).sort((a, b) => a.email.localeCompare(b.email));
  return { ok: true as const, users };
});

export const createAuthUser = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createAuthUserSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await requireAdmin();
    if ("error" in auth) return { ok: false as const, error: auth.error };
    const sb = getSupabaseService();
    if (!sb) return { ok: false as const, error: "NOT_CONFIGURED" as const };

    const { data: created, error } = await sb.auth.admin.createUser({
      email: data.email.trim(),
      password: data.password,
      email_confirm: true,
    });

    if (error) {
      console.error(error);
      return { ok: false as const, error: "CREATE_FAILED" as const, message: error.message };
    }

    return { ok: true as const, user: mapAuthUser(created.user) };
  });

export const updateAuthUser = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateAuthUserSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await requireAdmin();
    if ("error" in auth) return { ok: false as const, error: auth.error };
    const sb = getSupabaseService();
    if (!sb) return { ok: false as const, error: "NOT_CONFIGURED" as const };

    if (!data.email && !data.password) {
      return { ok: false as const, error: "NOTHING_TO_UPDATE" as const };
    }

    const attrs: { email?: string; password?: string } = {};
    if (data.email) attrs.email = data.email.trim();
    if (data.password) attrs.password = data.password;

    const { data: updated, error } = await sb.auth.admin.updateUserById(data.id, attrs);
    if (error) {
      console.error(error);
      return { ok: false as const, error: "UPDATE_FAILED" as const, message: error.message };
    }

    return { ok: true as const, user: mapAuthUser(updated.user) };
  });

export const deleteAuthUser = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => deleteAuthUserSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await requireAdmin();
    if ("error" in auth) return { ok: false as const, error: auth.error };
    if (auth.user.id === data.id) {
      return { ok: false as const, error: "CANNOT_DELETE_SELF" as const };
    }
    const sb = getSupabaseService();
    if (!sb) return { ok: false as const, error: "NOT_CONFIGURED" as const };

    const { error } = await sb.auth.admin.deleteUser(data.id);
    if (error) {
      console.error(error);
      return { ok: false as const, error: "DELETE_FAILED" as const, message: error.message };
    }

    return { ok: true as const };
  });

export const getEmailDeliveryStatus = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false as const, error: auth.error };
  const map = await loadSettingRows();
  const smtp = mergeAdminSettings(map).email_smtp;
  return { ok: true as const, ...getDeliveryStatus(smtp) };
});

export const sendTestEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sendTestEmailSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await requireAdmin();
    if ("error" in auth) return { ok: false as const, error: auth.error };

    const map = await loadSettingRows();
    const bundle = mergeAdminSettings(map);
    const to = data.to?.trim() || auth.user.email;
    if (!to) return { ok: false as const, error: "NO_RECIPIENT" as const };

    const result = await sendOutboundEmail(
      to,
      "K Beauty Retail — test email",
      `<p style="font-family:system-ui,sans-serif">This is a test message from the K Beauty Retail admin panel. If you received this, outbound email is working.</p>`,
      bundle.email_smtp,
    );

    if (!result.ok) {
      const err =
        result.error === "EMAIL_NOT_CONFIGURED"
          ? "EMAIL_NOT_CONFIGURED"
          : result.error === "ZOHO_SMTP_FAILED"
            ? "ZOHO_SMTP_FAILED"
            : result.error === "RESEND_NOT_CONFIGURED"
              ? "RESEND_NOT_CONFIGURED"
              : "SEND_FAILED";
      return {
        ok: false as const,
        error: err,
        message: result.error,
      };
    }

    return { ok: true as const, to, provider: result.provider ?? "zoho" };
  });

export const markContactSubmissions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => markSubmissionsSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await requireAdmin();
    if ("error" in auth) return { ok: false as const, error: auth.error };
    const sb = getSupabaseService();
    if (!sb) return { ok: false as const, error: "NOT_CONFIGURED" as const };

    const readAt = data.read ? new Date().toISOString() : null;
    const { error } = await sb
      .from("contact_submissions")
      .update({ read_at: readAt })
      .in("id", data.ids);

    if (error) {
      console.error(error);
      return { ok: false as const, error: "UPDATE_FAILED" as const };
    }

    return { ok: true as const };
  });
