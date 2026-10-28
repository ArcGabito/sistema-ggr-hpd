"use client";

import { sileo } from "sileo";

// Una petición normal responde en menos de un segundo; si tarda más, la API o la base estaban dormidas.
const SLOW_AFTER_MS = 1500;

let pending = 0;
let toastId: string | null = null;
let showTimer: ReturnType<typeof setTimeout> | null = null;

function begin() {
  pending++;
  if (pending === 1 && toastId === null) {
    showTimer = setTimeout(() => {
      toastId = sileo.show({
        type: "loading",
        title: "Despertando servidor…",
        description: "El servidor y la base de datos estaban en reposo. Puede tardar hasta un minuto.",
        duration: null,
      });
    }, SLOW_AFTER_MS);
  }
}

function end(succeeded: boolean) {
  pending = Math.max(0, pending - 1);
  if (pending > 0) return;
  if (showTimer) clearTimeout(showTimer);
  showTimer = null;
  if (toastId !== null) {
    sileo.dismiss(toastId);
    toastId = null;
    if (succeeded) sileo.success({ title: "Servidor listo", duration: 2500 });
  }
}

/** Ejecuta la petición y, si tarda, muestra un único aviso de “Despertando servidor” hasta que termine. */
export async function withWakeUpNotice<T>(task: () => Promise<T>): Promise<T> {
  begin();
  let succeeded = false;
  try {
    const result = await task();
    succeeded = true;
    return result;
  } finally {
    end(succeeded);
  }
}

let warming: Promise<boolean> | null = null;

/** Despierta la API y la base en segundo plano (una vez por carga de página). */
export function wakeServer(): Promise<boolean> {
  warming ??= withWakeUpNotice(async () => {
    const response = await fetch("/api/health", { cache: "no-store" });
    return response.ok;
  }).catch(() => false);
  return warming;
}
