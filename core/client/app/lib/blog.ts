import { apiUrl } from "./session";
import type { BlogPostDetail, BlogPostSummary } from "./types";

export const blogCategories = ["Arquitectura", "Diseño", "Sostenibilidad", "Tendencias", "Noticias"] as const;

/** Enlace de un artículo: la publicación original si es externa, o su página en el sitio. */
export const postHref = (post: Pick<BlogPostSummary, "slug" | "externalUrl">) => post.externalUrl ?? `/blog/${post.slug}`;

// Lecturas del lado del servidor para el sitio público. Si la API no responde (por ejemplo, al
// compilar la imagen), el blog se muestra vacío en lugar de romper la página.

export async function getPublishedPosts(): Promise<BlogPostSummary[]> {
  try {
    const response = await fetch(`${apiUrl()}/api/blog`, { cache: "no-store" });
    return response.ok ? ((await response.json()) as BlogPostSummary[]) : [];
  } catch {
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<BlogPostDetail | null> {
  try {
    const response = await fetch(`${apiUrl()}/api/blog/${encodeURIComponent(slug)}`, { cache: "no-store" });
    return response.ok ? ((await response.json()) as BlogPostDetail) : null;
  } catch {
    return null;
  }
}
