export const SESSION_COOKIE = "hpd_session";

export const apiUrl = () => process.env.API_URL ?? "http://localhost:5040";

export const cookieSecure = () => process.env.COOKIE_SECURE === "true";

/** Lee la expiración (exp) de un JWT sin verificar la firma: solo para chequeos optimistas. */
export function readTokenExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

export function isTokenAlive(token: string | undefined): token is string {
  if (!token) return false;
  const exp = readTokenExpiry(token);
  return exp !== null && exp * 1000 > Date.now();
}
