import type { EmailSmtp } from "@/lib/cms-types";
import { getServerEnv } from "@/lib/env-server";

export type EmailProvider = "zoho" | "resend";

export type SendEmailResult = {
  ok: boolean;
  error?: string;
  provider?: EmailProvider;
};

export function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function resolveNotificationRecipients(smtp: EmailSmtp): string[] {
  const fromDb = parseEmailList(smtp.notificationEmails);
  if (fromDb.length) return fromDb;
  return parseEmailList(getServerEnv("NOTIFICATION_EMAILS") ?? getServerEnv("NOTIFICATION_EMAIL"));
}

function resolveZohoFrom(smtp: EmailSmtp): string {
  return smtp.fromEmail?.trim() || smtp.user?.trim() || "";
}

function resolveResendFrom(smtp: EmailSmtp): string | undefined {
  return smtp.resendFrom?.trim() || smtp.fromEmail?.trim() || getServerEnv("RESEND_FROM") || undefined;
}

function canUseZoho(smtp: EmailSmtp): boolean {
  return !!(
    smtp.host?.trim() &&
    smtp.user?.trim() &&
    resolveZohoFrom(smtp) &&
    getServerEnv("ZOHO_SMTP_PASSWORD")
  );
}

function canUseResend(smtp: EmailSmtp): boolean {
  return !!(getServerEnv("RESEND_API_KEY") && resolveResendFrom(smtp));
}

export function getDeliveryStatus(smtp: EmailSmtp) {
  const zohoPasswordSet = !!getServerEnv("ZOHO_SMTP_PASSWORD");
  const zohoHost = !!smtp.host?.trim();
  const zohoUser = !!smtp.user?.trim();
  const zohoFrom = !!resolveZohoFrom(smtp);
  const zohoReady = zohoPasswordSet && zohoHost && zohoUser && zohoFrom;

  const resendKey = !!getServerEnv("RESEND_API_KEY");
  const resendFrom = !!resolveResendFrom(smtp);
  const resendReady = resendKey && resendFrom;

  const primary: EmailProvider | "none" = zohoReady ? "zoho" : resendReady ? "resend" : "none";
  const recipients = resolveNotificationRecipients(smtp);

  return {
    zohoReady,
    zohoPasswordSet,
    zohoHost,
    zohoUser,
    zohoFrom,
    resendReady,
    resendKey,
    primary,
    fromConfigured: zohoReady || resendReady,
    recipientCount: recipients.length,
    recipients,
    /** @deprecated use resendKey */
    hasApiKey: resendKey,
  };
}

async function sendViaZoho(
  to: string,
  subject: string,
  html: string,
  smtp: EmailSmtp,
  replyTo?: string,
): Promise<SendEmailResult> {
  try {
    const nodemailer = await import("nodemailer");
    const port = smtp.port ?? 465;
    const secure = smtp.secure ?? port === 465;

    const transporter = nodemailer.createTransport({
      host: smtp.host!.trim(),
      port,
      secure,
      auth: {
        user: smtp.user!.trim(),
        pass: getServerEnv("ZOHO_SMTP_PASSWORD")!,
      },
    });

    await transporter.sendMail({
      from: resolveZohoFrom(smtp),
      to,
      subject,
      html,
      replyTo: replyTo || undefined,
    });

    return { ok: true, provider: "zoho" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Zoho SMTP error:", message);
    return { ok: false, error: message, provider: "zoho" };
  }
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  smtp: EmailSmtp,
  replyTo?: string,
): Promise<SendEmailResult> {
  const key = getServerEnv("RESEND_API_KEY");
  const from = resolveResendFrom(smtp);
  if (!key || !from) {
    return { ok: false, error: "RESEND_NOT_CONFIGURED" };
  }

  const body: Record<string, string> = { from, to, subject, html };
  if (replyTo) body.reply_to = replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("Resend error", res.status, t);
    return { ok: false, error: t.slice(0, 200) };
  }

  return { ok: true, provider: "resend" };
}

/** Zoho SMTP first; Resend HTTP fallback if Zoho fails or is not configured. */
export async function sendOutboundEmail(
  to: string,
  subject: string,
  html: string,
  smtp: EmailSmtp,
): Promise<SendEmailResult> {
  const replyTo = smtp.replyTo?.trim() || undefined;

  if (canUseZoho(smtp)) {
    const zoho = await sendViaZoho(to, subject, html, smtp, replyTo);
    if (zoho.ok) return zoho;
    if (!canUseResend(smtp)) return zoho;
    console.warn("Zoho SMTP failed, using Resend fallback:", zoho.error);
  }

  if (canUseResend(smtp)) {
    return sendViaResend(to, subject, html, smtp, replyTo);
  }

  if (canUseZoho(smtp)) {
    return { ok: false, error: "ZOHO_SMTP_FAILED" };
  }

  return { ok: false, error: "EMAIL_NOT_CONFIGURED" };
}
