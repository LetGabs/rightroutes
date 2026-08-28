import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PrazoBadge } from "@/components/StatusBadge";
import { DeliveryDialog } from "@/components/DeliveryDialog";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { useDeliveryActions } from "@/hooks/useDeliveryActions";
import {
  ALL_STATUSES,
  PERIOD_WINDOW,
  STATUS_COLUMN_CLASS,
  STATUS_LABEL,
  STATUS_ORDER,
  formatDate,
  prazoEncerrado,
  type Delivery,
  type DeliveryStatus,
} from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/kanban")({
  head: () => ({
    meta: [
      { title: "Painel de logística | Controle da Farmácia" },
      { name: "description", content: "Kanban operacional com seleção múltipla, movimentação em lote, atribuição de motoboy e impressão de romaneios." },
      { property: "og:title", content: "Painel de logística | Controle da Farmácia" },
      { property: "og:description", content: "Kanban operacional com ações em lote e impressão de romaneios." },
    ],
  }),
  component: Kanban,
});

function Kanban() {
  const { isLogistica, loading } = useAuth();
  const { deliveries, motoboys, profiles } = useAppData();
  const { moveStatus, assignMotoboy, confirmPrint } = useDeliveryActions();
  const [sel, setSel] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [detalhe, setDetalhe] = useState<Delivery | null>(null);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return deliveries;
    return deliveries.filter((d) =>
      [d.numero_romaneio, d.numero_pedido, d.cliente].join(" ").toLowerCase().includes(q),
    );
  }, [deliveries, busca]);

  const selecionadas = deliveries.filter((d) => sel.includes(d.id));
  const paraImprimir = deliveries.filter((d) => d.status === "impressao_romaneios" && !d.impresso_em);
  const selParaImprimir = selecionadas.filter((d) => d.status === "impressao_romaneios");

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!isLogistica) return <Navigate to="/painel" replace />;

  const toggle = (id: string) =>
    setSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const runMove = (status: DeliveryStatus) => {
    moveStatus.mutate({ deliveries: selecionadas, status });
    setSel([]);
  };

  return (
    <div className="space-y-4 pb-28">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Painel de logística</h1>
          <p className="text-sm text-muted-foreground">Organize as entregas por etapa do fluxo operacional.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            className="w-56"
            placeholder="Buscar romaneio, pedido, cliente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Button
            variant="outline"
            disabled={paraImprimir.length === 0}
            title="Marca como impressos todos os romaneios pendentes da etapa. A impressão é feita no Fórmula Certa."
            onClick={() => confirmPrint.mutate({ deliveries: paraImprimir })}
          >
            Confirmar impressão de todos ({paraImprimir.length})
          </Button>
        </div>
      </header>

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="tabela">Tabela</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="pt-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
            {STATUS_ORDER.map((status) => {
              const cards = lista.filter((d) => d.status === status);
              return (
                <div
                  key={status}
                  className={`flex max-h-[70vh] flex-col rounded-lg border border-t-4 ${STATUS_COLUMN_CLASS[status]}`}
                >
                  <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wide">{STATUS_LABEL[status]}</p>
                    <span className="rounded bg-background px-1.5 text-xs text-muted-foreground">{cards.length}</span>
                  </div>
                  <div className="space-y-2 overflow-y-auto p-2">
                    {cards.map((d) => {
                      const temObs = !!d.observacoes?.trim();
                      return (
                        <div
                          key={d.id}
                          className={`rounded-md border p-2 text-xs ${
                            temObs ? "border-obs/70 bg-obs/25" : "bg-card"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              className="mt-0.5"
                              checked={sel.includes(d.id)}
                              onCheckedChange={() => toggle(d.id)}
                              aria-label={`Selecionar romaneio ${d.numero_romaneio}`}
                            />
                            <button className="min-w-0 flex-1 text-left" onClick={() => setDetalhe(d)}>
                              <p className="text-sm font-semibold leading-tight">
                                Romaneio {d.numero_romaneio}
                                {temObs && (
                                  <span className="ml-1.5 rounded bg-obs/60 px-1 text-[10px] font-bold uppercase text-foreground">
                                    obs
                                  </span>
                                )}
                              </p>
                              <p className="truncate font-medium">{d.cliente}</p>
                              <p className="text-muted-foreground">
                                Pedido {d.numero_pedido} · {formatDate(d.data_prevista)} · {PERIOD_WINDOW[d.periodo]}
                              </p>
                              <p className="text-muted-foreground">
                                Motoboy: {motoboys.find((m) => m.id === d.motoboy_id)?.nome ?? "—"}
                              </p>
                              {temObs && (
                                <p className="mt-1 line-clamp-2 rounded border-l-2 border-obs bg-obs/20 px-1.5 py-0.5 font-medium">
                                  {d.observacoes}
                                </p>
                              )}
                              {prazoEncerrado(d) && <PrazoBadge />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {cards.length === 0 && <p className="p-2 text-xs text-muted-foreground">Nenhuma entrega.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tabela" className="pt-3">
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Romaneio</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Motoboy</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((d) => (
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
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {sel.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-3 shadow-lg backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{sel.length} entrega(s) selecionada(s)</span>
            <Select onValueChange={(v) => runMove(v as DeliveryStatus)}>
              <SelectTrigger className="w-52"><SelectValue placeholder="Mover para…" /></SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(v) => {
                const m = motoboys.find((x) => x.id === v);
                if (m) assignMotoboy.mutate({ deliveries: selecionadas, motoboy: m });
                setSel([]);
              }}
            >
              <SelectTrigger className="w-48"><SelectValue placeholder="Atribuir motoboy" /></SelectTrigger>
              <SelectContent>
                {motoboys.filter((m) => m.ativo).map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                printAndRegister.mutate({ deliveries: selecionadas, motoboys });
                setSel([]);
              }}
            >
              Imprimir romaneios selecionados
            </Button>
            <Button variant="ghost" onClick={() => setSel([])}>Limpar seleção</Button>
          </div>
        </div>
      )}

      <DeliveryDialog
        delivery={detalhe}
        motoboys={motoboys}
        profiles={profiles}
        onOpenChange={(o) => !o && setDetalhe(null)}
      />
    </div>
  );
}
