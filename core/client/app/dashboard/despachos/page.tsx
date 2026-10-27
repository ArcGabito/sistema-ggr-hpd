"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, MapPin, Truck, UserRound } from "lucide-react";
import { sileo } from "sileo";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { dispatchStatusLabel, formatDateTime, formatNumber } from "@/lib/format";
import type { Dispatch, DispatchStatus } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, DispatchStatusBadge, EmptyState, ErrorState, GuideStatusBadge, Loading, PageHeader } from "@/components/dashboard/ui";

const filters: (DispatchStatus | "all")[] = ["all", "Scheduled", "Loading", "InTransit", "Completed", "Cancelled"];

const nextStep: Partial<Record<DispatchStatus, { status: DispatchStatus; label: string }>> = {
  Scheduled: { status: "Loading", label: "Iniciar carga" },
  Loading: { status: "InTransit", label: "Salida a ruta" },
  InTransit: { status: "Completed", label: "Confirmar entrega" },
};

export default function DispatchesPage() {
  const [status, setStatus] = useState<DispatchStatus | "all">("all");
  const { data, error, loading, reload, setData } = useApi<Dispatch[]>(status === "all" ? "dispatches" : `dispatches?status=${status}`);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const update = async (dispatch: Dispatch, target: DispatchStatus) => {
    if (target === "Cancelled" && !window.confirm(`¿Cancelar el despacho ${dispatch.code}? Las guías quedarán libres.`)) return;
    setPendingId(dispatch.id);
    try {
      const updated = await api<Dispatch>(`dispatches/${dispatch.id}/status`, { method: "PATCH", json: { status: target } });
      setData((current) => current?.map((d) => (d.id === updated.id ? updated : d)) ?? null);
      sileo.success({ title: `${updated.code}: ${dispatchStatusLabel[updated.status]}` });
    } catch (err) {
      sileo.error({ title: "No se pudo actualizar el despacho", description: (err as Error).message });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Despachos"
        description="Coordina la carga, salida y entrega de mercancía de la sede."
        actions={
          <ButtonLink href="/dashboard/despachos/nuevo">
            <Truck className="size-4" aria-hidden /> Programar despacho
          </ButtonLink>
        }
      />

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatus(filter)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              status === filter ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-ink-100 hover:ring-ink-300"
            }`}
          >
            {filter === "all" ? "Todos" : dispatchStatusLabel[filter]}
          </button>
        ))}
      </div>

      {loading && !data ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data && data.length === 0 ? (
        <Card>
          <EmptyState title="No hay despachos" description="Programa un despacho y asígnale guías emitidas." />
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {data?.map((dispatch, i) => {
          const usage = dispatch.vehicleCapacityKg > 0 ? Math.min(100, (dispatch.totalWeightKg / dispatch.vehicleCapacityKg) * 100) : 0;
          const step = nextStep[dispatch.status];
          const cancellable = dispatch.status === "Scheduled" || dispatch.status === "Loading";
          return (
            <motion.div key={dispatch.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.04 }}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold tracking-tight">{dispatch.code}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
                      <MapPin className="size-3.5" aria-hidden /> {dispatch.site}
                    </p>
                  </div>
                  <DispatchStatusBadge status={dispatch.status} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="size-4 text-sky-600" aria-hidden />
                    <dd className="font-medium">{dispatch.vehiclePlate}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserRound className="size-4 text-sky-600" aria-hidden />
                    <dd className="truncate font-medium">{dispatch.driverName}</dd>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-ink-500">
                    <CalendarClock className="size-4 text-sky-600" aria-hidden />
                    <dd>
                      Salida {formatDateTime(dispatch.scheduledAt)}
                      {dispatch.completedAt ? ` · Entregado ${formatDateTime(dispatch.completedAt)}` : ""}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-ink-500">
                    <span>Carga</span>
                    <span>
                      {formatNumber(dispatch.totalWeightKg)} / {formatNumber(dispatch.vehicleCapacityKg)} kg
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
                    <motion.div className="h-full rounded-full bg-sky-400" initial={{ width: 0 }} animate={{ width: `${usage}%` }} transition={{ duration: 0.8 }} />
                  </div>
                </div>

                <ul className="mt-4 flex-1 space-y-2">
                  {dispatch.guides.length === 0 ? <li className="text-sm text-ink-400">Sin guías asignadas.</li> : null}
                  {dispatch.guides.map((guide) => (
                    <li key={guide.id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-50/70 px-3 py-2 text-sm">
                      <Link href={`/dashboard/guias/${guide.id}`} className="min-w-0">
                        <span className="font-semibold">{guide.number}</span>
                        <span className="block truncate text-xs text-ink-500">{guide.clientName}</span>
                      </Link>
                      <GuideStatusBadge status={guide.status} />
                    </li>
                  ))}
                </ul>

                {step || cancellable ? (
                  <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-ink-100 pt-4">
                    {cancellable ? (
                      <Button variant="danger" className="px-4 py-2" disabled={pendingId === dispatch.id} onClick={() => update(dispatch, "Cancelled")}>
                        Cancelar
                      </Button>
                    ) : null}
                    {step ? (
                      <Button className="px-4 py-2" loading={pendingId === dispatch.id} onClick={() => update(dispatch, step.status)}>
                        {step.label}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
