import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";

type Variant = "primary" | "light" | "outline" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-ink-900 text-white hover:bg-ink-700",
  light: "bg-white text-ink-900 hover:bg-sky-50",
  outline: "border border-ink-200 bg-white text-ink-900 hover:border-ink-900",
  ghost: "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60";

export function buttonClass(variant: Variant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button className={buttonClass(variant, className)} disabled={disabled || loading} {...props}>
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "primary", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
