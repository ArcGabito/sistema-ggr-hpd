import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { ToastProvider } from "@/app/components/ui/toast-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HPD Glass Group | Vidrio y aluminio arquitectónico",
    template: "%s | HPD Glass Group",
  },
  description:
    "Más de 27 años transformando espacios con calidad en vidrio y aluminio. Procesamiento, despacho e instalación con certificación ISO 9001 e ISO 45001.",
};

export const viewport: Viewport = {
  themeColor: "#86a9cc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
