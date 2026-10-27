"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, FolderOpen } from "lucide-react";
import { documentCategories, documents, type DocumentCategory } from "@/lib/content";
import { company } from "@/lib/site-data";

const materials = ["Todos", "Vidrios", "Aluminios"] as const;

export function DocumentLibrary() {
  const [material, setMaterial] = useState<(typeof materials)[number]>("Todos");
  const visible = documents.filter((doc) => material === "Todos" || doc.material === material);
  const byCategory = (category: DocumentCategory) => visible.filter((doc) => doc.category === category);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por material">
        {materials.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={material === item}
            onClick={() => setMaterial(item)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              material === item ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-ink-100 hover:ring-ink-300"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-x-12 gap-y-12 lg:grid-cols-2">
        {documentCategories.map((category, i) => {
          const items = byCategory(category);
          return (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <h2 className="flex items-center justify-between border-b border-ink-100 pb-3 text-xl font-bold tracking-tight">
                {category}
                <span className="text-sm font-medium text-ink-400">{items.length}</span>
              </h2>
              {items.length === 0 ? (
                <div className="flex items-center gap-4 py-6 text-sm text-ink-500">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-600">
                    <FolderOpen className="size-5" aria-hidden />
                  </span>
                  <p>
                    Aún no hay documentos publicados. Solicítalos a{" "}
                    <a href={`mailto:${company.emails.projects}`} className="font-semibold text-ink-900 underline">
                      {company.emails.projects}
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {items.map((doc) => (
                    <li key={doc.code} className="flex items-center gap-4 py-5">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white">
                        <FileText className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{doc.title}</p>
                        <p className="text-xs text-ink-400">
                          {doc.code} · {doc.material} · PDF · {doc.published}
                        </p>
                      </div>
                      <a
                        href={doc.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Descargar ${doc.title}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold transition hover:border-ink-900"
                      >
                        <Download className="size-4" aria-hidden /> <span className="hidden sm:inline">Descargar</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          );
        })}
      </div>
    </section>
  );
}
