import { Header } from "@/app/components/site/header";
import { Footer } from "@/app/components/site/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
