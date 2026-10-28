import { NextResponse } from "next/server";
import { apiUrl } from "@/app/lib/session";

// Despertar la API (escala a cero) y Azure SQL (se pausa) puede tardar cerca de un minuto.
export const maxDuration = 60;

/** Consulta /health/ready de la API, que también conecta con la base de datos y la despierta. */
export async function GET() {
  try {
    const response = await fetch(`${apiUrl()}/health/ready`, { cache: "no-store", signal: AbortSignal.timeout(55_000) });
    return NextResponse.json({ ok: response.ok }, { status: response.ok ? 200 : 503 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
