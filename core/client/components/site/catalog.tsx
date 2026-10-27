"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { catalog } from "@/lib/site-data";
import { FacadeArt } from "./facade-art";
import { Reveal } from "./reveal";

export function Catalog() {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    el.scrollBy({ left: direction * ((card?.offsetWidth ?? 280) + 16), behavior: "smooth" });
  };

  return (
    <section id="productos" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
        <Reveal className="flex flex-col">
          <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Catálogo de productos</h2>
          <p className="mt-5 max-w-xs text-base text-ink-500">Vidrios, aluminios y soluciones decorativas para cada proyecto.</p>
          <div className="mt-8 hidden gap-3 lg:mt-auto lg:flex">
            <ArrowButtons onScroll={scroll} />
          </div>
        </Reveal>

        <div className="min-w-0">
          <div ref={track} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
            {catalog.map((item, i) => (
              <motion.article
                key={item.name}
                data-card
                className="group w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[31.5%]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(i, 3) * 0.08 }}
              >
                <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sky-100">
                  <FacadeArt variant={item.art} className="size-full transition duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm text-ink-400">
                  {item.category} · {item.description}
                </p>
              </motion.article>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3 lg:hidden">
            <ArrowButtons onScroll={scroll} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowButtons({ onScroll }: { onScroll: (direction: 1 | -1) => void }) {
  return (
    <>
      <button
        type="button"
        onClick={() => onScroll(-1)}
        aria-label="Anterior"
        className="grid size-11 place-items-center rounded-full border border-ink-200 text-ink-900 transition hover:border-ink-900"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => onScroll(1)}
        aria-label="Siguiente"
        className="grid size-11 place-items-center rounded-full bg-ink-900 text-white transition hover:bg-ink-700"
      >
        <ChevronRight className="size-5" />
      </button>
    </>
  );
}
