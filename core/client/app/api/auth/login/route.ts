import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@/app/lib/schemas";
import { SESSION_COOKIE, apiUrl, cookieSecure } from "@/app/lib/session";

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ title: "Datos de acceso inválidos." }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl()}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ title: "No se pudo conectar con el servidor." }, { status: 503 });
  }

  if (!response.ok) {
    const body = await response.text();
    return new NextResponse(body || null, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  }

  const { token, expiresAt, user } = (await response.json()) as { token: string; expiresAt: string; user: unknown };
  const result = NextResponse.json({ user });
  result.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
  return result;
}
