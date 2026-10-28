"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, MapPin, Search } from "lucide-react";
import { projectCategories, type ProjectCategory } from "@/app/lib/content";

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ProjectsBrowser() {
  const [active, setActive] = useState<ProjectCategory>(projectCategories[0].name);
  const [query, setQuery] = useState("");

  const current = projectCategories.find((c) => c.name === active) ?? projectCategories[0];
  const term = normalize(query.trim());
  const projects = current.projects.filter(
    (p) => !term || normalize(`${p.name} ${p.district} ${p.systems.join(" ")}`).includes(term),
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Categorías de proyectos" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {projectCategories.map((category) => {
            const selected = category.name === active;
            return (
              <button
                key={category.name}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setActive(category.name)}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  selected ? "text-white" : "bg-white text-ink-600 ring-1 ring-ink-100 hover:ring-ink-300"
                }`}
              >
                {selected ? (
                  <motion.span layoutId="project-tab" className="absolute inset-0 rounded-full bg-ink-900" transition={{ type: "spring", duration: 0.4 }} />
                ) : null}
                <span className="relative">
                  {category.name} <span className={selected ? "text-white/60" : "text-ink-300"}>{category.projects.length}</span>
                </span>
              </button>
            );
          })}
        </div>
        <label className="relative block lg:w-72">
          <span className="sr-only">Buscar proyectos</span>
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Proyecto, distrito o sistema"
            className="w-full rounded-full border border-ink-100 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>
      </div>

      <p className="mt-6 text-sm text-ink-500">{current.description}</p>

      <AnimatePresence mode="wait">
        <motion.ul
          key={active}
          role="tabpanel"
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {projects.map((project) => (
            <li key={`${active}-${project.name}`}>
              <article className="flex h-full flex-col rounded-[var(--radius-card)] bg-sky-50 p-6 transition hover:bg-sky-100/70">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold leading-snug">{project.name}</h3>
                  {project.badges?.length ? (
                    <Award className="size-5 shrink-0 text-sky-600" aria-label="Proyecto con reconocimiento o certificación" />
                  ) : null}
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
                  <MapPin className="size-3.5" aria-hidden /> {project.district}
                </p>
                <ul className="mt-5 flex flex-1 flex-wrap content-start gap-1.5">
                  {project.systems.map((system) => (
                    <li key={system} className="rounded-full bg-white px-2.5 py-1 text-xs text-ink-600">
                      {system}
                    </li>
                  ))}
                </ul>
                {project.badges?.length ? (
                  <div className="mt-5 flex flex-wrap gap-1.5 border-t border-sky-200/70 pt-4">
                    {project.badges.map((badge) => (
                      <span key={badge} className="rounded-full bg-ink-900 px-2.5 py-1 text-xs font-semibold text-white">
                        {badge}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            </li>
          ))}
          {projects.length === 0 ? (
            <li className="col-span-full py-12 text-center text-sm text-ink-500">No encontramos proyectos con ese criterio.</li>
          ) : null}
        </motion.ul>
      </AnimatePresence>
    </section>
  );
}
