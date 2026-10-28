import { NextResponse, type NextRequest } from "next/server";
import { contactSchema } from "@/app/lib/schemas";
import { apiUrl } from "@/app/lib/session";

// La API puede estar en reposo (escala a cero) y su base en pausa: el primer pedido tarda más.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ title: "Revisa los datos del formulario." }, { status: 400 });
  }

  const { fullName, company, email, phoneNumber, message } = parsed.data;
  const payload = { fullName, company, email, phoneNumber, message };
  try {
    const response = await fetch(`${apiUrl()}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    return new NextResponse(response.ok ? null : await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ title: "No se pudo conectar con el servidor." }, { status: 503 });
  }
}
