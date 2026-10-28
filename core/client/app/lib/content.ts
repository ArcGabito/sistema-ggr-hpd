import type { FacadeVariant } from "./site-data";

const SITE = "https://www.hpdglass.com";

// ---------- Nosotros ----------

export const companyFigures = [
  { value: "27+", label: "años de experiencia" },
  { value: "28,000 m²", label: "de planta de procesamiento" },
  { value: "200+", label: "proyectos realizados" },
  { value: "40+", label: "inmobiliarias y constructoras" },
  { value: "200+", label: "colaboradores" },
  { value: "2015", label: "certificados ISO 9001 e ISO 45001" },
] as const;

export const pillars = [
  {
    title: "Excelencia en calidad",
    body: "Productos de alto desempeño, durables y funcionales, respaldados por nuestros sistemas de gestión ISO 9001 e ISO 45001.",
  },
  {
    title: "Innovación y sostenibilidad",
    body: "Tecnología avanzada y procesos eficientes que reducen el impacto ambiental de cada proyecto.",
  },
  {
    title: "Seguridad y eficiencia",
    body: "Soluciones que priorizan la seguridad estructural y el uso responsable de los recursos.",
  },
  {
    title: "Confianza y compromiso",
    body: "Relaciones duraderas con nuestros clientes, construidas con transparencia, ética y servicio.",
  },
] as const;

export const memberships = [
  { name: "LRQA", detail: "Certificación internacional de ISO 9001 e ISO 45001, acreditada por UKAS." },
  { name: "GBC Perú", detail: "Miembros del Perú Green Building Council, por la construcción sostenible." },
  { name: "NGA", detail: "Asociación con estándares internacionales de calidad, seguridad y eficiencia en vidrio y aluminio." },
] as const;

export const sustainability = [
  {
    title: "Política de gestión integrada",
    body: "Calidad, seguridad y sostenibilidad en cada operación, sostenidas por certificaciones y procesos eficientes.",
  },
  {
    title: "Infraestructura sostenible",
    body: "Optimizamos recursos con tecnología avanzada para reducir el impacto ambiental y responder al mercado.",
  },
] as const;

// ---------- Productos ----------

export interface ProductLine {
  name: string;
  tagline?: string;
  href: string;
}

export interface ProductCategory {
  slug: string;
  name: string;
  description: string;
  art: FacadeVariant;
  lines: ProductLine[];
}

const category = (slug: string) => `${SITE}/categoria-de-producto/${slug}/`;
const product = (slug: string) => `${SITE}/productos/${slug}/`;

export const productCategories: ProductCategory[] = [
  {
    slug: "vidrios",
    name: "Vidrios",
    description: "Vidrios arquitectónicos procesados en nuestra planta de Chilca para seguridad, confort y eficiencia energética.",
    art: "curtain",
    lines: [
      { name: "Vidrios templados", tagline: "Calidad y alta resistencia en cada proyecto.", href: product("vidrios-templados-2") },
      { name: "Vidrios termoendurecidos", href: category("vidrios-termoendurecidos-es") },
      { name: "Vidrios laminados", href: category("vidrios-laminados-es") },
      { name: "Vidrios insulados", href: category("vidrios-insulados-es") },
      { name: "Vidrios de control solar", href: category("vidrios-control-solar-es") },
      { name: "Vidrios Low-E", href: category("vidrios-low-e-es") },
      { name: "Vidrios primarios", href: category("vidrios-primarios-es") },
    ],
  },
  {
    slug: "aluminios",
    name: "Aluminios",
    description: "Sistemas de aluminio de alto rendimiento para fachadas, ventanas y carpintería de estructuras modernas.",
    art: "window",
    lines: [
      { name: "Sistemas de muro cortina", href: category("sistema-de-muro-cortina-es") },
      { name: "Series de carpintería de aluminio", href: category("series-de-aluminio-es") },
      { name: "Perfiles convencionales", tagline: "Durabilidad y resistencia para cada proyecto.", href: product("perfiles-convencionales-2") },
      { name: "Ventana proyectante VPR 042", tagline: "Confort en proyectos exigentes.", href: product("ventana-proyectante-vpr-042") },
      { name: "Ventana proyectante VPR 036", tagline: "Hermeticidad y funcionalidad con apertura controlada.", href: product("ventana-proyectante-vpr-036") },
      { name: "Ventana corrediza VCO 043", tagline: "Corredizo robusto, térmico y versátil.", href: product("ventana-corrediza-vco-043") },
    ],
  },
  {
    slug: "soluciones-decorativas",
    name: "Soluciones decorativas",
    description: "Acabados estéticos y funcionales que dan identidad a fachadas e interiores.",
    art: "slats",
    lines: [
      { name: "Panel de aluminio compuesto (PAC)", tagline: "Diseño contemporáneo y desempeño superior.", href: product("panel-de-aluminio-compuesto") },
      { name: "Lamas de aluminio", href: category("lamas-de-aluminio-es") },
      { name: "Gres porcelánico laminado", href: category("gres-porcelanico-laminado-es") },
      { name: "Muros verdes", href: category("muros-verdes-es") },
      { name: "Espejos", href: category("espejos-es-es") },
    ],
  },
];

