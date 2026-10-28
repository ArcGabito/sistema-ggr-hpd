import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/app/components/site/page-hero";
import { FacadeArt } from "@/app/components/site/facade-art";
import { Reveal } from "@/app/components/site/reveal";
import { getPublishedPosts, postHref } from "@/app/lib/blog";
import { pageMetadata } from "@/app/lib/seo";
import type { BlogPostSummary } from "@/app/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Artículos sobre vidrio templado, laminado, insulado y Low-E, y tendencias del vidrio en la arquitectura.",
  path: "/blog",
});

const formatPostDate = (date: string | null) =>
  date ? new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeZone: "America/Lima" }).format(new Date(date)) : "";

function PostLink({ post, className, children }: { post: BlogPostSummary; className?: string; children: React.ReactNode }) {
  return post.externalUrl ? (
    <a href={post.externalUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={postHref(post)} className={className}>
      {children}
    </Link>
  );
}

export default async function BlogPage() {
  // Los artículos se administran desde el dashboard: se leen en cada visita.
  await connection();
  const [featured, ...rest] = await getPublishedPosts();

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Vidrio, arquitectura y diseño"
        description="Novedades, tendencias y guías sobre el uso del vidrio y el aluminio en la construcción."
        art="mirror"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {!featured ? (
          <p className="py-16 text-center text-ink-500">Pronto publicaremos nuevos artículos.</p>
        ) : (
          <>
            <Reveal>
              <PostLink
                post={featured}
                className="group grid overflow-hidden rounded-[var(--radius-panel)] border border-ink-100 transition hover:shadow-xl hover:shadow-sky-100 md:grid-cols-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-sky-100 md:aspect-auto md:min-h-80">
                  <FacadeArt variant={featured.coverArt} className="absolute inset-0 size-full transition duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                    {featured.category} · {formatPostDate(featured.publishedAt)}
                  </p>
                  <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight">{featured.title}</h2>
                  <p className="mt-4 text-ink-500">{featured.summary}</p>
                  <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold">
                    Leer artículo <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </div>
              </PostLink>
            </Reveal>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, i) => (
                <Reveal key={post.id} delay={Math.min(i, 5) * 0.06}>
                  <PostLink post={post} className="group flex h-full flex-col">
                    <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-sky-100">
                      <FacadeArt variant={post.coverArt} className="size-full transition duration-700 group-hover:scale-105" />
                    </div>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                      {post.category} · {formatPostDate(post.publishedAt)}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-sky-700">{post.title}</h3>
                    <p className="mt-2 text-sm text-ink-500">{post.summary}</p>
                  </PostLink>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
