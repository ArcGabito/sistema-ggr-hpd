"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { navigation } from "@/lib/site-data";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "./logo";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="HPD Glass Group, inicio">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-9 md:flex">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-ink-600 transition hover:text-ink-900">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <ButtonLink href="/ingresar" variant="primary" className="px-5">
            Ingresar <ArrowUpRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full text-ink-900 hover:bg-ink-50 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-menu"
            aria-label="Móvil"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-ink-100 bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-ink-800 hover:bg-sky-50"
                >
                  {item.label}
                </a>
              ))}
              <ButtonLink href="/ingresar" className="mt-2">
                Ingresar al sistema
              </ButtonLink>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
