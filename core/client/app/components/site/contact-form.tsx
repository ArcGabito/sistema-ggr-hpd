"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { Mail, Phone } from "lucide-react";
import { contactSchema, type ContactInput } from "@/app/lib/schemas";
import { company } from "@/app/lib/site-data";
import { readError } from "@/app/lib/api";
import { withWakeUpNotice } from "@/app/lib/wake";
import { Button } from "@/app/components/ui/button";
import { Reveal } from "./reveal";

const darkInput =
  "w-full border-0 border-b bg-transparent px-0 py-3 text-sm text-white outline-none transition placeholder:text-ink-400 focus:border-sky-300 focus:ring-0";

export function ContactSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    const response = await withWakeUpNotice(() =>
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );

    if (!response.ok) {
      const error = await readError(response);
      sileo.error({ title: "No pudimos enviar tu solicitud", description: error.message });
      return;
    }

    sileo.success({ title: "¡Solicitud enviada!", description: "Nuestro equipo comercial te contactará pronto." });
    reset();
  };

  const line = (hasError: boolean) => (hasError ? "border-red-400" : "border-ink-600");

  return (
    <section id="contacto" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <div className="grid gap-12 overflow-hidden rounded-[var(--radius-panel)] bg-ink-800 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-2 lg:gap-20 lg:px-16">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Hablemos de tu proyecto</h2>
            <p className="mt-5 max-w-md text-base text-ink-300">
              Déjanos tus datos y un asesor te contactará para evaluar tu proyecto en vidrio y aluminio.
            </p>
            <ul className="mt-10 space-y-4 text-sm text-ink-200">
              <li>
                <a href={company.phoneHref} className="flex items-center gap-3 hover:text-white">
                  <Phone className="size-4 text-sky-300" aria-hidden /> {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.emails.sales}`} className="flex items-center gap-3 hover:text-white">
                  <Mail className="size-4 text-sky-300" aria-hidden /> {company.emails.sales}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.emails.projects}`} className="flex items-center gap-3 hover:text-white">
                  <Mail className="size-4 text-sky-300" aria-hidden /> {company.emails.projects}
                </a>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
            <DarkField id="fullName" label="Nombre completo" error={errors.fullName?.message}>
              <input id="fullName" autoComplete="name" placeholder="Nombre completo" className={`${darkInput} ${line(!!errors.fullName)}`} {...register("fullName")} />
            </DarkField>
            <DarkField id="company" label="Empresa" error={errors.company?.message}>
              <input id="company" autoComplete="organization" placeholder="Empresa (opcional)" className={`${darkInput} ${line(!!errors.company)}`} {...register("company")} />
            </DarkField>
            <DarkField id="email" label="Correo" error={errors.email?.message}>
              <input id="email" type="email" autoComplete="email" placeholder="Correo electrónico" className={`${darkInput} ${line(!!errors.email)}`} {...register("email")} />
            </DarkField>
            <DarkField id="phoneNumber" label="Teléfono" error={errors.phoneNumber?.message}>
              <input id="phoneNumber" type="tel" autoComplete="tel" placeholder="Teléfono" className={`${darkInput} ${line(!!errors.phoneNumber)}`} {...register("phoneNumber")} />
            </DarkField>
            <DarkField id="message" label="Mensaje" error={errors.message?.message} className="sm:col-span-2">
              <textarea id="message" rows={3} placeholder="Cuéntanos sobre tu proyecto" className={`${darkInput} resize-none ${line(!!errors.message)}`} {...register("message")} />
            </DarkField>

            <div className="sm:col-span-2">
              <label className="flex items-start gap-3 text-xs text-ink-300">
                <input type="checkbox" className="mt-0.5 size-4 rounded accent-sky-400" {...register("acceptPrivacy")} />
                Acepto la política de privacidad y el tratamiento de mis datos personales.
              </label>
              {errors.acceptPrivacy ? <p className="mt-1.5 text-xs text-red-300">{errors.acceptPrivacy.message}</p> : null}
            </div>

            <Button type="submit" variant="light" loading={isSubmitting} className="py-3.5 sm:col-span-2">
              Enviar solicitud
            </Button>
          </form>
        </div>
      </Reveal>
    </section>
  );
}

function DarkField({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
