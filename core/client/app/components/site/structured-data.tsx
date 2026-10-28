import { company, sites, socials } from "@/app/lib/site-data";
import { defaultDescription, siteUrl } from "@/app/lib/seo";

/** Datos estructurados (schema.org) de la empresa para buscadores. */
export function OrganizationStructuredData() {
  const addresses = sites.map((site) => {
    const [district, province] = site.city.split(", ");
    const [latitude, longitude] = site.coordinates.split(",").map(Number);
    return {
      "@type": "Place",
      name: site.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address,
        addressLocality: district,
        addressRegion: province,
        addressCountry: "PE",
      },
      geo: { "@type": "GeoCoordinates", latitude, longitude },
    };
  });

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: company.name,
    legalName: company.legalName,
    taxID: company.ruc,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/wallpaper.png`,
    description: defaultDescription,
    slogan: company.tagline,
    telephone: "+51-1-611-0000",
    email: company.emails.sales,
    address: addresses[0].address,
    location: addresses,
    contactPoint: [
      { "@type": "ContactPoint", contactType: "sales", telephone: "+51-1-611-0000", email: company.emails.sales, areaServed: "PE", availableLanguage: ["es"] },
      { "@type": "ContactPoint", contactType: "customer service", email: company.emails.projects, areaServed: "PE", availableLanguage: ["es"] },
    ],
    sameAs: socials.map((social) => social.href),
  };

  return (
    <script
      type="application/ld+json"
      // Se escapa "<" para que el JSON no pueda cerrar la etiqueta <script>.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
