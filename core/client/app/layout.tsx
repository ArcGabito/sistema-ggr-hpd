import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { ToastProvider } from "@/app/components/ui/toast-provider";
import { company } from "@/app/lib/site-data";
import { defaultDescription, defaultTitle, keywords, ogImage, siteName, siteUrl } from "@/app/lib/seo";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords,
  authors: [{ name: company.legalName, url: company.website }],
  creator: company.legalName,
  publisher: company.legalName,
  category: "construction",
  alternates: { canonical: "/" },
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName,
    url: "/",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#86a9cc",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PE" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
