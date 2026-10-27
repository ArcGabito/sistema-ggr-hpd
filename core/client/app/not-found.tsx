import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/site/logo";

export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center px-4 py-24 text-center">
      <div>
        <LogoMark className="mx-auto size-14" />
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Error 404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Página no encontrada</h1>
        <p className="mt-4 text-ink-500">La página que buscas no existe o fue movida.</p>
        <ButtonLink href="/" className="mt-8">
          Volver al inicio
        </ButtonLink>
      </div>
    </main>
  );
}
