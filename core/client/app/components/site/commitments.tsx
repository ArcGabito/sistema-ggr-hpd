import { Quote } from "lucide-react";
import { commitments } from "@/app/lib/site-data";
import { LogoMark } from "./logo";
import { Reveal } from "./reveal";

export function Commitments() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Nuestro compromiso</h2>
      </Reveal>
      <div className="no-scrollbar -mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0">
        {commitments.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.08} className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-auto">
            <article className="flex h-full flex-col rounded-[var(--radius-card)] bg-sky-50 p-7">
              <Quote className="size-8 fill-sky-400 text-sky-400" aria-hidden />
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{item.body}</p>
              <div className="mt-7 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-white">
                  <LogoMark className="size-6" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.author}</span>
                  <span className="block text-xs text-ink-400">{item.role}</span>
                </span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
