import { MapPin, Navigation } from "lucide-react";
import { sites } from "@/app/lib/site-data";
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
            <article className="flex h-full flex-col rounded-[var(--radius-card)] border border-ink-100 p-7 transition hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100">
              <span className="grid size-11 place-items-center rounded-full bg-sky-100 text-sky-700">
                <MapPin className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{site.name}</h3>
              <p className="mt-2 text-sm text-ink-500">{site.address}</p>
              <p className="text-sm font-medium text-ink-700">{site.city}</p>
              <div className="mt-6 flex gap-2 pt-0 md:mt-auto md:pt-6">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${site.coordinates}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
                >
                  <MapPin className="size-3.5" aria-hidden /> Google Maps
                </a>
                <a
                  href={`https://waze.com/ul?ll=${site.coordinates}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
                >
                  <Navigation className="size-3.5" aria-hidden /> Waze
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
