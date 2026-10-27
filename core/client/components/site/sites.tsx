import { MapPin } from "lucide-react";
import { sites } from "@/lib/site-data";
import { Reveal } from "./reveal";

export function Sites() {
  return (
    <section id="sedes" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Nuestras sedes</h2>
        <p className="max-w-sm text-base text-ink-500">Operamos y despachamos desde Lima y Cañete hacia todo el país.</p>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {sites.map((site, i) => (
          <Reveal key={site.name} delay={i * 0.08}>
            <article className="h-full rounded-[var(--radius-card)] border border-ink-100 p-7 transition hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100">
              <span className="grid size-11 place-items-center rounded-full bg-sky-100 text-sky-700">
                <MapPin className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{site.name}</h3>
              <p className="mt-2 text-sm text-ink-500">{site.address}</p>
              <p className="text-sm font-medium text-ink-700">{site.city}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
