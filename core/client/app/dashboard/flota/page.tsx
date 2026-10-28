"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { driverSchema, vehicleSchema, type DriverInput, type VehicleInput } from "@/lib/schemas";
import { formatNumber } from "@/lib/format";
import type { Driver, Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Card, CardHeader, EmptyState, Loading, PageHeader, td, th } from "@/components/dashboard/ui";
import { useCurrentUser } from "@/components/dashboard/shell";

export default function FleetPage() {
  const user = useCurrentUser();
  const canEdit = user?.role === "Admin" || user?.role === "Supervisor";
  const vehicles = useApi<Vehicle[]>("vehicles");
  const drivers = useApi<Driver[]>("drivers");

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Flota" description="Vehículos y conductores disponibles para los despachos." />

      <div className="grid flex-1 gap-6 xl:grid-cols-2">
        <Card className="flex flex-col overflow-hidden">
          <CardHeader title="Vehículos" />
          {canEdit ? <VehicleForm onCreated={vehicles.reload} /> : null}
          {vehicles.loading && !vehicles.data ? <Loading /> : null}
          {vehicles.data?.length === 0 ? <EmptyState title="Sin vehículos" /> : null}
          {vehicles.data && vehicles.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50/70">
                  <tr>
                    <th className={th}>Placa</th>
                    <th className={th}>Unidad</th>
                    <th className={`${th} text-right`}>Capacidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {vehicles.data.map((v) => (
                    <tr key={v.id}>
                      <td className={`${td} font-mono font-semibold`}>{v.plate}</td>
                      <td className={td}>
                        {v.brand} {v.model}
                      </td>
                      <td className={`${td} text-right`}>{formatNumber(v.capacityKg, 0)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <CardHeader title="Conductores" />
          {canEdit ? <DriverForm onCreated={drivers.reload} /> : null}
          {drivers.loading && !drivers.data ? <Loading /> : null}
          {drivers.data?.length === 0 ? <EmptyState title="Sin conductores" /> : null}
          {drivers.data && drivers.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50/70">
                  <tr>
                    <th className={th}>Conductor</th>
                    <th className={th}>DNI</th>
                    <th className={th}>Licencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {drivers.data.map((d) => (
                    <tr key={d.id}>
                      <td className={td}>
                        <p className="font-semibold">{d.fullName}</p>
                        {d.phoneNumber ? <p className="text-xs text-ink-400">{d.phoneNumber}</p> : null}
                      </td>
                      <td className={`${td} font-mono text-xs`}>{d.documentNumber}</td>
                      <td className={`${td} font-mono text-xs`}>{d.licenseNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

function VehicleForm({ onCreated }: { onCreated: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleInput>({ resolver: zodResolver(vehicleSchema) });

  const onSubmit = async (data: VehicleInput) => {
    try {
      await api("vehicles", { method: "POST", json: data });
      sileo.success({ title: "Vehículo registrado", description: data.plate });
      reset();
      onCreated();
    } catch (error) {
      sileo.error({ title: "No se pudo registrar", description: (error as Error).message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 border-b border-ink-100 bg-sky-50/50 p-5 sm:grid-cols-2">
      <Field label="Placa" htmlFor="plate" error={errors.plate?.message}>
        <Input id="plate" placeholder="ABC-123" className="uppercase" error={errors.plate?.message} {...register("plate")} />
      </Field>
      <Field label="Capacidad (kg)" htmlFor="capacityKg" error={errors.capacityKg?.message}>
        <Input id="capacityKg" type="number" placeholder="8000" error={errors.capacityKg?.message} {...register("capacityKg", { valueAsNumber: true })} />
      </Field>
      <Field label="Marca" htmlFor="brand" error={errors.brand?.message}>
        <Input id="brand" placeholder="Hino" error={errors.brand?.message} {...register("brand")} />
      </Field>
      <Field label="Modelo" htmlFor="model" error={errors.model?.message}>
        <Input id="model" placeholder="Serie 500" error={errors.model?.message} {...register("model")} />
      </Field>
      <Button type="submit" loading={isSubmitting} className="sm:col-span-2">
        <Plus className="size-4" aria-hidden /> Registrar vehículo
      </Button>
    </form>
  );
}

function DriverForm({ onCreated }: { onCreated: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DriverInput>({ resolver: zodResolver(driverSchema) });

  const onSubmit = async (data: DriverInput) => {
    try {
      await api("drivers", { method: "POST", json: { ...data, phoneNumber: data.phoneNumber || null } });
      sileo.success({ title: "Conductor registrado", description: data.fullName });
      reset();
      onCreated();
    } catch (error) {
      sileo.error({ title: "No se pudo registrar", description: (error as Error).message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 border-b border-ink-100 bg-sky-50/50 p-5 sm:grid-cols-2">
      <Field label="Nombres y apellidos" htmlFor="fullName" error={errors.fullName?.message} className="sm:col-span-2">
        <Input id="fullName" error={errors.fullName?.message} {...register("fullName")} />
      </Field>
      <Field label="DNI" htmlFor="documentNumber" error={errors.documentNumber?.message}>
        <Input id="documentNumber" inputMode="numeric" maxLength={8} error={errors.documentNumber?.message} {...register("documentNumber")} />
      </Field>
      <Field label="Licencia" htmlFor="licenseNumber" error={errors.licenseNumber?.message}>
        <Input id="licenseNumber" error={errors.licenseNumber?.message} {...register("licenseNumber")} />
      </Field>
      <Field label="Celular" htmlFor="phoneNumber" error={errors.phoneNumber?.message} className="sm:col-span-2">
        <Input id="phoneNumber" inputMode="tel" placeholder="Opcional" error={errors.phoneNumber?.message} {...register("phoneNumber")} />
      </Field>
      <Button type="submit" loading={isSubmitting} className="sm:col-span-2">
        <Plus className="size-4" aria-hidden /> Registrar conductor
      </Button>
    </form>
  );
}
