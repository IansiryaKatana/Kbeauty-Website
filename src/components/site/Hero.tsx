import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Globe2, Award } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { useSiteData } from "@/lib/site-data-context";

export function Hero() {
  const cms = useSiteData();
  const heroSrc = cms.images.hero?.trim() || hero;

  return (
    <section id="home" className="relative pt-32 lg:pt-40 pb-20 overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full blur-3xl opacity-40"
        style={{ background: "var(--gradient-coral)" }}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-12 items-center relative">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 backdrop-blur px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-foreground/70"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {cms.site.heroEyebrow ?? "Premium Korean Beauty Brand House"}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-[2.3rem] sm:text-[3.2rem] lg:text-[4.6rem] leading-[0.96] tracking-tight font-light"
          >
            <span className="block">{cms.site.heroTitleLine1 ?? "Premium"}</span>
            <span className="block">{cms.site.heroTitleLine2 ?? "Korean Skincare"}</span>
            <span className="block font-normal text-primary">
              {cms.site.heroTitleLine3 ?? "Built for Global Markets"}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-8 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            {cms.site.heroSubtitle ??
              "Kbeautyretail is a premium Korean skincare company built for modern beauty consumers across the UK and GCC markets."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#maeum"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-medium hover:bg-primary transition-colors"
            >
              Explore Kbeautyretail
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 backdrop-blur px-7 py-3.5 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              Contact Us
            </a>
          </motion.div>
        </div>

        <div className="lg:col-span-5 relative">
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[2rem] overflow-hidden grain"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <img
              src={heroSrc}
              alt="Kbeautyretail premium Korean skincare"
              width={1280}
              height={1600}
              className="w-full h-[520px] lg:h-[640px] object-cover"
            />
            <div
              className="absolute inset-0 mix-blend-soft-light opacity-60"
              style={{ background: "var(--gradient-coral)" }}
            />
          </motion.div>

          <FloatingCard
            className="absolute -left-4 lg:-left-10 top-10"
            delay={0.8}
            icon={<Sparkles className="w-4 h-4" />}
            label="Premium K-Beauty"
          />
          <FloatingCard
            className="absolute -right-4 lg:-right-8 top-1/2"
            delay={1.0}
            icon={<Globe2 className="w-4 h-4" />}
            label="UK & GCC Ready"
          />
          <FloatingCard
            className="absolute left-6 -bottom-4"
            delay={1.2}
            icon={<Award className="w-4 h-4" />}
            label="South Korean Manufacturing"
          />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  className,
  delay,
  icon,
  label,
}: {
  className?: string;
  delay: number;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`flex items-center gap-2 rounded-full bg-background/90 backdrop-blur-xl border border-border px-4 py-2 text-xs font-medium shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] ${className}`}
    >
      <span className="text-primary">{icon}</span>
      {label}
    </motion.div>
  );
}
