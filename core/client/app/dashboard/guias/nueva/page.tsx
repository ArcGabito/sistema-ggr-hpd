"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { guideSchema, transferReasons, type GuideInput } from "@/lib/schemas";
import { formatNumber, productCategoryLabel, todayInLima, transferReasonLabel } from "@/lib/format";
import type { Client, GuideDetail, Product, Site } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Card, CardHeader, PageHeader } from "@/components/dashboard/ui";
import { ClientPicker } from "@/components/dashboard/client-picker";

const emptyItem = { productId: 0, description: "", quantity: 1, weightKg: 0 };

export default function NewGuidePage() {
  const router = useRouter();
  const { data: sites } = useApi<Site[]>("sites");
  const { data: products } = useApi<Product[]>("products");
  const [client, setClient] = useState<Client | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GuideInput>({
    resolver: zodResolver(guideSchema),
    defaultValues: {
      clientId: 0,
      originSiteId: 0,
      deliveryAddress: "",
      transferDate: todayInLima(),
      transferReason: "Sale",
      notes: "",
      items: [emptyItem],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });
  const totalWeight = (items ?? []).reduce((sum, item) => sum + (Number.isFinite(item.weightKg) ? item.weightKg : 0), 0);

  const selectClient = (selected: Client | null) => {
    setClient(selected);
    setValue("clientId", selected?.id ?? 0, { shouldValidate: !!selected });
    if (selected?.address) {
      const address = [selected.address, selected.district, selected.province].filter(Boolean).join(", ");
      setValue("deliveryAddress", address, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: GuideInput) => {
    try {
      const guide = await api<GuideDetail>("remission-guides", {
        method: "POST",
        json: { ...data, transferDate: `${data.transferDate}T12:00:00-05:00` },
      });
      sileo.success({ title: `Guía ${guide.number} creada`, description: "Quedó en borrador; emítela para asignarla a un despacho." });
      router.push(`/dashboard/guias/${guide.id}`);
    } catch (error) {
      sileo.error({ title: "No se pudo crear la guía", description: (error as Error).message });
    }
  };

  const grouped = (products ?? []).reduce<Record<string, Product[]>>((acc, product) => {
    (acc[product.category] ??= []).push(product);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <PageHeader
        title="Nueva guía de remisión"
        description="Registra el destinatario, el punto de llegada y los bienes a trasladar."
        actions={
          <>
            <ButtonLink href="/dashboard/guias" variant="outline">
              Cancelar
            </ButtonLink>
            <Button type="submit" loading={isSubmitting}>
              Guardar borrador
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Destinatario y traslado" />
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <Field label="Cliente destinatario" htmlFor="clientId" error={errors.clientId?.message} className="sm:col-span-2">
                <ClientPicker value={client} onSelect={selectClient} error={errors.clientId?.message} />
              </Field>
              <Field label="Punto de partida (sede)" htmlFor="originSiteId" error={errors.originSiteId?.message}>
                <Select id="originSiteId" error={errors.originSiteId?.message} {...register("originSiteId", { valueAsNumber: true })}>
                  <option value={0}>Selecciona…</option>
                  {sites?.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} — {site.district}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Fecha de inicio de traslado" htmlFor="transferDate" error={errors.transferDate?.message}>
                <Input id="transferDate" type="date" min={todayInLima()} error={errors.transferDate?.message} {...register("transferDate")} />
              </Field>
              <Field label="Punto de llegada" htmlFor="deliveryAddress" error={errors.deliveryAddress?.message} className="sm:col-span-2">
                <Input id="deliveryAddress" placeholder="Dirección de la obra o almacén del cliente" error={errors.deliveryAddress?.message} {...register("deliveryAddress")} />
              </Field>
              <Field label="Motivo de traslado" htmlFor="transferReason" error={errors.transferReason?.message}>
                <Select id="transferReason" {...register("transferReason")}>
                  {transferReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {transferReasonLabel[reason]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Observaciones" htmlFor="notes" error={errors.notes?.message}>
                <Input id="notes" placeholder="Opcional" {...register("notes")} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Bienes a trasladar"
              action={
                <Button type="button" variant="outline" className="px-4 py-2" onClick={() => append(emptyItem)} disabled={fields.length >= 50}>
                  <Plus className="size-4" aria-hidden /> Agregar
                </Button>
              }
            />
            <div className="divide-y divide-ink-100">
              {fields.map((field, index) => {
                const itemErrors = errors.items?.[index];
                return (
                  <div key={field.id} className="grid gap-4 p-5 sm:grid-cols-12">
                    <Field label="Producto" htmlFor={`items.${index}.productId`} error={itemErrors?.productId?.message} className="sm:col-span-5">
                      <Select id={`items.${index}.productId`} error={itemErrors?.productId?.message} {...register(`items.${index}.productId`, { valueAsNumber: true })}>
                        <option value={0}>Selecciona…</option>
                        {Object.entries(grouped).map(([category, list]) => (
                          <optgroup key={category} label={productCategoryLabel[category]}>
                            {list.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.unitOfMeasure})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Cantidad" htmlFor={`items.${index}.quantity`} error={itemErrors?.quantity?.message} className="sm:col-span-2">
                      <Input id={`items.${index}.quantity`} type="number" step="0.001" min="0" error={itemErrors?.quantity?.message} {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                    </Field>
                    <Field label="Peso (kg)" htmlFor={`items.${index}.weightKg`} error={itemErrors?.weightKg?.message} className="sm:col-span-2">
                      <Input id={`items.${index}.weightKg`} type="number" step="0.01" min="0" error={itemErrors?.weightKg?.message} {...register(`items.${index}.weightKg`, { valueAsNumber: true })} />
                    </Field>
                    <div className="flex items-end sm:col-span-3">
                      <Button type="button" variant="danger" className="w-full px-3" onClick={() => remove(index)} disabled={fields.length === 1}>
                        <Trash2 className="size-4" aria-hidden /> Quitar
                      </Button>
                    </div>
                    <Field label="Descripción (opcional)" htmlFor={`items.${index}.description`} className="sm:col-span-12">
                      <Textarea id={`items.${index}.description`} className="min-h-0" rows={1} placeholder="Ej.: Vidrio templado incoloro 10 mm, 1.20 × 2.40 m" {...register(`items.${index}.description`)} />
                    </Field>
                  </div>
                );
              })}
            </div>
            {errors.items?.root?.message || errors.items?.message ? (
              <p className="px-5 pb-4 text-xs font-medium text-red-600">{errors.items?.root?.message ?? errors.items?.message}</p>
            ) : null}
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-10 xl:self-start">
          <div className="rounded-[var(--radius-card)] bg-ink-800 p-6 text-white">
            <p className="text-sm text-ink-300">Peso bruto total</p>
            <p className="mt-2 text-4xl font-bold tracking-tight">{formatNumber(totalWeight)} kg</p>
            <p className="mt-4 text-sm text-ink-300">{fields.length} ítem(s)</p>
          </div>
          <div className="rounded-[var(--radius-card)] bg-sky-50 p-6 text-sm text-ink-600">
            <p className="font-semibold text-ink-900">Flujo de la guía</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-4">
              <li>Se guarda como borrador con serie T001.</li>
              <li>Al emitirla queda disponible para despacho.</li>
              <li>El despacho la pasa a “En tránsito” y “Entregada”.</li>
            </ol>
          </div>
        </aside>
      </div>
    </form>
  );
}
