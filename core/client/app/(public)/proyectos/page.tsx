import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ProjectsBrowser } from "@/components/site/projects-browser";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Edificios empresariales, comerciales, residenciales e institucionales con vidrio y aluminio de HPD Glass Group.",
};

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
