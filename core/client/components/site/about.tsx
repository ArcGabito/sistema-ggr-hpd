import { brands, stats } from "@/lib/site-data";
import { Counter, Reveal } from "./reveal";

export function About() {
  return (
    <section id="nosotros" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Nosotros</h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-500">
            Somos un grupo empresarial peruano con más de 27 años fabricando y comercializando vidrios, aluminios y soluciones
            decorativas para la arquitectura. Nuestra planta de 28,000 m² opera con tecnología 100% europea y procesos certificados
            ISO 9001 e ISO 45001, para entregar cada proyecto con diseño, funcionalidad y seguridad.
          </p>
        </Reveal>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-10">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-4xl font-bold tracking-tight sm:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </dd>
              <dd className="mt-2 text-sm text-ink-500">{stat.label}</dd>
            </Reveal>
          ))}
        </dl>
      </div>

      <Reveal className="mt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Marcas que confían en nuestra calidad</p>
        <ul className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-5">
          {brands.map((brand) => (
            <li key={brand} className="text-xl font-bold tracking-tight text-ink-300 transition hover:text-ink-900">
              {brand}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
