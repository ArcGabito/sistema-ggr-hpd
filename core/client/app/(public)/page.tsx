import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Catalog } from "@/components/site/catalog";
import { Process } from "@/components/site/process";
import { Commitments } from "@/components/site/commitments";
import { Sites } from "@/components/site/sites";
import { ContactSection } from "@/components/site/contact-form";

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
