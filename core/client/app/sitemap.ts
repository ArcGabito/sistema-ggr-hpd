import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getPublishedPosts } from "@/app/lib/blog";
import { siteUrl } from "@/app/lib/seo";

// La API puede estar en reposo (escala a cero) y su base en pausa: el primer pedido tarda más.
export const maxDuration = 60;

const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/productos", changeFrequency: "monthly", priority: 0.9 },
  { path: "/proyectos", changeFrequency: "monthly", priority: 0.9 },
  { path: "/nosotros", changeFrequency: "yearly", priority: 0.7 },
  { path: "/contacto", changeFrequency: "yearly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/documentos", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Incluye los artículos propios del blog, que cambian desde el dashboard.
  await connection();
  const lastModified = new Date();
  const posts = (await getPublishedPosts()).filter((post) => !post.externalUrl);

  return [
    ...routes.map(({ path, changeFrequency, priority }) => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency,
      priority,
      images: path === "" ? [`${siteUrl}/wallpaper.png`] : undefined,
    })),
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt ?? lastModified),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
