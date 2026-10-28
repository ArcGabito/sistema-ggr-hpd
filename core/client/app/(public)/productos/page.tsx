import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/app/components/site/page-hero";
import { FacadeArt } from "@/app/components/site/facade-art";
import { Reveal } from "@/app/components/site/reveal";
import { productCategories } from "@/app/lib/content";

export const metadata: Metadata = {
  title: "Productos",
  description: "Vidrios templados, laminados, insulados, Low-E y de control solar; sistemas de aluminio, muro cortina y soluciones decorativas.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Productos"
        title="Soluciones en vidrio y aluminio"
        description="Procesamos vidrio y fabricamos sistemas de aluminio para fachadas, ventanas e interiores, con acabados decorativos que dan identidad a cada proyecto."
        art="curtain"
      />

      <nav aria-label="Categorías" className="mx-auto mt-8 flex max-w-7xl flex-wrap gap-2 px-4 sm:px-6 lg:px-8">
        {productCategories.map((category) => (
          <a
            key={category.slug}
            href={`#${category.slug}`}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-600 ring-1 ring-ink-100 transition hover:text-ink-900 hover:ring-ink-300"
          >
            {category.name}
          </a>
        ))}
      </nav>

      {productCategories.map((category, index) => (
        <section key={category.slug} id={category.slug} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-14">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="text-sm font-semibold text-sky-600">0{index + 1}</p>
                <h2 className="mt-2 text-4xl font-bold tracking-tight">{category.name}</h2>
                <p className="mt-4 text-base text-ink-500">{category.description}</p>
                <div className="mt-8 hidden aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] lg:block">
                  <FacadeArt variant={category.art} className="size-full" />
                </div>
              </div>
            </Reveal>

            <ul className="grid content-start gap-4 sm:grid-cols-2">
              {category.lines.map((line, i) => (
                <Reveal key={line.name} delay={Math.min(i, 5) * 0.05}>
                  <li className="h-full">
                    <a
                      href={line.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-ink-100 p-6 transition hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold">{line.name}</h3>
                        <ArrowUpRight className="size-5 shrink-0 text-ink-300 transition group-hover:text-ink-900" aria-hidden />
                      </div>
                      <p className="mt-2 flex-1 text-sm text-ink-500">{line.tagline ?? "Consulta especificaciones y aplicaciones."}</p>
                      <span className="mt-5 text-xs font-semibold uppercase tracking-wide text-sky-700">Ver ficha</span>
                    </a>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </>
  );
}
