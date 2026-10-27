"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/button";
import { company } from "@/lib/site-data";
import { FacadeArt } from "./facade-art";

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-panel bg-sky-300">
        <motion.div
          className="absolute inset-y-0 right-0 -z-10 w-full sm:w-[62%]"
          initial={reduce ? false : { scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <FacadeArt variant="tower" anchor="top" className="size-full" label="Fachada de vidrio y aluminio" />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-sky-400/95 via-sky-400/70 to-transparent sm:via-sky-400/40" />

        <div className="flex min-h-115 flex-col justify-center px-6 py-14 sm:min-h-135 sm:px-12 lg:px-16">
          <motion.h1
            {...fade(0.1)}
            className="max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Vidrio y aluminio para la arquitectura
          </motion.h1>
          <motion.p {...fade(0.25)} className="mt-6 max-w-md text-base text-white/90 sm:text-lg">
            {company.tagline}: procesamiento, despacho e instalación — de la planta a tu obra.
          </motion.p>
          <motion.div {...fade(0.4)} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#contacto" variant="light" className="px-7 py-3.5">
              Solicitar cotización
            </ButtonLink>
            <ButtonLink href="#productos" variant="ghost" className="px-5 py-3.5 text-white hover:bg-white/15 hover:text-white">
              Ver productos
            </ButtonLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
