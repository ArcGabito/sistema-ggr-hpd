import { Hero } from "@/app/components/site/hero";
import { About } from "@/app/components/site/about";
import { Catalog } from "@/app/components/site/catalog";
import { Process } from "@/app/components/site/process";
import { Commitments } from "@/app/components/site/commitments";
import { Sites } from "@/app/components/site/sites";
import { ContactSection } from "@/app/components/site/contact-form";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Catalog />
      <Process />
      <Commitments />
      <Sites />
      <ContactSection />
    </>
  );
}
