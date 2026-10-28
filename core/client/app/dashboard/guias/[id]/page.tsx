"use client";

import { use, useState } from "react";
import { ArrowLeft, Ban, Printer, Send } from "lucide-react";
import { sileo } from "sileo";
import { api } from "@/app/lib/api";
import { useApi } from "@/app/lib/use-api";
import { formatDate, formatNumber, transferReasonLabel } from "@/app/lib/format";
import { company } from "@/app/lib/site-data";
import type { GuideDetail, GuideStatus } from "@/app/lib/types";
import { Button, ButtonLink } from "@/app/components/ui/button";
import { Card, ErrorState, GuideStatusBadge, Loading, td, th } from "@/app/components/dashboard/ui";
import { LogoMark } from "@/app/components/site/logo";

export default function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: guide, error, loading, reload, setData } = useApi<GuideDetail>(`remission-guides/${Number(id)}`);
  const [pending, setPending] = useState<GuideStatus | null>(null);

  const changeStatus = async (status: GuideStatus) => {
    if (status === "Cancelled" && !window.confirm("¿Anular esta guía? Esta acción no se puede deshacer.")) return;
    setPending(status);
    try {
      const updated = await api<GuideDetail>(`remission-guides/${id}/status`, { method: "PATCH", json: { status } });
      setData(updated);
      sileo.success({ title: status === "Issued" ? "Guía emitida" : "Guía anulada", description: updated.number });
    } catch (err) {
      sileo.error({ title: "No se pudo actualizar", description: (err as Error).message });
    } finally {
      setPending(null);
    }
  };

  if (loading && !guide) return <Loading />;
  if (error || !guide) return <ErrorState message={error ?? "Guía no encontrada"} onRetry={reload} />;

  const canIssue = guide.status === "Draft";
  const canCancel = guide.status === "Draft" || (guide.status === "Issued" && !guide.dispatchCode);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <ButtonLink href="/dashboard/guias" variant="ghost" className="px-3">
          <ArrowLeft className="size-4" aria-hidden /> Guías
        </ButtonLink>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden /> Imprimir
          </Button>
          {canCancel ? (
            <Button variant="danger" loading={pending === "Cancelled"} disabled={!!pending} onClick={() => changeStatus("Cancelled")}>
              <Ban className="size-4" aria-hidden /> Anular
            </Button>
          ) : null}
          {canIssue ? (
            <Button loading={pending === "Issued"} disabled={!!pending} onClick={() => changeStatus("Issued")}>
              <Send className="size-4" aria-hidden /> Emitir guía
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 border-b border-ink-100 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <LogoMark className="size-12" />
            <div>
              <p className="text-lg font-bold">{company.legalName}</p>
              <p className="text-sm text-ink-500">RUC {company.ruc}</p>
              <p className="text-sm text-ink-500">{guide.originSite.address}, {guide.originSite.district}</p>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-ink-900 px-6 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Guía de remisión remitente</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{guide.number}</p>
            <div className="mt-2">
              <GuideStatusBadge status={guide.status} />
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-ink-100 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Fecha de emisión" value={formatDate(guide.issueDate)} />
          <Info label="Inicio de traslado" value={formatDate(guide.transferDate)} />
          <Info label="Motivo" value={transferReasonLabel[guide.transferReason] ?? guide.transferReason} />
          <Info label="Peso bruto total" value={`${formatNumber(guide.totalWeightKg)} kg`} />
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Destinatario</h2>
            <p className="mt-2 font-semibold">{guide.client.legalName ?? guide.client.displayName}</p>
            <p className="text-sm text-ink-500">{guide.client.taxId ? `RUC ${guide.client.taxId}` : "Sin RUC registrado"}</p>
            {guide.client.contactName ? <p className="text-sm text-ink-500">Contacto: {guide.client.contactName}</p> : null}
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Puntos de partida y llegada</h2>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Partida:</span> {guide.originSite.address}, {guide.originSite.district}, {guide.originSite.province}
            </p>
            <p className="mt-1 text-sm">
              <span className="font-semibold">Llegada:</span> {guide.deliveryAddress}
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Transporte</h2>
            {guide.dispatchCode ? (
              <p className="mt-2 text-sm">
                Despacho <span className="font-semibold">{guide.dispatchCode}</span> · Vehículo {guide.vehiclePlate} · Conductor {guide.driverName}
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink-500">Aún no asignada a un despacho.</p>
            )}
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Registro</h2>
            <p className="mt-2 text-sm">Creada por {guide.createdBy}</p>
            {guide.notes ? <p className="mt-1 text-sm text-ink-500">Obs.: {guide.notes}</p> : null}
          </div>
        </div>

        <div className="overflow-x-auto border-t border-ink-100">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-50/70">
              <tr>
                <th className={th}>#</th>
                <th className={th}>Código</th>
                <th className={th}>Descripción</th>
                <th className={`${th} text-right`}>Cantidad</th>
                <th className={th}>U.M.</th>
                <th className={`${th} text-right`}>Peso (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {guide.items.map((item, i) => (
                <tr key={item.id}>
                  <td className={td}>{i + 1}</td>
                  <td className={`${td} font-mono text-xs`}>{item.productCode}</td>
                  <td className={td}>{item.description}</td>
                  <td className={`${td} text-right`}>{formatNumber(item.quantity, 3)}</td>
                  <td className={td}>{item.unitOfMeasure}</td>
                  <td className={`${td} text-right`}>{formatNumber(item.weightKg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-6 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
