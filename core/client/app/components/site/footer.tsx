import Link from "next/link";
import { company, navigation, sites, socials } from "@/app/lib/site-data";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_0.8fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm text-ink-500">{company.tagline}.</p>
          <a href={company.phoneHref} className="mt-5 block text-sm font-semibold text-ink-900">
            {company.phone}
          </a>
          <a href={`mailto:${company.emails.sales}`} className="block text-sm text-ink-500 hover:text-ink-900">
            {company.emails.sales}
          </a>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">Sedes</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-600">
            {sites.map((site) => (
              <li key={site.name}>
                {site.address}
                <span className="block text-ink-400">{site.city}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">Navegación</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-ink-600 hover:text-ink-900">
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/ingresar" className="text-ink-600 hover:text-ink-900">
                Ingresar al sistema
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">Síguenos</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noopener noreferrer" className="text-ink-600 hover:text-ink-900">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-ink-400 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>
            {company.legalName} · RUC {company.ruc}
          </p>
          <p>© {new Date().getFullYear()} {company.name}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
