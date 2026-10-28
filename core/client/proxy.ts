import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isTokenAlive } from "@/app/lib/session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = isTokenAlive(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/dashboard") && !authenticated) {
    const url = new URL("/ingresar", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(url);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (pathname === "/ingresar" && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/ingresar"],
};
