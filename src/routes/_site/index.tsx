import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Building2,
  Sparkles,
  Globe,
  Boxes,
  Truck,
  ShieldCheck,
  Rocket,
  TrendingUp,
  Users,
  Mail,
  Phone,
  MapPin,
  Send,
  Check,
} from "lucide-react";

import { Hero } from "@/components/site/Hero";
import { SectionHeader } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";

import logo from "@/assets/logo.png";
import aboutImg from "@/assets/about.jpg";
import brandImg from "@/assets/maeum.jpg";
import ukImg from "@/assets/uk.jpg";
import gccImg from "@/assets/gcc.jpg";
import manufacturingImg from "@/assets/manufacturing.jpg";
import logisticsImg from "@/assets/logistics.jpg";
import contactImg from "@/assets/contact.jpg";

import { contactSubmitSchema, inquiryTypeSchema, type ContactSubmitInput } from "@/lib/cms-types";
import { useSiteData } from "@/lib/site-data-context";
import { submitContact } from "@/server/kbeauty-rpc";

export const Route = createFileRoute("/_site/")({
  head: ({ matches }) => {
    const cms = matches.find((m) => m.routeId === "/_site")?.loaderData as
      | { seo?: { title?: string; description?: string; keywords?: string; ogImage?: string } }
      | undefined;
    const seo = cms?.seo;
    const title = seo?.title ?? "Kbeautyretail | Premium Korean Skincare Brand UAE";
    const description =
      seo?.description ??
      "Kbeautyretail is a UAE premium Korean skincare company serving the UK and GCC beauty markets.";
    const keywords =
      seo?.keywords ??
      "Korean skincare UAE, K beauty distributor UAE, Korean beauty wholesale UAE, Premium Korean skincare, Korean skincare GCC, Kbeautyretail skincare, Kbeautyretail beauty";
    const ogImage = seo?.ogImage?.trim() || "/favicon.png";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
    };
  },
  component: Page,
});

function Page() {
  return (
    <main>
      <Hero />
      <About />
      <Brand />
      <Markets />
      <Operations />
      <Growth />
      <Contact />
    </main>
  );
}

