import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PrazoBadge } from "@/components/StatusBadge";
import { DeliveryDialog } from "@/components/DeliveryDialog";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { useDeliveryActions } from "@/hooks/useDeliveryActions";
import { PERIOD_WINDOW, formatDate, prazoEncerrado, type Delivery } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/conferencia")({
  head: () => ({
    meta: [
      { title: "Conferência de romaneios | Controle da Farmácia" },
      { name: "description", content: "Confira os romaneios retornados pelo motoboy e conclua entregas individualmente ou em lote." },
      { property: "og:title", content: "Conferência de romaneios | Controle da Farmácia" },
      { property: "og:description", content: "Confira romaneios retornados e conclua entregas em lote." },
    ],
  }),
  component: Conferencia,
});

function Conferencia() {
  const { isLogistica, loading } = useAuth();
  const { deliveries, motoboys, profiles } = useAppData();
  const { moveStatus } = useDeliveryActions();
  const [sel, setSel] = useState<string[]>([]);
  const [detalhe, setDetalhe] = useState<Delivery | null>(null);

  const pendentes = deliveries.filter((d) => d.status === "aguardando_conferencia");
  const selecionadas = pendentes.filter((d) => sel.includes(d.id));

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!isLogistica) return <Navigate to="/painel" replace />;

  const toggle = (id: string) =>
    setSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="space-y-4 pb-24">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Conferência de entregas</h1>
        <p className="text-sm text-muted-foreground">
          Entregas aguardando a conferência dos romaneios devolvidos pelo motoboy. A data prevista é mantida
          separada da data da conferência.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={sel.length > 0 && sel.length === pendentes.length}
                  onCheckedChange={(c) => setSel(c ? pendentes.map((d) => d.id) : [])}
                  aria-label="Selecionar todas"
                />
              </TableHead>
              <TableHead>Romaneio</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data prevista</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Motoboy</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendentes.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <Checkbox checked={sel.includes(d.id)} onCheckedChange={() => toggle(d.id)} />
                </TableCell>
                <TableCell className="cursor-pointer font-medium" onClick={() => setDetalhe(d)}>
                  {d.numero_romaneio}
                </TableCell>
                <TableCell>{d.numero_pedido}</TableCell>
                <TableCell>{d.cliente}</TableCell>
                <TableCell>{formatDate(d.data_prevista)}</TableCell>
                <TableCell className="whitespace-nowrap">{PERIOD_WINDOW[d.periodo]}</TableCell>
                <TableCell>{motoboys.find((m) => m.id === d.motoboy_id)?.nome ?? "—"}</TableCell>
                <TableCell className="space-y-1">
                  <StatusBadge status={d.status} />
                  {prazoEncerrado(d) && <PrazoBadge />}
                </TableCell>
              </TableRow>
            ))}
            {pendentes.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Nenhuma entrega aguardando conferência.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {sel.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-3 shadow-lg backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{sel.length} entrega(s) selecionada(s)</span>
            <Button
              onClick={() => {
                moveStatus.mutate({ deliveries: selecionadas, status: "concluido" });
                setSel([]);
              }}
            >
              Confirmar entregas selecionadas
            </Button>
            <Button variant="ghost" onClick={() => setSel([])}>Limpar seleção</Button>
          </div>
        </div>
      )}

      <DeliveryDialog
        delivery={detalhe}
        motoboys={motoboys}
        profiles={profiles}
        allowFinalStatuses={true}
        onOpenChange={(o) => !o && setDetalhe(null)}
      />
    </div>
  );
}
