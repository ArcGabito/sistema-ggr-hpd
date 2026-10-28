"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sileo } from "sileo";
import { CarFront, FileText, Inbox, LayoutDashboard, LogOut, Menu, Newspaper, Truck, Users, X } from "lucide-react";
import { useApi } from "@/app/lib/use-api";
import type { User } from "@/app/lib/types";
import { Logo } from "@/app/components/site/logo";

const nav = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/guias", label: "Guías de remisión", icon: FileText },
  { href: "/dashboard/despachos", label: "Despachos", icon: Truck },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/flota", label: "Flota", icon: CarFront },
  { href: "/dashboard/solicitudes", label: "Solicitudes", icon: Inbox },
  { href: "/dashboard/blog", label: "Blog", icon: Newspaper, roles: ["Admin", "Supervisor"] },
];

const roleLabel: Record<User["role"], string> = { Admin: "Administrador", Supervisor: "Supervisor", Operator: "Operador" };

const UserContext = createContext<User | null>(null);
export const useCurrentUser = () => useContext(UserContext);

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useApi<User>("auth/me");
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    sileo.info({ title: "Sesión cerrada", description: "Hasta pronto." });
    router.replace("/ingresar");
    router.refresh();
  };

  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="px-2">
        <Logo />
      </Link>
      <p className="mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">Gestión</p>
      <nav aria-label="Dashboard" className="mt-3 flex flex-col gap-1">
        {nav
          .filter((item) => !("roles" in item) || (user && item.roles?.includes(user.role)))
          .map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "text-white" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              }`}
            >
              {active ? (
                <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-ink-900" transition={{ type: "spring", duration: 0.4 }} />
              ) : null}
              <item.icon className="relative size-4" aria-hidden />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[var(--radius-card)] bg-sky-50 p-4">
        <p className="truncate text-sm font-semibold">{user?.fullName ?? "…"}</p>
        <p className="truncate text-xs text-ink-500">{user ? `${roleLabel[user.role]} · ${user.siteName ?? "Sin sede"}` : " "}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white py-2 text-sm font-semibold text-ink-900 transition hover:bg-ink-900 hover:text-white"
        >
          <LogOut className="size-4" aria-hidden /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <UserContext.Provider value={user}>
      <div className="flex min-h-screen flex-1 bg-ink-50/60">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-ink-100 bg-white p-5 lg:block print:hidden">{sidebar}</aside>

        <AnimatePresence>
          {open ? (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 w-72 bg-white p-5 lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-5 text-ink-500" aria-label="Cerrar menú">
                  <X className="size-5" />
                </button>
                {sidebar}
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur lg:hidden print:hidden">
            <Logo />
            <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-ink-50" aria-label="Abrir menú">
              <Menu className="size-5" />
            </button>
          </header>
          <main className="flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </UserContext.Provider>
  );
}
