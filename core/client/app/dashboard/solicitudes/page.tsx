"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Mail, Phone, RotateCcw } from "lucide-react";
import { sileo } from "sileo";
import { api } from "@/app/lib/api";
import { useApi } from "@/app/lib/use-api";
import { formatDateTime } from "@/app/lib/format";
import type { ContactRequest, Paged } from "@/app/lib/types";
import { Button } from "@/app/components/ui/button";
import { Card, EmptyState, ErrorState, FillScroll, Loading, PageHeader, Pagination } from "@/app/components/dashboard/ui";

const filters = [
  { key: "pending", label: "Pendientes", query: "attended=false" },
  { key: "attended", label: "Atendidas", query: "attended=true" },
  { key: "all", label: "Todas", query: "" },
] as const;

export default function ContactRequestsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("pending");
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const query = filters.find((f) => f.key === filter)!.query;
  const { data, error, loading, reload } = useApi<Paged<ContactRequest>>(`contact-requests?page=${page}&pageSize=20${query ? `&${query}` : ""}`);

  const toggle = async (item: ContactRequest) => {
    setPendingId(item.id);
    try {
      await api<ContactRequest>(`contact-requests/${item.id}`, { method: "PATCH", json: { isAttended: !item.isAttended } });
      sileo.success({ title: item.isAttended ? "Marcada como pendiente" : "Solicitud atendida", description: item.fullName });
      reload();
    } catch (err) {
      sileo.error({ title: "No se pudo actualizar", description: (err as Error).message });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Solicitudes de contacto" description="Mensajes enviados desde el formulario del sitio web." />

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f.key ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-ink-100 hover:ring-ink-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="flex min-h-96 flex-1 flex-col overflow-hidden">
        {loading && !data ? <Loading /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {data && data.items.length === 0 ? (
          <EmptyState title="No hay solicitudes" description="Las consultas del formulario de contacto aparecerán aquí." />
        ) : null}
        {data && data.items.length > 0 ? (
          <>
            <FillScroll>
              <ul className={`divide-y divide-ink-100 ${loading ? "opacity-60" : ""}`}>
                {data.items.map((item) => (
                  <li key={item.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-semibold">{item.fullName}</p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            item.isAttended ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.isAttended ? "Atendida" : "Pendiente"}
                        </span>
                        <span className="text-xs text-ink-400">{formatDateTime(item.createdAt)}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-500">
                        {item.company ? (
                          <span className="flex items-center gap-1.5">
                            <Building2 className="size-3.5" aria-hidden /> {item.company}
                          </span>
                        ) : null}
                        <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 hover:text-ink-900">
                          <Mail className="size-3.5" aria-hidden /> {item.email}
                        </a>
                        <a href={`tel:${item.phoneNumber.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-ink-900">
                          <Phone className="size-3.5" aria-hidden /> {item.phoneNumber}
                        </a>
                      </div>
                      <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-ink-700">{item.message}</p>
                    </div>
                    <div className="flex items-start">
                      <Button
                        variant={item.isAttended ? "outline" : "primary"}
                        className="px-4 py-2"
                        loading={pendingId === item.id}
                        onClick={() => toggle(item)}
                      >
                        {item.isAttended ? <RotateCcw className="size-4" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />}
                        {item.isAttended ? "Marcar pendiente" : "Marcar atendida"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </FillScroll>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.totalCount} onChange={setPage} />
          </>
        ) : null}
      </Card>
    </div>
  );
}
