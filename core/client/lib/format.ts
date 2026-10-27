import type { DispatchStatus, GuideStatus } from "./types";

const TIME_ZONE = "America/Lima";

export const guideStatusLabel: Record<GuideStatus, string> = {
  Draft: "Borrador",
  Issued: "Emitida",
  InTransit: "En tránsito",
  Delivered: "Entregada",
  Cancelled: "Anulada",
};

export const dispatchStatusLabel: Record<DispatchStatus, string> = {
  Scheduled: "Programado",
  Loading: "En carga",
  InTransit: "En ruta",
  Completed: "Completado",
  Cancelled: "Cancelado",
};

export const transferReasonLabel: Record<string, string> = {
  Sale: "Venta",
  TransferBetweenSites: "Traslado entre establecimientos",
  Return: "Devolución",
  Other: "Otros",
};

export const productCategoryLabel: Record<string, string> = {
  Glass: "Vidrios",
  Aluminum: "Aluminios",
  Decorative: "Soluciones decorativas",
};

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeZone: TIME_ZONE }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: TIME_ZONE }).format(
    new Date(value),
  );
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("es-PE", { maximumFractionDigits }).format(value);
}

/** Fecha local de Lima en formato YYYY-MM-DD, para inputs de tipo date. */
export function todayInLima() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}
