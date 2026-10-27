"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, FilePen, FilePlus2, FileText, PackageCheck, Truck, Users } from "lucide-react";
import { useApi } from "@/lib/use-api";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import type { DashboardSummary } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";
import { useCurrentUser } from "@/components/dashboard/shell";
import {
  Card,
  CardHeader,
  DispatchStatusBadge,
  EmptyState,
  ErrorState,
  GuideStatusBadge,
  Loading,
  PageHeader,
  StatCard,
} from "@/components/dashboard/ui";

export default function DashboardPage() {
  const user = useCurrentUser();
  const { data, error, loading, reload } = useApi<DashboardSummary>("dashboard/summary");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hola${user ? `, ${user.fullName.split(" ")[0]}` : ""}`}
        description="Resumen de guías de remisión y despachos de la sede."
        actions={
          <>
            <ButtonLink href="/dashboard/despachos/nuevo" variant="outline">
              <Truck className="size-4" aria-hidden /> Programar despacho
            </ButtonLink>
            <ButtonLink href="/dashboard/guias/nueva">
              <FilePlus2 className="size-4" aria-hidden /> Nueva guía
            </ButtonLink>
          </>
        }
      />

      {loading && !data ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Guías emitidas hoy" value={data.guidesToday} icon={FileText} tone="dark" />
            <StatCard label="Emitidas sin despacho" value={data.guidesIssuedPending} icon={FilePen} tone="sky" />
            <StatCard label="Guías en tránsito" value={data.guidesInTransit} icon={Truck} />
            <StatCard label="Entregadas este mes" value={data.guidesDeliveredMonth} icon={PackageCheck} />
            <StatCard label="Guías en borrador" value={data.guidesDraft} icon={FilePen} />
            <StatCard label="Despachos programados" value={data.dispatchesScheduled} icon={CalendarClock} />
            <StatCard label="Despachos en curso" value={data.dispatchesInProgress} icon={Truck} />
            <StatCard label="Clientes registrados" value={formatNumber(data.clientsCount, 0)} icon={Users} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader
                title="Últimas guías"
                action={
                  <Link href="/dashboard/guias" className="flex items-center gap-1 text-sm font-semibold text-sky-700">
                    Ver todas <ArrowRight className="size-4" aria-hidden />
                  </Link>
                }
              />
              {data.recentGuides.length === 0 ? (
                <EmptyState title="Aún no hay guías" description="Crea la primera guía de remisión de la sede." />
              ) : (
                <ul className="divide-y divide-ink-100">
                  {data.recentGuides.map((guide) => (
                    <li key={guide.id}>
                      <Link href={`/dashboard/guias/${guide.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-sky-50/60">
                        <div className="min-w-0">
                          <p className="font-semibold">{guide.number}</p>
                          <p className="truncate text-sm text-ink-500">{guide.clientName}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <GuideStatusBadge status={guide.status} />
                          <p className="mt-1 text-xs text-ink-400">{formatDate(guide.issueDate)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader
                title="Próximos despachos"
                action={
                  <Link href="/dashboard/despachos" className="flex items-center gap-1 text-sm font-semibold text-sky-700">
                    Ver todos <ArrowRight className="size-4" aria-hidden />
                  </Link>
                }
              />
              {data.upcomingDispatches.length === 0 ? (
                <EmptyState title="Sin despachos activos" description="Programa un despacho con las guías emitidas." />
              ) : (
                <ul className="divide-y divide-ink-100">
                  {data.upcomingDispatches.map((dispatch) => (
                    <li key={dispatch.id} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{dispatch.code}</p>
                        <DispatchStatusBadge status={dispatch.status} />
                      </div>
                      <p className="mt-1 text-sm text-ink-500">
                        {dispatch.vehiclePlate} · {dispatch.driverName}
                      </p>
                      <p className="mt-1 text-xs text-ink-400">
                        {formatDateTime(dispatch.scheduledAt)} · {dispatch.guides.length} guía(s) · {formatNumber(dispatch.totalWeightKg)} kg
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
