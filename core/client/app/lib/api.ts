"use client";

import { withWakeUpNotice } from "./wake";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export async function readError(response: Response): Promise<ApiError> {
  let problem: ProblemDetails = {};
  try {
    problem = await response.json();
  } catch {
    // respuesta sin cuerpo JSON
  }
  const firstValidation = problem.errors ? Object.values(problem.errors).flat()[0] : undefined;
  const message =
    response.status === 429
      ? "Demasiados intentos. Espera un momento e inténtalo de nuevo."
      : (firstValidation ?? problem.detail ?? problem.title ?? "Ocurrió un error inesperado.");
  return new ApiError(message, response.status, problem.errors);
}

/** Cliente para el backend a través del proxy autenticado de Next.js (/api/backend). */
export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const response = await withWakeUpNotice(() => fetch(`/api/backend/${path.replace(/^\//, "")}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  }));

  if (response.status === 401) {
    window.location.assign(new URL(`/ingresar?next=${encodeURIComponent(window.location.pathname)}`, window.location.origin).href);
    throw new ApiError("Tu sesión expiró.", 401);
  }

  if (!response.ok) {
    throw await readError(response);
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