// ---------- Proyectos ----------

export type ProjectCategory = "Empresariales" | "Comerciales" | "Residenciales" | "Varios" | "En ejecución";

export interface Project {
  name: string;
  district: string;
  systems: string[];
  badges?: string[];
}

export const projectCategories: { name: ProjectCategory; description: string; projects: Project[] }[] = [
  {
    name: "Empresariales",
    description: "Edificios corporativos y de oficinas con fachadas de alto desempeño.",
    projects: [
      { name: "Pardo 200", district: "Miraflores", systems: ["Vidrio insulado", "Muro cortina", "Lamas decorativas"] },
      { name: "Centro Empresarial More", district: "Santiago de Surco", systems: ["Vidrio templado e insulado", "Muro cortina", "PAC"] },
      { name: "Time", district: "Santiago de Surco", systems: ["Oficinas"], badges: ["Premio BAQ 2020"] },
      { name: "Centro de Convenciones PUCP – NOS", district: "Santiago de Surco", systems: ["Muro cortina", "PAC", "Vidrio insulado y templado"], badges: ["LEED"] },
      { name: "Edificio Santa Cruz", district: "Miraflores", systems: ["Vidrio laminado, insulado y templado", "Muro cortina", "Perfiles de aluminio"], badges: ["EDGE", "LEED Silver"] },
      { name: "Centro Empresarial Santa Cruz", district: "Miraflores", systems: ["Vidrio templado e insulado", "Muro cortina", "Revestimientos"], badges: ["LEED Platinum"] },
      { name: "Camino Real", district: "San Isidro", systems: ["Vidrio insulado", "Muro cortina", "Sistema convencional"], badges: ["LEED Silver"] },
      { name: "Edificio Corporativo Conquistadores", district: "San Isidro", systems: ["Muro cortina"], badges: ["LEED Platinum"] },
      { name: "Roosevelt 6000", district: "Miraflores", systems: ["Ventanas", "Mamparas", "Sistema convencional"], badges: ["LEED"] },
      { name: "Qualis", district: "Pueblo Libre", systems: ["Vidrio de control solar", "Ventanas", "Perfilería de aluminio"] },
      { name: "POD Home, Office & Life Styles", district: "Miraflores", systems: ["Departamentos y oficinas"] },
      { name: "Smart Oficinas Boutique", district: "Magdalena del Mar", systems: ["Vidrio de control solar", "Muro cortina", "Mamparas"] },
    ],
  },
  {
    name: "Comerciales",
    description: "Centros comerciales, hoteles y tiendas con espacios luminosos y seguros.",
    projects: [
      { name: "Reducto 360°", district: "Miraflores", systems: ["Ventanas", "Mamparas", "Barandas"] },
      { name: "Centro Comercial Parque La Molina", district: "La Molina", systems: ["Muro cortina", "PAC", "Vidrio laminado y templado", "Espejos"] },
      { name: "Hotel Vistamar", district: "Miraflores", systems: ["Puertas de ducha en vidrio templado", "Acero inoxidable"] },
      { name: "Hampton by Hilton Lima", district: "San Isidro", systems: ["Muro cortina stick", "Vidrio laminado de control solar"] },
      { name: "NM Lima Hotel", district: "San Isidro", systems: ["Mamparas", "Ventanas", "Vidrio insulado de control solar"] },
      { name: "H&M – Jockey Plaza", district: "Santiago de Surco", systems: ["Muro cortina stick", "Vidrio laminado", "Mamparas"] },
      { name: "Time", district: "Santiago de Surco", systems: ["Muro cortina", "Vidrio reflectivo"] },
      { name: "Smart Oficinas Boutique", district: "Magdalena del Mar", systems: ["Muro cortina stick", "Vidrio de control solar"] },
      { name: "Pardo 200", district: "Miraflores", systems: ["Vidrio insulado", "Muro cortina", "Lamas"] },
    ],
  },
  {
    name: "Residenciales",
    description: "Viviendas con luz natural, seguridad y aporte a certificaciones LEED y EDGE.",
    projects: [
      { name: "Rivera Navarrete 548", district: "San Isidro", systems: ["Vidrio templado", "Ventanas y mamparas", "Perfiles convencionales"] },
      { name: "The Modern", district: "Barranco", systems: ["Vidrio y aluminio"] },
      { name: "Alto Bellavista Etapa I", district: "Bellavista", systems: ["Vidrio y aluminio"] },
      { name: "MET", district: "La Victoria", systems: ["Vidrio templado", "Ventanas y mamparas", "Perfiles convencionales"] },
      { name: "ELANT", district: "La Victoria", systems: ["Vidrio templado", "Mamparas", "Perfiles de aluminio"] },
      { name: "Alto Venezuela III", district: "San Miguel", systems: ["Vidrio templado", "Ventanas y mamparas"] },
      { name: "Central Park", district: "Cercado de Lima", systems: ["Vidrio y aluminio", "22 pisos"] },
      { name: "Sol 135", district: "Barranco", systems: ["Vidrio templado y laminado", "Ventanas y mamparas"] },
      { name: "La Jolla Asia", district: "Asia", systems: ["Vidrio templado", "Aluminio"] },
      { name: "Grau 15", district: "Barranco", systems: ["Vidrio templado", "Ventanas y mamparas", "Perfiles de aluminio"] },
      { name: "Reducto 360°", district: "Miraflores", systems: ["Ventanas", "Mamparas", "Barandas"] },
      { name: "Roosevelt 6000", district: "Miraflores", systems: ["Ventanas", "Mamparas"], badges: ["LEED"] },
    ],
  },
  {
    name: "Varios",
    description: "Instituciones educativas, de salud y del Estado.",
    projects: [
      { name: "SBS – Nueva Sede", district: "San Isidro", systems: ["Soluciones integrales en vidrio"] },
      { name: "Instituto SENATI", district: "Independencia", systems: ["Muro cortina stick", "Vidrio laminado", "PAC"] },
      { name: "Edificio Smart USIL", district: "La Molina", systems: ["Muro cortina stick y frame", "9 pisos"] },
      { name: "Villa Deportiva Nacional – VIDENA", district: "San Luis", systems: ["Vidrio templado, laminado e insulado"] },
      { name: "Clínica San Pablo", district: "La Victoria", systems: ["Muro cortina stick", "Vidrio termoendurecido laminado", "PAC"] },
      { name: "Centro Peruano de Audición y Lenguaje – CPAL", district: "San Luis", systems: ["Muro cortina frame", "Vidrio insulado", "Mamparas"] },
      { name: "Ministerio de Educación", district: "San Borja", systems: ["Vidrio templado"] },
      { name: "Hospital Regional Lambayeque", district: "Chiclayo", systems: ["Vidrio templado", "Ventanas", "Mamparas"] },
      { name: "Instituto Nacional Cardiovascular – INCOR", district: "Lince", systems: ["Vidrio templado", "Sistema convencional"] },
      { name: "Universidad Privada del Norte – UPN", district: "Cercado de Lima", systems: ["Vidrio de control solar", "Fachada stick"] },
      { name: "Centro de Convenciones PUCP – NOS", district: "Santiago de Surco", systems: ["Muro cortina", "PAC"], badges: ["LEED"] },
    ],
  },
  {
    name: "En ejecución",
    description: "Edificios y viviendas que estamos construyendo hoy.",
    projects: [
      { name: "Clínica Internacional – Nueva Torre", district: "San Borja", systems: ["Vidrios y perfiles de aluminio"] },
      { name: "Marina City Center", district: "San Miguel", systems: ["Muro cortina stick", "PAC", "Vidrio templado"] },
      { name: "Edificio More", district: "Santiago de Surco", systems: ["Muro cortina unitizado y stick", "Vidrio insulado"] },
      { name: "Edificio Santa Cruz 4", district: "Miraflores", systems: ["Muro cortina"] },
      { name: "Edificio Time Aramburu", district: "San Isidro", systems: ["Muro cortina", "Ventanas", "Rejillas"] },
      { name: "Edificio Joy", district: "San Isidro", systems: ["Vidrio y aluminio"] },
      { name: "Edificio One Place", district: "Miraflores", systems: ["Series de ventanas", "Vidrio y aluminio"] },
      { name: "Edificio Family Too", district: "San Miguel", systems: ["Ventanas", "Mamparas"] },
      { name: "Edificio Llano Zapata", district: "Miraflores", systems: ["Ventanas", "Mamparas", "Celosías", "Barandas"] },
      { name: "Edificio Brera", district: "Miraflores", systems: ["Vidrio y aluminio"] },
      { name: "Edificio Alto Bellavista II", district: "Bellavista", systems: ["Ventanas", "Mamparas", "Puertas"] },
      { name: "UTP Juliaca – UTP Huamanga", district: "Juliaca y Huamanga", systems: ["Envolvente arquitectónica"] },
    ],
  },
];

