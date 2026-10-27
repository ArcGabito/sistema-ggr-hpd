import type { Metadata } from "next";
import { Award, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Process } from "@/components/site/process";
import { Commitments } from "@/components/site/commitments";
import { companyFigures, memberships, pillars, sustainability } from "@/lib/content";
import { brands } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Más de 27 años transformando vidrio y aluminio con una planta de 28,000 m², tecnología europea y certificación ISO 9001 e ISO 45001.",
};

const pillarIcons = [Award, Sparkles, ShieldCheck, Leaf];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Nosotros"
        title="27 años de tecnología y calidad en vidrio y aluminio"
        description="Somos un grupo empresarial peruano que fabrica y comercializa vidrios, aluminios y soluciones decorativas para la arquitectura, con presencia nacional y mirada internacional."
        art="tower"
      />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {companyFigures.map((figure, i) => (
            <Reveal key={figure.label} delay={i * 0.05}>
              <dd className="text-3xl font-bold tracking-tight sm:text-4xl">{figure.value}</dd>
              <dt className="mt-2 text-sm text-ink-500">{figure.label}</dt>
            </Reveal>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <Reveal>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Compromiso, seguridad y calidad</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-500">
              Nuestra planta de 28,000 m² en Chilca opera con tecnología 100% europea y procesos certificados. Desde 2015 mantenemos los
              sistemas de gestión ISO 9001 e ISO 45001, certificados por LRQA y acreditados por UKAS.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((pillar, i) => {
              const Icon = pillarIcons[i];
              return (
                <Reveal key={pillar.title} delay={i * 0.06}>
                  <article className="h-full rounded-[var(--radius-card)] border border-ink-100 p-6">
                    <span className="grid size-11 place-items-center rounded-full bg-ink-900 text-white">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{pillar.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">{pillar.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Commitments />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-[var(--radius-panel)] bg-ink-800 p-8 text-white sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Certificaciones y membresías</p>
              <ul className="mt-6 divide-y divide-white/10">
                {memberships.map((item) => (
                  <li key={item.name} className="py-4">
                    <p className="text-xl font-bold">{item.name}</p>
                    <p className="mt-1 text-sm text-ink-300">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h-full rounded-[var(--radius-panel)] bg-sky-400 p-8 text-white sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Sostenibilidad</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Construcción sostenible</h2>
              <ul className="mt-6 space-y-5">
                {sustainability.map((item) => (
                  <li key={item.title}>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-white/85">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <Process />

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Marcas que respaldan nuestra calidad</p>
          <ul className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-5">
            {brands.map((brand) => (
              <li key={brand} className="text-xl font-bold tracking-tight text-ink-300 transition hover:text-ink-900">
                {brand}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </>
  );
}
