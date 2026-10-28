import { z } from "zod";

const phoneRegex = /^\+?[0-9 ]{7,15}$/;

export const loginSchema = z.object({
  email: z.email("Ingresa un correo válido").max(160),
  password: z.string().min(8, "La contraseña tiene al menos 8 caracteres").max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const contactSchema = z.object({
  fullName: z.string().trim().min(3, "Ingresa tu nombre completo").max(120),
  company: z.string().trim().max(150).optional(),
  email: z.email("Ingresa un correo válido").max(160),
  phoneNumber: z.string().trim().regex(phoneRegex, "Ingresa un teléfono válido"),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mín. 10 caracteres)").max(1000),
  acceptPrivacy: z.literal(true, { error: "Debes aceptar la política de privacidad" }),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const transferReasons = ["Sale", "TransferBetweenSites", "Return", "Other"] as const;

export const guideItemSchema = z.object({
  productId: z.number({ error: "Selecciona un producto" }).int().positive("Selecciona un producto"),
  description: z.string().trim().max(250).optional(),
  quantity: z.number({ error: "Cantidad inválida" }).positive("Debe ser mayor a 0").max(1_000_000),
  weightKg: z.number({ error: "Peso inválido" }).min(0, "No puede ser negativo").max(100_000),
});

export const guideSchema = z.object({
  clientId: z.number({ error: "Selecciona un cliente" }).int().positive("Selecciona un cliente"),
  originSiteId: z.number({ error: "Selecciona la sede" }).int().positive("Selecciona la sede"),
  deliveryAddress: z.string().trim().min(5, "Ingresa el punto de llegada").max(250),
  transferDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona la fecha de traslado"),
  transferReason: z.enum(transferReasons),
  notes: z.string().trim().max(500).optional(),
  items: z.array(guideItemSchema).min(1, "Agrega al menos un bien").max(50),
});
export type GuideInput = z.infer<typeof guideSchema>;

export const dispatchSchema = z.object({
  siteId: z.number({ error: "Selecciona la sede" }).int().positive("Selecciona la sede"),
  vehicleId: z.number({ error: "Selecciona un vehículo" }).int().positive("Selecciona un vehículo"),
  driverId: z.number({ error: "Selecciona un conductor" }).int().positive("Selecciona un conductor"),
  scheduledAt: z.string().min(1, "Indica la fecha y hora de salida"),
  notes: z.string().trim().max(500).optional(),
  guideIds: z.array(z.number().int().positive()).min(1, "Asigna al menos una guía emitida"),
});
export type DispatchInput = z.infer<typeof dispatchSchema>;

export const vehicleSchema = z.object({
  plate: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/, "Formato de placa: ABC-123"),
  brand: z.string().trim().min(2, "Ingresa la marca").max(60),
  model: z.string().trim().min(1, "Ingresa el modelo").max(60),
  capacityKg: z.number({ error: "Capacidad inválida" }).min(100, "Mínimo 100 kg").max(60000, "Máximo 60,000 kg"),
});
export type VehicleInput = z.infer<typeof vehicleSchema>;

export const driverSchema = z.object({
  fullName: z.string().trim().min(5, "Ingresa nombres y apellidos").max(120),
  documentNumber: z.string().trim().regex(/^\d{8}$/, "El DNI tiene 8 dígitos"),
  licenseNumber: z.string().trim().min(5, "Ingresa la licencia").max(20),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^9\d{8}$/, "Celular de 9 dígitos que empieza con 9")
    .optional()
    .or(z.literal("")),
});
export type DriverInput = z.infer<typeof driverSchema>;

export const coverArts = ["tower", "curtain", "insulated", "window", "sliding", "panels", "slats", "mirror"] as const;

export const blogPostSchema = z
  .object({
    title: z.string().trim().min(5, "Mínimo 5 caracteres").max(200),
    slug: z
      .string()
      .trim()
      .max(200)
      .regex(/^([a-z0-9]+(?:-[a-z0-9]+)*)?$/, "Solo minúsculas, números y guiones"),
    summary: z.string().trim().min(10, "Escribe un resumen de al menos 10 caracteres").max(400),
    content: z.string().max(50_000),
    category: z.enum(["Arquitectura", "Diseño", "Sostenibilidad", "Tendencias", "Noticias"]),
    coverArt: z.enum(coverArts),
    externalUrl: z.union([z.literal(""), z.url("Ingresa una URL válida").startsWith("https://", "Debe empezar con https://")]),
    isPublished: z.boolean(),
  })
  .refine((post) => post.content.trim().length > 0 || post.externalUrl.length > 0, {
    message: "Escribe el contenido o indica el enlace a la publicación original",
    path: ["content"],
  });
export type BlogPostInput = z.infer<typeof blogPostSchema>;

const MAX_INVOICE_BYTES = 10 * 1024 * 1024;

export const guideEmailSchema = z.object({
  to: z.email("Ingresa el correo del cliente").max(320),
  cc: z.union([z.literal(""), z.email("Correo en copia no válido").max(320)]),
  message: z.string().trim().max(1000),
  saveClientEmail: z.boolean(),
  invoice: z
    .custom<FileList>()
    .optional()
    .refine((files) => !files?.length || files[0].type === "application/pdf" || files[0].name.toLowerCase().endsWith(".pdf"), "La factura debe ser un PDF")
    .refine((files) => !files?.length || files[0].size <= MAX_INVOICE_BYTES, "La factura no debe superar los 10 MB"),
});
export type GuideEmailInput = z.infer<typeof guideEmailSchema>;
