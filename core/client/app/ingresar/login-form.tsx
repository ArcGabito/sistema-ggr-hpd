"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { readError } from "@/lib/api";
import type { User } from "@/lib/types";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

/** Solo se permiten redirecciones internas del dashboard. */
function safeNext(value: string | null) {
  return value && value.startsWith("/dashboard") && !value.startsWith("//") ? value : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await readError(response);
      sileo.error({ title: "No se pudo ingresar", description: error.message });
      return;
    }

    const { user } = (await response.json()) as { user: User };
    sileo.success({ title: `¡Bienvenido, ${user.fullName.split(" ")[0]}!`, description: "Sesión iniciada correctamente." });
    router.replace(safeNext(searchParams.get("next")));
    router.refresh();
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-10 space-y-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Field label="Correo corporativo" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" placeholder="usuario@hpdglass.com" error={errors.email?.message} {...register("email")} />
      </Field>

      <Field label="Contraseña" htmlFor="password" error={errors.password?.message}>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pr-12"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink-400 hover:text-ink-900"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" loading={isSubmitting} className="w-full py-3.5">
        Ingresar
      </Button>
    </motion.form>
  );
}
