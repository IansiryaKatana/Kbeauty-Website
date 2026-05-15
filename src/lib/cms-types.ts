import { z } from "zod";

export const SETTING_KEYS = [
  "site",
  "contact",
  "images",
  "seo",
  "email_templates",
  "email_smtp",
  "admin_users",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const inquiryTypeSchema = z.enum([
  "Partnership",
  "Distribution",
  "Retail",
  "Investment",
  "Press",
  "Other",
]);

export type InquiryType = z.infer<typeof inquiryTypeSchema>;

const optionalUrl = z.union([z.string().max(2000), z.literal(""), z.null()]).optional();

export const siteSettingsSchema = z.object({
  logoUrl: optionalUrl,
  faviconUrl: optionalUrl,
  primaryColor: z.string().max(32).nullable().optional(),
  social: z
    .object({
      instagram: z.string().max(500).optional(),
      linkedin: z.string().max(500).optional(),
      tiktok: z.string().max(500).optional(),
    })
    .optional(),
  heroEyebrow: z.string().max(200).optional(),
  heroTitleLine1: z.string().max(120).optional(),
  heroTitleLine2: z.string().max(120).optional(),
  heroTitleLine3: z.string().max(120).optional(),
  heroSubtitle: z.string().max(2000).optional(),
});

export const contactSettingsSchema = z.object({
  email: z.string().max(320),
  phone: z.string().max(80),
  address: z.string().max(500),
  businessHours: z.string().max(500).optional(),
});

export const imagesSettingsSchema = z.object({
  hero: optionalUrl,
  about: optionalUrl,
  maeum: optionalUrl,
  uk: optionalUrl,
  gcc: optionalUrl,
  manufacturing: optionalUrl,
  logistics: optionalUrl,
});

export const seoSettingsSchema = z.object({
  title: z.string().max(120),
  description: z.string().max(320),
  ogImage: optionalUrl,
  keywords: z.string().max(500).optional(),
});

export const emailTemplatesSchema = z.object({
  confirmationSubject: z.string().max(200),
  confirmationBody: z.string().max(8000),
  notificationSubject: z.string().max(200),
  notificationBody: z.string().max(8000),
});

/** Zoho SMTP (primary). Password in env: ZOHO_SMTP_PASSWORD. Resend fields = optional fallback. */
export const emailSmtpSchema = z.object({
  host: z.string().max(200).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  secure: z.boolean().optional(),
  /** Full Zoho mailbox email, e.g. info@kbeautyretail.com */
  user: z.string().max(320).optional(),
  /** From address visitors see (often same as SMTP user) */
  fromEmail: z.string().max(320).optional(),
  replyTo: z.string().max(320).optional(),
  /** Resend fallback From — only used if Zoho SMTP fails or is unavailable */
  resendFrom: z.string().max(320).optional(),
  /** Comma-separated inboxes for new inquiry alerts */
  notificationEmails: z.string().max(2000).optional(),
});

export const adminUsersSchema = z.object({
  emails: z.array(z.string().max(320)).max(50),
  notes: z.string().max(2000).optional(),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type ContactSettings = z.infer<typeof contactSettingsSchema>;
export type ImagesSettings = z.infer<typeof imagesSettingsSchema>;
export type SeoSettings = z.infer<typeof seoSettingsSchema>;
export type EmailTemplates = z.infer<typeof emailTemplatesSchema>;
export type EmailSmtp = z.infer<typeof emailSmtpSchema>;
export type AdminUsers = z.infer<typeof adminUsersSchema>;

export type PublicSiteData = {
  site: SiteSettings;
  contact: ContactSettings;
  images: ImagesSettings;
  seo: SeoSettings;
};

const defaultSite: SiteSettings = {
  logoUrl: null,
  faviconUrl: null,
  primaryColor: null,
  social: {},
  heroEyebrow: "Premium Korean Beauty Brand House",
  heroTitleLine1: "Premium",
  heroTitleLine2: "Korean Skincare",
  heroTitleLine3: "Built for Global Markets",
  heroSubtitle:
    "Kbeautyretail is a premium Korean skincare company built for modern beauty consumers across the UK and GCC markets.",
};

const defaultContact: ContactSettings = {
  email: "info@kbeautyretail.com",
  phone: "+971504409246",
  address: "Sharjah Free Zone, United Arab Emirates",
  businessHours: "Sunday – Thursday, 9:00 – 18:00 GST",
};

const defaultImages: ImagesSettings = {
  hero: null,
  about: null,
  maeum: null,
  uk: null,
  gcc: null,
  manufacturing: null,
  logistics: null,
};

const defaultSeo: SeoSettings = {
  title: "Kbeautyretail | Premium Korean Skincare Brand UAE",
  description:
    "Kbeautyretail is a UAE premium Korean skincare company serving the UK and GCC beauty markets.",
  ogImage: null,
  keywords:
    "Korean skincare UAE, K beauty distributor UAE, Korean beauty wholesale UAE, Premium Korean skincare, Korean skincare GCC, Kbeautyretail skincare, Kbeautyretail beauty",
};

const defaultEmailTemplates: EmailTemplates = {
  confirmationSubject: "We received your message — K Beauty Retail",
  confirmationBody: `Hi {{name}},

Thank you for contacting K Beauty Retail. We have received your {{inquiry_type}} inquiry and will respond as soon as possible.

Your message:
{{message}}

— K Beauty Retail`,
  notificationSubject: "New website inquiry from {{name}}",
  notificationBody: `New inquiry

Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Company: {{company}}
Type: {{inquiry_type}}

Message:
{{message}}`,
};

const defaultEmailSmtp: EmailSmtp = {
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  user: "info@kbeautyretail.com",
  fromEmail: "info@kbeautyretail.com",
  replyTo: "info@kbeautyretail.com",
  resendFrom: "",
  notificationEmails: "info@kbeautyretail.com",
};

const defaultAdminUsers: AdminUsers = {
  emails: ["admin@kbeautyretail.com"],
  notes:
    "Admin sign-in uses Supabase Authentication. This list is for your internal records only.",
};

function deepMerge<T extends Record<string, unknown>>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      out[k] &&
      typeof out[k] === "object" &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMerge(out[k] as Record<string, unknown>, v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

export function mergePublicSiteData(rows: Partial<Record<SettingKey, unknown>>): PublicSiteData {
  return {
    site: siteSettingsSchema.parse(
      deepMerge(defaultSite as unknown as Record<string, unknown>, rows.site),
    ),
    contact: contactSettingsSchema.parse(
      deepMerge(defaultContact as unknown as Record<string, unknown>, rows.contact),
    ),
    images: imagesSettingsSchema.parse(
      deepMerge(defaultImages as unknown as Record<string, unknown>, rows.images),
    ),
    seo: seoSettingsSchema.parse(
      deepMerge(defaultSeo as unknown as Record<string, unknown>, rows.seo),
    ),
  };
}

export type AdminSettingsBundle = {
  site: SiteSettings;
  contact: ContactSettings;
  images: ImagesSettings;
  seo: SeoSettings;
  email_templates: EmailTemplates;
  email_smtp: EmailSmtp;
  admin_users: AdminUsers;
};

export function mergeAdminSettings(
  rows: Partial<Record<SettingKey, unknown>>,
): AdminSettingsBundle {
  return {
    site: siteSettingsSchema.parse(
      deepMerge(defaultSite as unknown as Record<string, unknown>, rows.site),
    ),
    contact: contactSettingsSchema.parse(
      deepMerge(defaultContact as unknown as Record<string, unknown>, rows.contact),
    ),
    images: imagesSettingsSchema.parse(
      deepMerge(defaultImages as unknown as Record<string, unknown>, rows.images),
    ),
    seo: seoSettingsSchema.parse(
      deepMerge(defaultSeo as unknown as Record<string, unknown>, rows.seo),
    ),
    email_templates: emailTemplatesSchema.parse(
      deepMerge(defaultEmailTemplates as unknown as Record<string, unknown>, rows.email_templates),
    ),
    email_smtp: emailSmtpSchema.parse(
      deepMerge(defaultEmailSmtp as unknown as Record<string, unknown>, rows.email_smtp),
    ),
    admin_users: adminUsersSchema.parse(
      deepMerge(defaultAdminUsers as unknown as Record<string, unknown>, rows.admin_users),
    ),
  };
}

export function parseSetting<K extends SettingKey>(key: K, value: unknown): unknown {
  switch (key) {
    case "site":
      return siteSettingsSchema.parse(value);
    case "contact":
      return contactSettingsSchema.parse(value);
    case "images":
      return imagesSettingsSchema.parse(value);
    case "seo":
      return seoSettingsSchema.parse(value);
    case "email_templates":
      return emailTemplatesSchema.parse(value);
    case "email_smtp":
      return emailSmtpSchema.parse(value);
    case "admin_users":
      return adminUsersSchema.parse(value);
    default:
      return value;
  }
}

export function defaultForKey(key: SettingKey): unknown {
  switch (key) {
    case "site":
      return defaultSite;
    case "contact":
      return defaultContact;
    case "images":
      return defaultImages;
    case "seo":
      return defaultSeo;
    case "email_templates":
      return defaultEmailTemplates;
    case "email_smtp":
      return defaultEmailSmtp;
    case "admin_users":
      return defaultAdminUsers;
    default:
      return {};
  }
}

export const contactSubmitSchema = z
  .object({
    name: z.string().min(1).max(200),
    email: z.string().min(3).max(320),
    phone: z.string().max(80).optional(),
    company: z.string().max(200).optional(),
    inquiryType: inquiryTypeSchema,
    message: z.string().min(1).max(8000),
    /** Honeypot — must stay empty */
    companyWebsite: z.string().max(200).optional(),
  })
  .refine((d) => !d.companyWebsite?.trim(), {
    message: "Invalid submission",
    path: ["companyWebsite"],
  });

export type ContactSubmitInput = z.infer<typeof contactSubmitSchema>;

export const adminLoginSchema = z.object({
  email: z.string().min(3).max(320),
  password: z.string().min(1).max(500),
});

export const saveSettingSchema = z.object({
  key: z.enum(SETTING_KEYS),
  value: z.unknown(),
});

export const markSubmissionsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
  read: z.boolean(),
});

export const createAuthUserSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

export const updateAuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(320).optional(),
  password: z.string().min(8).max(128).optional(),
});

export const deleteAuthUserSchema = z.object({
  id: z.string().uuid(),
});

export const sendTestEmailSchema = z.object({
  to: z.string().email().max(320).optional(),
});

export type AuthUserRow = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
};
