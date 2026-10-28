import type { MetadataRoute } from "next";
import { siteUrl } from "@/app/lib/seo";

const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/productos", changeFrequency: "monthly", priority: 0.9 },
  { path: "/proyectos", changeFrequency: "monthly", priority: 0.9 },
  { path: "/nosotros", changeFrequency: "yearly", priority: 0.7 },
  { path: "/contacto", changeFrequency: "yearly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/documentos", changeFrequency: "monthly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
    images: path === "" ? [`${siteUrl}/wallpaper.png`] : undefined,
  }));
}
