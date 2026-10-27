export const company = {
  name: "HPD Glass Group",
  legalName: "HPD Contratistas Generales S.A.C.",
  ruc: "20418528011",
  tagline: "Transformando espacios con calidad en vidrio y aluminio",
  phone: "(51-1) 611-0000",
  phoneHref: "tel:+5116110000",
  emails: {
    sales: "ventas@hpdglass.com",
    projects: "proyectos@hpdglass.com",
  },
  website: "https://www.hpdglass.com",
} as const;

export const navigation = [
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Productos", href: "/#productos" },
  { label: "Proceso", href: "/#proceso" },
  { label: "Sedes", href: "/#sedes" },
  { label: "Contacto", href: "/#contacto" },
] as const;

export const stats = [
  { value: 27, suffix: "+", label: "años de experiencia" },
  { value: 200, suffix: "+", label: "proyectos realizados" },
  { value: 100, suffix: "K", label: "m² de muro cortina instalados" },
  { value: 40, suffix: "+", label: "inmobiliarias y constructoras" },
] as const;

export const brands = ["Imagina", "Valico", "Creativa", "San Pablo", "Diseño Meta", "Huanvil", "Inarco"] as const;

export type FacadeVariant = "tower" | "curtain" | "insulated" | "window" | "sliding" | "panels" | "slats" | "mirror";

export const catalog: { name: string; category: string; description: string; art: FacadeVariant }[] = [
  { name: "Vidrios templados", category: "Vidrios", description: "Calidad y alta resistencia en cada proyecto", art: "curtain" },
  { name: "Vidrios insulados", category: "Vidrios", description: "Aislamiento térmico y acústico", art: "insulated" },
  { name: "Vidrios Low-E", category: "Vidrios", description: "Eficiencia energética y confort térmico", art: "tower" },
  { name: "Sistemas de muro cortina", category: "Aluminios", description: "Fachadas de alto rendimiento", art: "curtain" },
  { name: "Ventana proyectante VPR 042", category: "Aluminios", description: "Confort en proyectos exigentes", art: "window" },
  { name: "Ventana corrediza VCO 043", category: "Aluminios", description: "Corredizo robusto, térmico y versátil", art: "sliding" },
  { name: "Panel de aluminio compuesto", category: "Soluciones decorativas", description: "Diseño contemporáneo y desempeño superior", art: "panels" },
  { name: "Lamas de aluminio", category: "Soluciones decorativas", description: "Control solar con identidad", art: "slats" },
  { name: "Espejos", category: "Soluciones decorativas", description: "Amplitud y luz para cada espacio", art: "mirror" },
];

export const processSteps = [
  {
    title: "Asesoría y análisis del proyecto",
    description: "Evaluamos los requerimientos técnicos y arquitectónicos para definir la solución adecuada en vidrio y aluminio.",
  },
  {
    title: "Diseño y cotización",
    description: "Proponemos sistemas, espesores y acabados con una cotización clara según el alcance de tu obra.",
  },
  {
    title: "Procesamiento en planta",
    description: "Fabricamos en nuestra planta de 28,000 m² en Chilca con tecnología 100% europea y procesos certificados.",
  },
  {
    title: "Despacho con guía de remisión",
    description: "Coordinamos cada despacho desde nuestra sede con guías de remisión y trazabilidad hasta tu obra.",
  },
  {
    title: "Instalación y acompañamiento",
    description: "Acompañamos la instalación y la entrega final bajo estándares ISO 9001 e ISO 45001.",
  },
] as const;

export const commitments = [
  {
    title: "Nuestra misión",
    body: "Lograr la satisfacción del cliente con un servicio profesional de excelencia, a la vanguardia de la innovación, asegurando el desarrollo de nuestros colaboradores y el respeto por el medio ambiente.",
    author: "HPD Glass Group",
    role: "Propósito",
  },
  {
    title: "Nuestra visión",
    body: "Ser la mejor empresa nacional en transformación de vidrio y carpintería de aluminio, con presencia activa y reconocimiento en el mercado internacional.",
    author: "HPD Glass Group",
    role: "Visión",
  },
  {
    title: "Calidad certificada",
    body: "Certificados ISO 9001 e ISO 45001 desde 2015, otorgados por LRQA y respaldados por UKAS. Miembros del Perú Green Building Council.",
    author: "Política de gestión integrada",
    role: "ISO 9001 · ISO 45001 · GBC Perú",
  },
] as const;

export const sites = [
  {
    name: "Oficina principal, almacén y distribución",
    address: "Ca. Arquímedes Mz. B1 Lt. 15, Urb. La Campiña",
    city: "Chorrillos, Lima",
  },
  {
    name: "Ventas sector distribución",
    address: "Av. México N° 554, Urb. Balconcillo",
    city: "La Victoria, Lima",
  },
  {
    name: "Centro de procesamiento principal",
    address: "Los Huertos de Oro de San Hilarión Mz. B1 Lt. 3",
    city: "Chilca, Cañete",
  },
] as const;

export const socials = [
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61594244270955" },
  { label: "Instagram", href: "https://www.instagram.com/hpdglassgroupoficial" },
  { label: "TikTok", href: "https://www.tiktok.com/@hpdglassgroup" },
  { label: "YouTube", href: "https://www.youtube.com/@hpdglassgroup" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/hpd-glassgroup-b04459307" },
] as const;
