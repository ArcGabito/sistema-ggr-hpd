"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { useApi } from "@/app/lib/use-api";
import { api } from "@/app/lib/api";
import { dispatchSchema, type DispatchInput } from "@/app/lib/schemas";
import { formatDate, formatNumber } from "@/app/lib/format";
import type { Dispatch, Driver, GuideSummary, Paged, Site, Vehicle } from "@/app/lib/types";
import { Button, ButtonLink } from "@/app/components/ui/button";
import { Field, Input, Select, Textarea } from "@/app/components/ui/field";
import { Card, CardHeader, EmptyState, Loading, PageHeader } from "@/app/components/dashboard/ui";

export default function NewDispatchPage() {
  const router = useRouter();
  const { data: sites } = useApi<Site[]>("sites");
  const { data: vehicles } = useApi<Vehicle[]>("vehicles");
  const { data: drivers } = useApi<Driver[]>("drivers");
  const { data: guides, loading: loadingGuides } = useApi<Paged<GuideSummary>>("remission-guides?status=Issued&unassigned=true&pageSize=100");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DispatchInput>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: { siteId: 0, vehicleId: 0, driverId: 0, scheduledAt: "", notes: "", guideIds: [] },
  });

  const [siteId, vehicleId, guideIds] = useWatch({ control, name: ["siteId", "vehicleId", "guideIds"] });
  const site = sites?.find((s) => s.id === siteId);
  const vehicle = vehicles?.find((v) => v.id === vehicleId);
  const available = (guides?.items ?? []).filter((g) => !site || g.originSite === site.name);
  const selectedWeight = available.filter((g) => guideIds.includes(g.id)).reduce((sum, g) => sum + g.totalWeightKg, 0);
  const overCapacity = vehicle ? selectedWeight > vehicle.capacityKg : false;

  const onSubmit = async (data: DispatchInput) => {
    try {
      const dispatch = await api<Dispatch>("dispatches", {
        method: "POST",
        json: { ...data, scheduledAt: new Date(data.scheduledAt).toISOString() },
      });
      sileo.success({ title: `Despacho ${dispatch.code} programado`, description: `${dispatch.guides.length} guía(s) asignadas.` });
      router.push("/dashboard/despachos");
    } catch (error) {
      sileo.error({ title: "No se pudo programar el despacho", description: (error as Error).message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Programar despacho"
        description="Asigna vehículo, conductor y las guías emitidas que saldrán de la sede."
        actions={
          <>
            <ButtonLink href="/dashboard/despachos" variant="outline">
              Cancelar
            </ButtonLink>
            <Button type="submit" loading={isSubmitting} disabled={overCapacity}>
              Programar
            </Button>
          </>
        }
      />

      <div className="grid flex-1 gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="flex flex-col">
          <CardHeader title="Datos del despacho" />
          <div className="grid flex-1 gap-5 p-5 sm:grid-cols-2 sm:grid-rows-[auto_auto_auto_1fr]">
            <Field label="Sede de salida" htmlFor="siteId" error={errors.siteId?.message} className="sm:col-span-2">
              <Select id="siteId" error={errors.siteId?.message} {...register("siteId", { valueAsNumber: true })}>
                <option value={0}>Selecciona…</option>
                {sites?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.district}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Vehículo" htmlFor="vehicleId" error={errors.vehicleId?.message}>
              <Select id="vehicleId" error={errors.vehicleId?.message} {...register("vehicleId", { valueAsNumber: true })}>
                <option value={0}>Selecciona…</option>
                {vehicles
                  ?.filter((v) => v.isActive)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} · {v.brand} ({formatNumber(v.capacityKg, 0)} kg)
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Conductor" htmlFor="driverId" error={errors.driverId?.message}>
              <Select id="driverId" error={errors.driverId?.message} {...register("driverId", { valueAsNumber: true })}>
                <option value={0}>Selecciona…</option>
                {drivers
                  ?.filter((d) => d.isActive)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Fecha y hora de salida" htmlFor="scheduledAt" error={errors.scheduledAt?.message} className="sm:col-span-2">
              <Input id="scheduledAt" type="datetime-local" error={errors.scheduledAt?.message} {...register("scheduledAt")} />
            </Field>
            <Field label="Observaciones" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-2 flex flex-col">
              <Textarea id="notes" className="flex-1" placeholder="Indicaciones de carga, ventana horaria en obra, etc." {...register("notes")} />
            </Field>
          </div>
        </Card>

        <Card className="flex min-h-96 flex-col overflow-hidden">
          <CardHeader
            title="Guías emitidas disponibles"
            action={
              <span className={`text-sm font-semibold ${overCapacity ? "text-red-600" : "text-ink-500"}`}>
                {formatNumber(selectedWeight)} kg{vehicle ? ` / ${formatNumber(vehicle.capacityKg, 0)} kg` : ""}
              </span>
            }
          />
          {loadingGuides ? <Loading /> : null}
          {!loadingGuides && available.length === 0 ? (
            <EmptyState title="No hay guías emitidas libres" description={site ? "No hay guías pendientes desde esta sede." : "Emite guías para poder despacharlas."} />
          ) : null}
          {available.length > 0 ? (
            <div className="relative min-h-64 flex-1">
              <Controller
                control={control}
                name="guideIds"
                render={({ field }) => (
                  <ul className="absolute inset-0 divide-y divide-ink-100 overflow-y-auto">
                    {available.map((guide) => {
                      const checked = field.value.includes(guide.id);
                      return (
                        <li key={guide.id}>
                          <label className={`flex cursor-pointer items-start gap-3 px-5 py-3.5 transition ${checked ? "bg-sky-50" : "hover:bg-ink-50/60"}`}>
                            <input
                              type="checkbox"
                              className="mt-1 size-4 accent-ink-900"
                              checked={checked}
                              onChange={(e) => field.onChange(e.target.checked ? [...field.value, guide.id] : field.value.filter((v) => v !== guide.id))}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex justify-between gap-3">
                                <span className="font-semibold">{guide.number}</span>
                                <span className="text-sm text-ink-500">{formatNumber(guide.totalWeightKg)} kg</span>
                              </span>
                              <span className="block truncate text-sm text-ink-600">{guide.clientName}</span>
                              <span className="block truncate text-xs text-ink-400">
                                {formatDate(guide.transferDate)} · {guide.deliveryAddress}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              />
            </div>
          ) : null}
          {errors.guideIds?.message ? <p className="px-5 py-3 text-xs font-medium text-red-600">{errors.guideIds.message}</p> : null}
          {overCapacity ? <p className="px-5 py-3 text-xs font-medium text-red-600">El peso seleccionado supera la capacidad del vehículo.</p> : null}
        </Card>
      </div>
    </form>
  );
}
