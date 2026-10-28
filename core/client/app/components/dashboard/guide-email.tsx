"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { CheckCircle2, FileText, Mail, Paperclip, X, XCircle } from "lucide-react";
import { api } from "@/app/lib/api";
import { formatDateTime } from "@/app/lib/format";
import { guideEmailSchema, type GuideEmailInput } from "@/app/lib/schemas";
import type { GuideDetail, GuideEmail } from "@/app/lib/types";
import { Button } from "@/app/components/ui/button";
import { Field, Input, Textarea } from "@/app/components/ui/field";
import { Card, CardHeader, EmptyState } from "./ui";

/** Panel lateral para enviar la guía en PDF (y la factura adjunta) al correo del cliente. */
export function GuideEmailPanel({
  guide,
  open,
  onClose,
  onSent,
}: {
  guide: GuideDetail;
  open: boolean;
  onClose: () => void;
  onSent: (email: GuideEmail) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuideEmailInput>({
    resolver: zodResolver(guideEmailSchema),
    defaultValues: { to: guide.client.email ?? "", cc: "", message: "", saveClientEmail: !guide.client.email },
  });
  const invoice = useWatch({ control, name: "invoice" });

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onSubmit = async (data: GuideEmailInput) => {
    const form = new FormData();
    form.set("to", data.to);
    if (data.cc) form.set("cc", data.cc);
    if (data.message) form.set("message", data.message);
    form.set("saveClientEmail", String(data.saveClientEmail));
    if (data.invoice?.length) form.set("invoice", data.invoice[0]);

    try {
      const sent = await api<GuideEmail>(`remission-guides/${guide.id}/email`, { method: "POST", body: form });
      sileo.success({
        title: "Guía enviada",
        description: `${guide.number} a ${sent.to}${sent.invoiceFileName ? " con la factura adjunta" : ""}.`,
      });
      onSent(sent);
      reset({ to: data.to, cc: "", message: "", saveClientEmail: false, invoice: undefined });
      onClose();
    } catch (error) {
      sileo.error({ title: "No se pudo enviar el correo", description: (error as Error).message });
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink-900/40 print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-email-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl print:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink-100 p-6">
              <div>
                <h2 id="guide-email-title" className="text-xl font-bold tracking-tight">
                  Enviar al cliente
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  {guide.number} · {guide.client.legalName ?? guide.client.displayName}
                </p>
              </div>
              <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full text-ink-500 hover:bg-ink-50" aria-label="Cerrar">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
              <Field label="Para" htmlFor="to" error={errors.to?.message} hint={guide.client.email ? undefined : "El cliente aún no tiene un correo registrado."}>
                <Input id="to" type="email" autoComplete="off" placeholder="compras@cliente.com" error={errors.to?.message} {...register("to")} />
              </Field>
              <Field label="Copia (opcional)" htmlFor="cc" error={errors.cc?.message}>
                <Input id="cc" type="email" autoComplete="off" error={errors.cc?.message} {...register("cc")} />
              </Field>
              <Field label="Mensaje (opcional)" htmlFor="message" error={errors.message?.message}>
                <Textarea id="message" className="min-h-24" placeholder="Indicaciones para la recepción, horario de entrega, etc." {...register("message")} />
              </Field>

              <Field label="Factura (PDF)" htmlFor="invoice" error={errors.invoice?.message} hint="Adjunta la factura emitida por tu sistema de facturación. Máximo 10 MB.">
                <label
                  htmlFor="invoice"
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-4 text-sm transition hover:border-sky-500 hover:bg-sky-50 ${
                    errors.invoice ? "border-red-400" : "border-ink-200"
                  }`}
                >
                  <Paperclip className="size-4 shrink-0 text-ink-400" aria-hidden />
                  <span className="min-w-0 truncate">
                    {invoice?.length ? (
                      <span className="font-medium text-ink-900">{invoice[0].name}</span>
                    ) : (
                      <span className="text-ink-500">Seleccionar archivo PDF</span>
                    )}
                  </span>
                </label>
                <input id="invoice" type="file" accept="application/pdf,.pdf" className="sr-only" {...register("invoice")} />
              </Field>

              <div className="rounded-xl bg-sky-50 p-4 text-sm text-ink-600">
                <p className="font-semibold text-ink-900">Se adjuntará</p>
                <ul className="mt-2 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <FileText className="size-4 text-sky-600" aria-hidden /> guia-remision-{guide.number}.pdf
                  </li>
                  {invoice?.length ? (
                    <li className="flex items-center gap-2">
                      <FileText className="size-4 text-sky-600" aria-hidden /> {invoice[0].name}
                    </li>
                  ) : null}
                </ul>
              </div>

              <label className="flex items-start gap-3 text-sm text-ink-600">
                <input type="checkbox" className="mt-0.5 size-4 accent-ink-900" {...register("saveClientEmail")} />
                Guardar este correo como contacto del cliente para próximos envíos.
              </label>

              <div className="mt-auto flex justify-end gap-2 border-t border-ink-100 pt-5">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  <Mail className="size-4" aria-hidden /> Enviar correo
                </Button>
              </div>
            </form>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function GuideEmailHistory({ emails }: { emails: GuideEmail[] | null }) {
  return (
    <Card className="print:hidden">
      <CardHeader title="Envíos al cliente" />
      {emails && emails.length === 0 ? <EmptyState title="Aún no se envió por correo" description="Usa “Enviar al cliente” para mandar la guía y su factura." /> : null}
      {emails && emails.length > 0 ? (
        <ul className="divide-y divide-ink-100">
          {emails.map((email) => (
            <li key={email.id} className="flex items-start gap-3 px-5 py-4 text-sm">
              {email.succeeded ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Enviado" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-label="Fallido" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {email.to}
                  {email.cc ? <span className="font-normal text-ink-400"> · cc {email.cc}</span> : null}
                </p>
                <p className="text-xs text-ink-500">
                  {formatDateTime(email.sentAt)} · {email.sentBy}
                  {email.invoiceFileName ? ` · Factura: ${email.invoiceFileName}` : " · Sin factura"}
                </p>
                {email.error ? <p className="mt-1 text-xs text-red-600">{email.error}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
