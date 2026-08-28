import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PrazoBadge } from "@/components/StatusBadge";
import { DeliveryDialog } from "@/components/DeliveryDialog";
import { NewDeliveryDialog } from "@/components/NewDeliveryDialog";
import { useAppData } from "@/hooks/useAppData";
import {
  PERIOD_LABEL,
  PERIOD_WINDOW,
  formatDate,
  prazoEncerrado,
  todayISO,
  type Delivery,
  type DeliveryPeriod,
} from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Dashboard de entregas | Controle da Farmácia" },
      { name: "description", content: "Visão geral das entregas do dia, status operacionais e alertas de prazo da farmácia." },
      { property: "og:title", content: "Dashboard de entregas | Controle da Farmácia" },
      { property: "og:description", content: "Visão geral das entregas do dia, status operacionais e alertas de prazo." },
    ],
  }),
  component: Painel,
});

function Painel() {
  const { deliveries, motoboys, profiles } = useAppData();
  const [filtro, setFiltro] = useState<"todos" | DeliveryPeriod>("todos");
  const [selected, setSelected] = useState<Delivery | null>(null);
  const hoje = todayISO();

  const count = (fn: (d: Delivery) => boolean) => deliveries.filter(fn).length;
  const cards = [
    { label: "Total de entregas", value: deliveries.length },
    { label: "Aguardando logística", value: count((d) => d.status === "aguardando_logistica") },
    { label: "Impressão de romaneios", value: count((d) => d.status === "impressao_romaneios") },
    { label: "Prontas para saída", value: count((d) => d.status === "pronto_saida") },
    { label: "Em rota", value: count((d) => d.status === "em_rota") },
    { label: "Aguardando conferência", value: count((d) => d.status === "aguardando_conferencia") },
    { label: "Concluídas", value: count((d) => d.status === "concluido") },
    { label: "Não entregues", value: count((d) => d.status === "nao_entregue") },
    { label: "Canceladas", value: count((d) => d.status === "cancelado") },
    { label: "Prazo encerrado", value: count(prazoEncerrado) },
  ];

  const doDia = deliveries
    .filter((d) => d.data_prevista.slice(0, 10) === hoje)
    .filter((d) => filtro === "todos" || d.periodo === filtro);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Acompanhamento das entregas da farmácia</p>
        </div>
        <NewDeliveryDialog />
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-semibold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-2 text-lg font-semibold">Entregas de hoje</h2>
          {(["todos", "manha", "tarde_noite"] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={filtro === p ? "default" : "outline"}
              onClick={() => setFiltro(p)}
            >
              {p === "todos" ? "Todos" : `${PERIOD_LABEL[p]} — ${PERIOD_WINDOW[p]}`}
            </Button>
          ))}
        </div>

        {doDia.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma entrega prevista para hoje neste filtro.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {doDia.map((d) => (
              <button key={d.id} onClick={() => setSelected(d)} className="text-left">
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="space-y-1.5 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">Romaneio {d.numero_romaneio}</p>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-sm">{d.cliente}</p>
                    <p className="text-xs text-muted-foreground">
                      Pedido {d.numero_pedido} · {formatDate(d.data_prevista)} · {PERIOD_WINDOW[d.periodo]}
                    </p>
                    {prazoEncerrado(d) && <PrazoBadge />}
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </section>

      <DeliveryDialog
        delivery={selected}
        motoboys={motoboys}
        profiles={profiles}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}
