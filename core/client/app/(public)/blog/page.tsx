import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { FacadeArt } from "@/components/site/facade-art";
import { Reveal } from "@/components/site/reveal";
import { blogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre vidrio templado, laminado, insulado y Low-E, y tendencias del vidrio en la arquitectura.",
};

const formatPostDate = (date: string) =>
  new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Vidrio, arquitectura y diseño"
        description="Novedades, tendencias y guías sobre el uso del vidrio y el aluminio en la construcción."
        art="mirror"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <a
            href={featured.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group grid overflow-hidden rounded-[var(--radius-panel)] border border-ink-100 transition hover:shadow-xl hover:shadow-sky-100 md:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-sky-100 md:aspect-auto md:min-h-80">
              <FacadeArt variant={featured.art} className="absolute inset-0 size-full transition duration-700 group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                {featured.category} · {formatPostDate(featured.date)}
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight">{featured.title}</h2>
              <p className="mt-4 text-ink-500">{featured.summary}</p>
              <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold">
                Leer artículo <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </div>
          </a>
        </Reveal>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <Reveal key={post.href} delay={i * 0.06}>
              <a href={post.href} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col">
                <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-sky-100">
                  <FacadeArt variant={post.art} className="size-full transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                  {post.category} · {formatPostDate(post.date)}
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-sky-700">{post.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{post.summary}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
