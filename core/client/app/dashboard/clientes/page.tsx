"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useApi } from "@/app/lib/use-api";
import type { Client, Paged } from "@/app/lib/types";
import { Card, EmptyState, ErrorState, Loading, PageHeader, Pagination, td, th } from "@/app/components/dashboard/ui";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setTerm(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const params = new URLSearchParams({ page: String(page), pageSize: "25" });
  if (term) params.set("search", term);
  const { data, error, loading, reload } = useApi<Paged<Client>>(`clients?${params}`);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Clientes" description="Destinatarios disponibles para las guías de remisión." />

      <label className="relative block max-w-md">
        <span className="sr-only">Buscar clientes</span>
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Razón social, nombre comercial o RUC"
          className="w-full rounded-full border border-ink-100 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
      </label>

      <Card className="flex min-h-96 flex-1 flex-col overflow-hidden">
        {loading && !data ? <Loading /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {data && data.items.length === 0 ? <EmptyState title="Sin resultados" description="Prueba con otro término de búsqueda." /> : null}
        {data && data.items.length > 0 ? (
          <>
            <div className="relative min-h-64 flex-1">
              <div className="absolute inset-0 overflow-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="sticky top-0 z-10 bg-ink-50 shadow-[inset_0_-1px_0_var(--color-ink-100)]">
                  <tr>
                    <th className={th}>Cliente</th>
                    <th className={th}>RUC</th>
                    <th className={th}>Contacto</th>
                    <th className={th}>Ubicación</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-ink-100 ${loading ? "opacity-60" : ""}`}>
                  {data.items.map((client) => (
                    <tr key={client.id} className="hover:bg-sky-50/50">
                      <td className={td}>
                        <p className="font-semibold">{client.displayName}</p>
                        {client.legalName && client.legalName !== client.displayName ? <p className="text-xs text-ink-400">{client.legalName}</p> : null}
                      </td>
                      <td className={`${td} font-mono text-xs`}>{client.taxId ?? "—"}</td>
                      <td className={td}>
                        <p>{client.contactName ?? "—"}</p>
                        {client.phoneNumber ? <p className="text-xs text-ink-400">{client.phoneNumber}</p> : null}
                      </td>
                      <td className={td}>
                        <p className="max-w-xs truncate">{client.address ?? "—"}</p>
                        <p className="text-xs text-ink-400">{[client.district, client.province].filter(Boolean).join(", ")}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.totalCount} onChange={setPage} />
          </>
        ) : null}
      </Card>
    </div>
  );
}
