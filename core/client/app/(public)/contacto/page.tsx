import type { Metadata } from "next";
import { PageHero } from "@/app/components/site/page-hero";
import { ContactSection } from "@/app/components/site/contact-form";
import { Sites } from "@/app/components/site/sites";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos o visítanos en Chorrillos, La Victoria o Chilca. Asesoría en vidrios y perfiles de aluminio para construcción.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Asesoría en vidrio y aluminio para tu obra"
        description="Completa tus datos y un asesor te contactará. Trabajamos bajo sistemas de gestión ISO 9001 e ISO 45001."
        art="sliding"
      />
      <div className="pt-10">
        <ContactSection />
      </div>
      <Sites />
    </>
  );
}
