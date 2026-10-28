"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FilePlus2, Search } from "lucide-react";
import { useApi } from "@/app/lib/use-api";
import { formatDate, formatNumber, guideStatusLabel } from "@/app/lib/format";
import type { GuideStatus, GuideSummary, Paged } from "@/app/lib/types";
import { ButtonLink } from "@/app/components/ui/button";
import { Card, EmptyState, ErrorState, GuideStatusBadge, Loading, PageHeader, Pagination, td, th } from "@/app/components/dashboard/ui";

const filters: (GuideStatus | "all")[] = ["all", "Draft", "Issued", "InTransit", "Delivered", "Cancelled"];

export default function GuidesPage() {
  const [status, setStatus] = useState<GuideStatus | "all">("all");
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

  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (status !== "all") params.set("status", status);
  if (term) params.set("search", term);
  const { data, error, loading, reload } = useApi<Paged<GuideSummary>>(`remission-guides?${params}`);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Guías de remisión"
        description="Emite, consulta y controla el estado de las guías de la sede."
        actions={
          <ButtonLink href="/dashboard/guias/nueva">
            <FilePlus2 className="size-4" aria-hidden /> Nueva guía
          </ButtonLink>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setStatus(filter);
                setPage(1);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                status === filter ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-ink-100 hover:ring-ink-300"
              }`}
            >
              {filter === "all" ? "Todas" : guideStatusLabel[filter]}
            </button>
          ))}
        </div>
        <label className="relative block lg:w-80">
          <span className="sr-only">Buscar guías</span>
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="N° de guía, cliente o RUC"
            className="w-full rounded-full border border-ink-100 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>
      </div>

      <Card className="flex min-h-96 flex-1 flex-col overflow-hidden">
        {loading && !data ? <Loading /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {data && data.items.length === 0 ? <EmptyState title="No hay guías" description="Ajusta los filtros o crea una nueva guía." /> : null}
        {data && data.items.length > 0 ? (
          <>
            <div className="relative min-h-64 flex-1">
              <div className="absolute inset-0 overflow-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="sticky top-0 z-10 bg-ink-50 shadow-[inset_0_-1px_0_var(--color-ink-100)]">
                  <tr>
                    <th className={th}>N° guía</th>
                    <th className={th}>Cliente</th>
                    <th className={th}>Traslado</th>
                    <th className={th}>Peso</th>
                    <th className={th}>Despacho</th>
                    <th className={th}>Estado</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-ink-100 ${loading ? "opacity-60" : ""}`}>
                  {data.items.map((guide) => (
                    <tr key={guide.id} className="hover:bg-sky-50/50">
                      <td className={td}>
                        <Link href={`/dashboard/guias/${guide.id}`} className="font-semibold text-ink-900 hover:text-sky-700">
                          {guide.number}
                        </Link>
                        <p className="text-xs text-ink-400">Emitida {formatDate(guide.issueDate)}</p>
                      </td>
                      <td className={td}>
                        <p className="max-w-xs truncate font-medium">{guide.clientName}</p>
                        <p className="text-xs text-ink-400">{guide.clientTaxId ? `RUC ${guide.clientTaxId}` : "Sin RUC"}</p>
                      </td>
                      <td className={td}>
                        <p>{formatDate(guide.transferDate)}</p>
                        <p className="max-w-xs truncate text-xs text-ink-400">{guide.deliveryAddress}</p>
                      </td>
                      <td className={td}>{formatNumber(guide.totalWeightKg)} kg</td>
                      <td className={td}>{guide.dispatchCode ?? <span className="text-ink-300">—</span>}</td>
                      <td className={td}>
                        <GuideStatusBadge status={guide.status} />
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
