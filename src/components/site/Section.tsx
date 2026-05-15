import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-3xl"}>
      <Reveal>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary/80">
          <span className="w-6 h-px bg-primary/60" />
          {eyebrow}
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl leading-[1.02] tracking-tight text-balance">
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.15}>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
