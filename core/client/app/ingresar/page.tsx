import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/app/components/site/logo";
import { FacadeArt } from "@/app/components/site/facade-art";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Acceso al Sistema de Gestión de Guías de Remisión de HPD Glass Group.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  // Credenciales de la demo pública (usuario Operador sobre datos ficticios). Sin configurar, no se muestran.
  const demo =
    process.env.DEMO_LOGIN_EMAIL && process.env.DEMO_LOGIN_PASSWORD
      ? { email: process.env.DEMO_LOGIN_EMAIL, password: process.env.DEMO_LOGIN_PASSWORD }
      : undefined;

  return (
    <main className="grid min-h-screen flex-1 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-sky-400 lg:block">
        <FacadeArt variant="curtain" className="absolute inset-0 size-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">Sistema GGR</p>
          <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-tight">
            Guías de remisión y despachos coordinados desde tu sede
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            Emite guías, asigna vehículos y conductores y haz seguimiento a cada despacho hasta la entrega en obra.
          </p>
        </div>
      </section>

      <section className="flex flex-col px-4 py-8 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Ir al inicio">
            <Logo />
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
            <ArrowLeft className="size-4" aria-hidden /> Volver al sitio
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <span className="grid size-12 place-items-center rounded-full bg-sky-100 text-sky-700">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">Ingresar</h1>
          <p className="mt-3 text-ink-500">Accede con tu cuenta corporativa para gestionar guías de remisión y despachos.</p>
          {demo ? (
            <p className="mt-4 rounded-xl bg-sky-50 px-4 py-3 text-sm text-ink-600">
              <span className="font-semibold text-ink-900">Demo:</span> usa las credenciales que aparecen en los campos.
            </p>
          ) : null}
          <Suspense>
            <LoginForm demo={demo} />
          </Suspense>
        </div>

        <p className="text-center text-xs text-ink-400">
          ¿Problemas para ingresar? Escribe a <a className="font-medium text-ink-600" href="mailto:proyectos@hpdglass.com">proyectos@hpdglass.com</a>
        </p>
      </section>
    </main>
  );
}
