import { Header } from "@/app/components/site/header";
import { Footer } from "@/app/components/site/footer";
import { OrganizationStructuredData } from "@/app/components/site/structured-data";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizationStructuredData />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
