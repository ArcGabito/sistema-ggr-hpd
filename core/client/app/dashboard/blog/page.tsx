"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Eye, EyeOff, PenLine, Plus, Trash2 } from "lucide-react";
import { sileo } from "sileo";
import { api } from "@/app/lib/api";
import { useApi } from "@/app/lib/use-api";
import { postHref } from "@/app/lib/blog";
import { formatDate } from "@/app/lib/format";
import type { BlogPostDetail, BlogPostSummary } from "@/app/lib/types";
import { ButtonLink } from "@/app/components/ui/button";
import { FacadeArt } from "@/app/components/site/facade-art";
import { Card, EmptyState, ErrorState, FillScroll, Loading, PageHeader, td, th } from "@/app/components/dashboard/ui";

export default function BlogAdminPage() {
  const { data, error, loading, reload, setData } = useApi<BlogPostSummary[]>("admin/blog");
  const [pendingId, setPendingId] = useState<number | null>(null);

  const togglePublished = async (post: BlogPostSummary) => {
    setPendingId(post.id);
    try {
      const detail = await api<BlogPostDetail>(`admin/blog/${post.id}`);
      const updated = await api<BlogPostDetail>(`admin/blog/${post.id}`, {
        method: "PUT",
        json: { ...detail, isPublished: !post.isPublished },
      });
      setData((current) => current?.map((p) => (p.id === updated.id ? updated : p)) ?? null);
      sileo.success({ title: updated.isPublished ? "Artículo publicado" : "Artículo despublicado", description: updated.title });
    } catch (err) {
      sileo.error({ title: "No se pudo actualizar", description: (err as Error).message });
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (post: BlogPostSummary) => {
    if (!window.confirm(`¿Eliminar "${post.title}"? Esta acción no se puede deshacer.`)) return;
    setPendingId(post.id);
    try {
      await api(`admin/blog/${post.id}`, { method: "DELETE" });
      setData((current) => current?.filter((p) => p.id !== post.id) ?? null);
      sileo.success({ title: "Artículo eliminado", description: post.title });
    } catch (err) {
      sileo.error({ title: "No se pudo eliminar", description: (err as Error).message });
    } finally {
      setPendingId(null);
    }
  };

  const published = data?.filter((p) => p.isPublished).length ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Blog"
        description={data ? `${published} publicado(s) · ${data.length - published} borrador(es)` : "Publicaciones del blog del sitio web."}
        actions={
          <ButtonLink href="/dashboard/blog/nuevo">
            <Plus className="size-4" aria-hidden /> Nuevo artículo
          </ButtonLink>
        }
      />

      <Card className="flex min-h-96 flex-1 flex-col overflow-hidden">
        {loading && !data ? <Loading /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {data && data.length === 0 ? <EmptyState title="Aún no hay artículos" description="Crea el primer artículo del blog." /> : null}
        {data && data.length > 0 ? (
          <FillScroll>
            <table className="w-full min-w-[860px] text-sm">
              <thead className="sticky top-0 z-10 bg-ink-50 shadow-[inset_0_-1px_0_var(--color-ink-100)]">
                <tr>
                  <th className={th}>Artículo</th>
                  <th className={th}>Categoría</th>
                  <th className={th}>Estado</th>
                  <th className={th}>Publicado</th>
                  <th className={`${th} text-right`}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.map((post) => (
                  <tr key={post.id} className="hover:bg-sky-50/50">
                    <td className={td}>
                      <div className="flex items-center gap-4">
                        <span className="block h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                          <FacadeArt variant={post.coverArt} className="size-full" />
                        </span>
                        <div className="min-w-0">
                          <Link href={`/dashboard/blog/${post.id}`} className="font-semibold hover:text-sky-700">
                            {post.title}
                          </Link>
                          <p className="max-w-xl truncate text-xs text-ink-400">
                            {post.externalUrl ? "Enlace externo · " : ""}
                            {post.summary}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={td}>{post.category}</td>
                    <td className={td}>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          post.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-600"
                        }`}
                      >
                        {post.isPublished ? "Publicado" : "Borrador"}
                      </span>
                    </td>
                    <td className={td}>{formatDate(post.publishedAt)}</td>
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-1">
                        {post.isPublished ? (
                          <a
                            href={postHref(post)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="grid size-9 place-items-center rounded-full text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                            aria-label="Ver en el sitio"
                            title="Ver en el sitio"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        ) : null}
                        <Link
                          href={`/dashboard/blog/${post.id}`}
                          className="grid size-9 place-items-center rounded-full text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                          aria-label="Editar"
                          title="Editar"
                        >
                          <PenLine className="size-4" />
                        </Link>
                        <button
                          type="button"
                          disabled={pendingId === post.id}
                          onClick={() => togglePublished(post)}
                          className="grid size-9 place-items-center rounded-full text-ink-500 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40"
                          aria-label={post.isPublished ? "Despublicar" : "Publicar"}
                          title={post.isPublished ? "Despublicar" : "Publicar"}
                        >
                          {post.isPublished ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                        <button
                          type="button"
                          disabled={pendingId === post.id}
                          onClick={() => remove(post)}
                          className="grid size-9 place-items-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                          aria-label="Eliminar"
                          title="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </FillScroll>
        ) : null}
      </Card>
    </div>
  );
}
