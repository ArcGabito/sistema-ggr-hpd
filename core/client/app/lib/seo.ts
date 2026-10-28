import type { Metadata } from "next";
import { company } from "./site-data";

/** URL pública del sitio. Open Graph, el sitemap y la URL canónica necesitan URLs absolutas. */
export const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const siteName = company.name;

export const defaultTitle = "HPD Glass Group | Vidrio y aluminio arquitectónico";

export const defaultDescription =
  "Más de 27 años transformando espacios con calidad en vidrio y aluminio. Vidrios templados, laminados, insulados y Low-E, muro cortina y soluciones decorativas con certificación ISO 9001 e ISO 45001.";

export const keywords = [
  "HPD Glass Group",
  "vidrio templado",
  "vidrio laminado",
  "vidrio insulado",
  "vidrio Low-E",
  "vidrio de control solar",
  "muro cortina",
  "carpintería de aluminio",
  "ventanas de aluminio",
  "panel de aluminio compuesto",
  "vidrios y aluminios Lima",
  "fachadas de vidrio Perú",
  "guías de remisión",
];

export const ogImage = {
  url: "/wallpaper.png",
  width: 2048,
  height: 1152,
  type: "image/png",
  alt: "HPD Glass Group: Sistema de Gestión de Despachos y Guías de Remisión",
};

/**
 * Metadatos de una página pública. Next reemplaza el bloque `openGraph` completo del layout cuando
 * una página lo define, así que la imagen y los datos del sitio se repiten aquí.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const fullTitle = `${title} | ${siteName}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "es_PE",
      siteName,
      url: path,
      title: fullTitle,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
  };
}
