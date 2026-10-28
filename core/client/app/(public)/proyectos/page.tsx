import type { Metadata } from "next";
import { pageMetadata } from "@/app/lib/seo";
import { PageHero } from "@/app/components/site/page-hero";
import { ProjectsBrowser } from "@/app/components/site/projects-browser";

export const metadata: Metadata = pageMetadata({
  title: "Proyectos",
  description: "Edificios empresariales, comerciales, residenciales e institucionales con vidrio y aluminio de HPD Glass Group.",
  path: "/proyectos",
});

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Proyectos"
        title="Innovación reflejada en cada proyecto"
        description="Más de 200 proyectos con muros cortina, ventanas, mamparas y revestimientos, varios de ellos con certificación LEED y EDGE."
        art="panels"
      />
      <ProjectsBrowser />
    </>
  );
}
