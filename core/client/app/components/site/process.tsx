import { ClipboardList, Factory, FileCheck2, HardHat, MessagesSquare } from "lucide-react";
import { processSteps } from "@/app/lib/site-data";
import { FacadeArt } from "./facade-art";
import { Reveal } from "./reveal";

const icons = [MessagesSquare, ClipboardList, Factory, FileCheck2, HardHat];

export function Process() {
  return (
    <section id="proceso" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Cómo trabajamos</h2>
          <p className="mt-5 max-w-sm text-base text-ink-500">
            Un proceso simple y transparente, desde la asesoría hasta la entrega en obra.
          </p>
          <div className="relative mt-12 max-w-md">
            <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
              <FacadeArt variant="panels" className="size-full" label="Fachada de paneles de aluminio" />
            </div>
            <div className="absolute -top-10 right-0 grid size-32 place-items-center rounded-full bg-sky-400 p-4 text-center text-sm font-semibold leading-snug text-white shadow-lg shadow-sky-400/30 sm:-right-10 sm:size-36">
              Asesoría técnica gratuita
            </div>
          </div>
        </Reveal>

        <ol className="divide-y divide-ink-100 self-end">
          {processSteps.map((step, i) => {
            const Icon = icons[i];
            return (
              <li key={step.title}>
                <Reveal delay={i * 0.06} className="flex gap-5 py-7">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink-900 text-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">{step.description}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
