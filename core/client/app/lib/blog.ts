import { apiUrl } from "./session";
import type { BlogPostDetail, BlogPostSummary } from "./types";

export const blogCategories = ["Arquitectura", "Diseño", "Sostenibilidad", "Tendencias", "Noticias"] as const;

/** Enlace de un artículo: la publicación original si es externa, o su página en el sitio. */
export const postHref = (post: Pick<BlogPostSummary, "slug" | "externalUrl">) => post.externalUrl ?? `/blog/${post.slug}`;

// Lecturas del lado del servidor para el sitio público. Si la API no responde (por ejemplo, al
// compilar la imagen), el blog se muestra vacío en lugar de romper la página.
//
// Las respuestas quedan en la caché de datos de Next una semana. Cada pedido que llega a la API en
// reposo despierta también su base Azure SQL gratuita, que queda encendida una hora y gasta unos
// 1.800 de sus 100.000 vCore-segundos del mes, por breve que sea la visita: sin caché, el blog y
// el sitemap (que los buscadores piden seguido) agotaban la cuota antes de fin de mes. Al editar
// el blog desde el dashboard se invalida esta etiqueta (api/backend), así que los cambios se ven
// en la siguiente visita. Solo se guardan respuestas 200: si la API falla, se sirve la última copia.
export const BLOG_TAG = "blog";
const BLOG_CACHE = { revalidate: 60 * 60 * 24 * 7, tags: [BLOG_TAG] };

export async function getPublishedPosts(): Promise<BlogPostSummary[]> {
  try {
    const response = await fetch(`${apiUrl()}/api/blog`, { next: BLOG_CACHE });
    return response.ok ? ((await response.json()) as BlogPostSummary[]) : [];
  } catch {
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<BlogPostDetail | null> {
  try {
    const response = await fetch(`${apiUrl()}/api/blog/${encodeURIComponent(slug)}`, { next: BLOG_CACHE });
    return response.ok ? ((await response.json()) as BlogPostDetail) : null;
  } catch {
    return null;
  }
}