/* ---------------- About ---------------- */
function About() {
  const cms = useSiteData();
  const aboutSrc = cms.images.about?.trim() || aboutImg;
  const cards = [
    {
      icon: Building2,
      title: "UAE Free Zone Entity",
      text: "Sharjah-registered FZE structure built for global trade.",
    },
    {
      icon: Sparkles,
      title: "Brand Management",
      text: "Owners of the Kbeautyretail Korean beauty trademark.",
    },
    {
      icon: Globe,
      title: "International Beauty Retail",
      text: "Focused on the UK and GCC modern beauty consumer.",
    },
    {
      icon: Boxes,
      title: "Asset-Light Operations",
      text: "Lean structure with strategic supply chain partnerships.",
    },
  ];
  return (
    <section id="about" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-7">
          <SectionHeader
            eyebrow="About K Beauty Retail"
            title={
              <>
                A UAE-Based Beauty
                <br />
                <span className="italic text-primary font-normal">Brand Company.</span>
              </>
            }
            intro="K Beauty Retail FZE is a Sharjah-based beauty company focused on general trading, brand management, and international skincare retail. The company operates with an asset-light model, placing value on brand ownership, product formulation, supply chain partnerships, and scalable distribution."
          />
          <div className="mt-12 grid sm:grid-cols-2 gap-4">
            {cards.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.06}>
                <div className="group h-full rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <c.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <Reveal>
            <div
              className="relative rounded-[2rem] overflow-hidden grain"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <img
                src={aboutSrc}
                loading="lazy"
                alt="Kbeautyretail skincare collection"
                width={1200}
                height={1400}
                className="w-full h-[560px] object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Brand ---------------- */
function Brand() {
  const cms = useSiteData();
  const brandSrc = cms.images.maeum?.trim() || brandImg;
  const pillars = [
    "Korean formulation heritage",
    "Premium minimal packaging",
    "Skin-first ingredient philosophy",
    "Built for UK & GCC climates",
  ];
  return (
    <section id="maeum" className="relative py-28 lg:py-36 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <Reveal>
            <div
              className="relative rounded-[2rem] overflow-hidden grain"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <img
                src={brandSrc}
                loading="lazy"
                alt="Kbeautyretail signature serum"
                width={1200}
                height={1500}
                className="w-full h-[600px] object-cover"
              />
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute bottom-6 left-6 right-6 rounded-2xl bg-background/85 backdrop-blur-xl border border-border p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-primary">
                      Signature
                    </div>
                    <div className="mt-1 font-medium">Kbeautyretail Glow Serum</div>
                  </div>
                  <div className="text-xs text-muted-foreground">Made in Korea</div>
                </div>
              </motion.div>
            </div>
          </Reveal>
        </div>
        <div className="lg:col-span-6 order-1 lg:order-2">
          <SectionHeader
            eyebrow="Introducing Kbeautyretail"
            title={
              <>
                A premium Korean skincare brand,
                <span className="italic text-primary font-normal"> globally minded.</span>
              </>
            }
            intro="Kbeautyretail is designed in the spirit of modern Korean beauty culture and engineered for international shelves. Clean, considered, and unmistakably premium."
          />
          <div className="mt-10 space-y-3">
            {pillars.map((p, i) => (
              <Reveal key={p} delay={i * 0.05}>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm">{p}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Markets ---------------- */
function Markets() {
  const cms = useSiteData();
  const markets = [
    {
      img: cms.images.uk?.trim() || ukImg,
      tag: "United Kingdom",
      title: "A mature K-beauty audience.",
      text: "Established Korean skincare demand and a strong digital beauty retail culture across the UK.",
    },
    {
      img: cms.images.gcc?.trim() || gccImg,
      tag: "GCC / Middle East",
      title: "Premium beauty, fast growth.",
      text: "A premium consumer base in the UAE, KSA and wider GCC with rising appetite for Korean skincare.",
    },
  ];
  return (
    <section id="markets" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          eyebrow="Markets"
          title={
            <>
              Korean Skincare For
              <br />
              <span className="italic text-primary font-normal">The UK & GCC.</span>
            </>
          }
          intro="Two high-value beauty regions, one focused brand strategy. Kbeautyretail is positioned to meet sophisticated demand on both sides."
        />
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {markets.map((m, i) => (
            <Reveal key={m.tag} delay={i * 0.1}>
              <article className="group relative rounded-[2rem] overflow-hidden border border-border bg-card">
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={m.img}
                    loading="lazy"
                    alt={m.tag}
                    width={1200}
                    height={1400}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute top-5 left-5 inline-flex items-center rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[11px] uppercase tracking-widest">
                    {m.tag}
                  </span>
                </div>
                <div className="p-7">
                  <h3 className="text-2xl tracking-tight">{m.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Operations ---------------- */
function Operations() {
  const cms = useSiteData();
  const items = [
    {
      img: cms.images.manufacturing?.trim() || manufacturingImg,
      icon: ShieldCheck,
      title: "Korean Manufacturing",
      text: "Formulated and produced through trusted South Korean manufacturing partners.",
    },
    {
      img: cms.images.logistics?.trim() || logisticsImg,
      icon: Truck,
      title: "Global Logistics",
      text: "UAE-based fulfillment with international freight pathways into the UK and GCC.",
    },
  ];
  return (
    <section id="operations" className="relative py-28 lg:py-36 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          eyebrow="Operations"
          title={
            <>
              Global Operations
              <br />
              <span className="italic text-primary font-normal">& Fulfillment.</span>
            </>
          }
          intro="An asset-light supply chain that leans on the best of Korean formulation and modern global logistics."
        />
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.1}>
              <div className="rounded-[2rem] overflow-hidden border border-border bg-card">
                <div className="h-64 overflow-hidden">
                  <img
                    src={it.img}
                    loading="lazy"
                    alt={it.title}
                    width={1200}
                    height={1400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-7">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <it.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-5 text-2xl tracking-tight">{it.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{it.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Growth ---------------- */
function Growth() {
  const stats = [
    { k: "Launch ready", v: "Kbeautyretail", icon: Rocket },
    { k: "Market focus", v: "UK · GCC", icon: TrendingUp },
    { k: "Audience", v: "Modern beauty", icon: Users },
  ];
  return (
    <section id="growth" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-6">
          <SectionHeader
            eyebrow="Growth"
            title={
              <>
                Built For Launch, Scale
                <br />
                <span className="italic text-primary font-normal">& Market Acquisition.</span>
              </>
            }
            intro="A focused brand house structure designed to launch fast, retail wide, and grow distribution across the UK and GCC."
          />
        </div>
        <div className="lg:col-span-6 grid sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <Reveal key={s.k} delay={i * 0.08}>
              <div className="rounded-2xl border border-border bg-card p-6 h-full">
                <s.icon className="w-5 h-5 text-primary" />
                <div className="mt-6 text-2xl tracking-tight">{s.v}</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {s.k}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const contactFieldClass =
  "contact-field mt-2 w-full rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground";

/* ---------------- Contact ---------------- */
function Contact() {
  const cms = useSiteData();
  const post = useServerFn(submitContact);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactSubmitInput>({
    resolver: zodResolver(contactSubmitSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      inquiryType: "Partnership",
      message: "",
      companyWebsite: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await post({ data: values });
    if (res.ok) {
      toast.success("Thank you — the K Beauty Retail team will be in touch shortly.");
      reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        inquiryType: "Partnership",
        message: "",
        companyWebsite: "",
      });
    } else if (res.error === "NOT_CONFIGURED") {
      toast.error("The contact form is not fully configured yet. Please email us directly.");
    } else {
      toast.error("We could not send your message. Please try again or email us directly.");
    }
  });

  const mailHref = `mailto:${cms.contact.email}`;
  const telHref = `tel:${cms.contact.phone.replace(/\s/g, "")}`;

  return (
    <section id="contact" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div
          className="relative rounded-[2.5rem] overflow-hidden border border-border"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <img
            src={contactImg}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/70 to-background/85" />
          <div className="relative grid lg:grid-cols-12 gap-12 p-8 sm:p-12 lg:p-16">
            <div className="lg:col-span-5">
              <SectionHeader
                eyebrow="Contact"
                title={
                  <>
                    Contact
                    <br />
                    <span className="italic text-primary font-normal">K Beauty Retail.</span>
                  </>
                }
                intro="For business enquiries, partnerships, distribution, retail opportunities, or investment discussions, reach out to the team."
              />
              <div className="mt-10 space-y-4 text-sm">
                <a
                  href={mailHref}
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </span>
                  {cms.contact.email}
                </a>
                <a
                  href={telHref}
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </span>
                  {cms.contact.phone}
                </a>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </span>
                  {cms.contact.address}
                </div>
                {cms.contact.businessHours ? (
                  <p className="text-xs text-muted-foreground pl-12">{cms.contact.businessHours}</p>
                ) : null}
              </div>
            </div>
            <div className="lg:col-span-7">
              <Reveal>
                <form
                  onSubmit={onSubmit}
                  className="contact-form-card rounded-3xl backdrop-blur-xl p-6 sm:p-8 space-y-4 shadow-[0_12px_40px_-16px_oklch(0.18_0.02_25_/_0.12)]"
                  noValidate
                >
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="absolute -left-[9999px] h-0 w-0 opacity-0 pointer-events-none"
                    {...register("companyWebsite")}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-name">Full Name</Label>
                      <input
                        id="contact-name"
                        {...register("name")}
                        className={contactFieldClass}
                        placeholder="Your name"
                      />
                      {errors.name ? (
                        <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                      ) : null}
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email Address</Label>
                      <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        {...register("email")}
                        className={contactFieldClass}
                        placeholder="you@company.com"
                      />
                      {errors.email ? (
                        <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                      ) : null}
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Phone Number</Label>
                      <input
                        id="contact-phone"
                        type="tel"
                        {...register("phone")}
                        className={contactFieldClass}
                        placeholder="+971 …"
                      />
                      {errors.phone ? (
                        <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
                      ) : null}
                    </div>
                    <div>
                      <Label htmlFor="contact-company">Company Name</Label>
                      <input
                        id="contact-company"
                        {...register("company")}
                        className={contactFieldClass}
                        placeholder="Company name"
                      />
                      {errors.company ? (
                        <p className="mt-1 text-xs text-destructive">{errors.company.message}</p>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-type">Inquiry Type</Label>
                    <select
                      id="contact-type"
                      {...register("inquiryType")}
                      className={contactFieldClass}
                    >
                      {inquiryTypeSchema.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {errors.inquiryType ? (
                      <p className="mt-1 text-xs text-destructive">{errors.inquiryType.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <Label htmlFor="contact-message">Message</Label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      {...register("message")}
                      className={`${contactFieldClass} resize-none`}
                      placeholder="How can we help?"
                    />
                    {errors.message ? (
                      <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-medium hover:bg-primary transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending…" : "Send Message"}
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </form>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="contact-label text-[11px] uppercase tracking-widest"
    >
      {children}
    </label>
  );
}

