import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { FacadeArt } from "@/app/components/site/facade-art";
import { RichText } from "@/app/components/site/rich-text";
import { getPublishedPost } from "@/app/lib/blog";
import { pageMetadata } from "@/app/lib/seo";

// La API puede estar en reposo (escala a cero) y su base en pausa: el primer pedido tarda más.
export const maxDuration = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Artículo no encontrado", robots: { index: false } };
  const metadata = pageMetadata({ title: post.title, description: post.summary, path: `/blog/${post.slug}` });
  return { ...metadata, openGraph: { ...metadata.openGraph, type: "article", publishedTime: post.publishedAt ?? undefined } };
}

export default async function BlogPostPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const published = post.publishedAt
    ? new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeZone: "America/Lima" }).format(new Date(post.publishedAt))
    : null;

  return (
    <article className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-[var(--radius-panel)] bg-sky-300">
        <FacadeArt variant={post.coverArt} anchor="top" className="absolute inset-0 -z-10 size-full" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink-900/85 via-ink-900/40 to-transparent" />
        <div className="flex min-h-96 flex-col justify-end px-6 py-10 text-white sm:px-12 lg:px-16">
          <Link href="/blog" className="mb-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25">
            <ArrowLeft className="size-4" aria-hidden /> Blog
          </Link>
          <p className="mt-16 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
            {post.category}
            {published ? ` · ${published}` : ""}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
          <p className="mt-4 max-w-2xl text-white/85">{post.summary}</p>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        {post.content ? <RichText source={post.content} className="text-lg" /> : null}
        {post.externalUrl ? (
          <a
            href={post.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-700"
          >
            Leer la publicación original <ArrowUpRight className="size-4" aria-hidden />
          </a>
        ) : null}
        {post.authorName ? <p className="mt-10 border-t border-ink-100 pt-6 text-sm text-ink-500">Publicado por {post.authorName}</p> : null}
      </div>
    </article>
  );
}
