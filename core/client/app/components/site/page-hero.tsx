import type { FacadeVariant } from "@/app/lib/site-data";
import { FacadeArt } from "./facade-art";
import { Reveal } from "./reveal";

export function PageHero({
  eyebrow,
  title,
  description,
  art = "tower",
}: {
  eyebrow: string;
  title: string;
  description: string;
  art?: FacadeVariant;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative isolate grid overflow-hidden rounded-[var(--radius-panel)] bg-sky-50 md:grid-cols-[1.3fr_1fr]">
        <Reveal className="flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 max-w-lg text-base text-ink-500 sm:text-lg">{description}</p>
        </Reveal>
        <div className="relative hidden min-h-72 md:block">
          <FacadeArt variant={art} anchor="top" className="absolute inset-0 size-full" />
        </div>
      </div>
    </section>
  );
}
