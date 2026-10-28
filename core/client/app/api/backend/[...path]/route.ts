import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, apiUrl } from "@/app/lib/session";

type Context = { params: Promise<{ path: string[] }> };

// Solo se reenvían rutas conocidas del backend; evita usar el proxy para alcanzar otros endpoints.
const ALLOWED_ROOTS = new Set(["auth", "dashboard", "clients", "sites", "products", "vehicles", "drivers", "remission-guides", "dispatches", "admin", "contact-requests"]);

async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ title: "No autenticado." }, { status: 401 });
  }

  if (!ALLOWED_ROOTS.has(path[0]) || path.some((segment) => segment === ".." || segment.includes("/"))) {
    return NextResponse.json({ title: "Ruta no permitida." }, { status: 404 });
  }

  const target = `${apiUrl()}/api/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const contentType = request.headers.get("content-type");

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // Se conserva el tipo original: JSON o multipart (archivos adjuntos).
        ...(hasBody && contentType ? { "Content-Type": contentType } : {}),
      },
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ title: "No se pudo conectar con el servidor." }, { status: 503 });
  }

  const response = new NextResponse(upstream.status === 204 ? null : upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      // Nombre de archivo de descargas como el PDF de la guía.
      ...(upstream.headers.get("content-disposition") ? { "Content-Disposition": upstream.headers.get("content-disposition")! } : {}),
    },
  });

  if (upstream.status === 401) {
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };
