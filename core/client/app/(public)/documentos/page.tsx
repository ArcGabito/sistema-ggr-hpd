import type { Metadata } from "next";
import { PageHero } from "@/app/components/site/page-hero";
import { DocumentLibrary } from "@/app/components/site/document-library";

export const metadata: Metadata = {
  title: "Documentos",
  description: "Fichas técnicas, normas, catálogos y manuales de vidrios y aluminios de HPD Glass Group.",
};

export default function DocumentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Biblioteca de documentos"
        title="Documentos y herramientas"
        description="Fichas técnicas, normas, catálogos y manuales para especificar y usar correctamente nuestros vidrios y aluminios."
        art="insulated"
      />
      <DocumentLibrary />
    </>
  );
}
