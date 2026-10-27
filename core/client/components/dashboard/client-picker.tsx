"use client";

import { useEffect, useState } from "react";
import { Building2, LoaderCircle, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Client, Paged } from "@/lib/types";

export function ClientPicker({
  value,
  onSelect,
  error,
}: {
  value: Client | null;
  onSelect: (client: Client | null) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return;
    let cancelled = false;
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const page = await api<Paged<Client>>(`clients?search=${encodeURIComponent(term)}&pageSize=8`);
        if (!cancelled) setResults(page.items);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [query]);

  if (value) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
        <div className="flex gap-3">
          <Building2 className="mt-0.5 size-5 text-sky-600" aria-hidden />
          <div>
            <p className="font-semibold">{value.displayName}</p>
            <p className="text-xs text-ink-500">
              {value.taxId ? `RUC ${value.taxId}` : "Sin RUC"}
              {value.legalName && value.legalName !== value.displayName ? ` · ${value.legalName}` : ""}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => onSelect(null)} className="text-ink-400 hover:text-ink-900" aria-label="Quitar cliente">
          <X className="size-4" />
        </button>
      </div>
    );
  }

  const showResults = query.trim().length >= 2;

  return (
    <div className="relative">
      <Search className="absolute left-4 top-3.5 size-4 text-ink-400" aria-hidden />
      <input
        id="clientId"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Busca por razón social o RUC"
        autoComplete="off"
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-white py-3 pl-11 pr-10 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 ${
          error ? "border-red-400" : "border-ink-100"
        }`}
      />
      {loading ? <LoaderCircle className="absolute right-4 top-3.5 size-4 animate-spin text-ink-400" aria-hidden /> : null}
      {showResults ? (
        <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-ink-100 bg-white py-1 shadow-xl">
          {results.length === 0 && !loading ? <li className="px-4 py-3 text-sm text-ink-400">Sin resultados</li> : null}
          {results.map((client) => (
            <li key={client.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(client);
                  setQuery("");
                  setResults([]);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-sky-50"
              >
                <span className="block text-sm font-medium">{client.displayName}</span>
                <span className="block text-xs text-ink-400">
                  {client.taxId ? `RUC ${client.taxId}` : "Sin RUC"}
                  {client.district ? ` · ${client.district}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
