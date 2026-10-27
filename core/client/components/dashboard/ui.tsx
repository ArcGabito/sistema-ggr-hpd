import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, Inbox, LoaderCircle } from "lucide-react";
import { dispatchStatusLabel, guideStatusLabel } from "@/lib/format";
import type { DispatchStatus, GuideStatus } from "@/lib/types";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 text-sm text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[var(--radius-card)] border border-ink-100 bg-white ${className}`}>{children}</section>;
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-100 px-5 py-4">
      <h2 className="font-semibold">{title}</h2>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "light",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "light" | "sky" | "dark";
}) {
  const tones = {
    light: "bg-white border border-ink-100",
    sky: "bg-sky-400 text-white",
    dark: "bg-ink-800 text-white",
  };
  const iconTones = { light: "bg-ink-900 text-white", sky: "bg-white/20 text-white", dark: "bg-white/10 text-sky-300" };
  return (
    <div className={`rounded-[var(--radius-card)] p-5 ${tones[tone]}`}>
      <span className={`grid size-10 place-items-center rounded-full ${iconTones[tone]}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-5 text-3xl font-bold tracking-tight">{value}</p>
      <p className={`mt-1 text-sm ${tone === "light" ? "text-ink-500" : "text-white/80"}`}>{label}</p>
    </div>
  );
}

const guideTones: Record<GuideStatus, string> = {
  Draft: "bg-ink-100 text-ink-600",
  Issued: "bg-sky-100 text-sky-700",
  InTransit: "bg-amber-100 text-amber-800",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
};

const dispatchTones: Record<DispatchStatus, string> = {
  Scheduled: "bg-sky-100 text-sky-700",
  Loading: "bg-violet-100 text-violet-700",
  InTransit: "bg-amber-100 text-amber-800",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
};

export function GuideStatusBadge({ status }: { status: GuideStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${guideTones[status]}`}>{guideStatusLabel[status]}</span>;
}

export function DispatchStatusBadge({ status }: { status: DispatchStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${dispatchTones[status]}`}>{dispatchStatusLabel[status]}</span>
  );
}

export function Loading({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-400">
      <LoaderCircle className="size-4 animate-spin" aria-hidden /> {label}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-sky-50 text-sky-600">
        <Inbox className="size-5" aria-hidden />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="px-4 py-12 text-center text-sm">
      <p className="font-medium text-red-600">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="mt-3 font-semibold text-ink-900 underline">
          Reintentar
        </button>
      ) : null}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between gap-4 border-t border-ink-100 px-5 py-3 text-sm text-ink-500">
      <span>
        {total.toLocaleString("es-PE")} registros · página {page} de {pages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="grid size-9 place-items-center rounded-full border border-ink-200 disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="grid size-9 place-items-center rounded-full bg-ink-900 text-white disabled:opacity-40"
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export const th = "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400";
export const td = "px-5 py-3.5 align-top";
