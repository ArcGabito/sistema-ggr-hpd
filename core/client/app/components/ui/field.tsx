import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:bg-ink-50 disabled:text-ink-400";

const tone = (error?: string) => (error ? "border-red-400" : "border-ink-100");

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, error, hint, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string }>(
  function Input({ error, className = "", ...props }, ref) {
    return <input ref={ref} aria-invalid={!!error} className={`${base} ${tone(error)} ${className}`} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { error?: string }>(
  function Select({ error, className = "", children, ...props }, ref) {
    return (
      <select ref={ref} aria-invalid={!!error} className={`${base} ${tone(error)} appearance-none pr-10 ${className}`} {...props}>
        {children}
      </select>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }>(
  function Textarea({ error, className = "", ...props }, ref) {
    return <textarea ref={ref} aria-invalid={!!error} className={`${base} ${tone(error)} min-h-28 ${className}`} {...props} />;
  },
);