// ---------- Documentos ----------

export const documentCategories = ["Fichas técnicas", "Normas técnicas", "Catálogos", "Manuales"] as const;
export type DocumentCategory = (typeof documentCategories)[number];

export interface LibraryDocument {
  title: string;
  code: string;
  category: DocumentCategory;
  material: "Vidrios" | "Aluminios";
  published: string;
  href: string;
}

export const documents: LibraryDocument[] = [
  {
    code: "CC-E027",
    title: "Ficha técnica: vidrio serigrafiado automotriz",
    category: "Fichas técnicas",
    material: "Vidrios",
    published: "Junio 2025",
    href: `${SITE}/wp-content/uploads/2025/06/CC-E027-Ficha-Tecnica-Vidrio-Serigrafiado-Automotriz.pdf`,
  },
];

// ---------- Blog ----------

export interface BlogPost {
  title: string;
  date: string;
  category: "Arquitectura" | "Diseño";
  summary: string;
  href: string;
  art: FacadeVariant;
}

export const blogPosts: BlogPost[] = [
  {
    title: "HPD Glassgroup impulsa la innovación con vidrio laminado",
    date: "2025-05-19",
    category: "Arquitectura",
    summary: "Cómo el vidrio laminado forma parte de nuestra apuesta por desarrollar nuevos productos.",
    href: `${SITE}/hpd-glassgroup-impulsa-la-innovacion-con-vidrio-laminado/`,
    art: "insulated",
  },
  {
    title: "Vidrio laminado en arquitectura: seguridad y confort en el diseño moderno",
    date: "2025-05-19",
    category: "Arquitectura",
    summary: "Por qué el vidrio laminado aporta seguridad y confort a los edificios contemporáneos.",
    href: `${SITE}/vidrio-laminado-en-arquitectura-seguridad-y-confort-en-el-diseno-moderno/`,
    art: "window",
  },
  {
    title: "Vidrio templado en arquitectura: resistencia y seguridad en el diseño moderno",
    date: "2025-05-19",
    category: "Arquitectura",
    summary: "La resistencia del vidrio templado y su lugar en los proyectos arquitectónicos actuales.",
    href: `${SITE}/vidrio-templado-en-arquitectura-resistencia-y-seguridad-en-el-diseno-moderno/`,
    art: "curtain",
  },
  {
    title: "Vidrio Low-E: eficiencia energética y confort térmico en la construcción",
    date: "2025-02-20",
    category: "Arquitectura",
    summary: "Cómo el vidrio de baja emisividad ayuda a ahorrar energía y mantener el confort térmico.",
    href: `${SITE}/vidrio-y-sostenibilidad-un-futuro-mas-verde/`,
    art: "tower",
  },
  {
    title: "La innovación del vidrio: tendencias y aplicaciones en arquitectura",
    date: "2025-02-19",
    category: "Arquitectura",
    summary: "Un recorrido por las tendencias actuales del vidrio y sus usos en arquitectura.",
    href: `${SITE}/la-importancia-del-vidrio-en-la-arquitectura-de-hoy/`,
    art: "panels",
  },
  {
    title: "Vidrio insulado: mayor aislamiento térmico y acústico para edificaciones sostenibles",
    date: "2025-02-18",
    category: "Diseño",
    summary: "El papel del vidrio insulado en el aislamiento térmico y acústico de edificios sostenibles.",
    href: `${SITE}/la-innovacion-del-vidrio-tendencias-y-aplicaciones/`,
    art: "sliding",
  },
];
