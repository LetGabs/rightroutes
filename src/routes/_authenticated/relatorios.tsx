import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { PERIOD_LABEL, PERIOD_WINDOW, prazoEncerrado, type Delivery } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios de entregas | Controle da Farmácia" },
      { name: "description", content: "Relatórios gerenciais por vendedor, motoboy, período e prazo, com tempo médio até a conferência." },
      { property: "og:title", content: "Relatórios de entregas | Controle da Farmácia" },
      { property: "og:description", content: "Relatórios gerenciais por vendedor, motoboy, período e prazo." },
    ],
  }),
  component: Relatorios,
});

function Relatorios() {
  const { isLogistica, loading } = useAuth();
  const { deliveries, motoboys, profiles } = useAppData();
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const lista = useMemo(
    () =>
      deliveries.filter((d) => {
        const data = d.data_prevista.slice(0, 10);
        if (de && data < de) return false;
        if (ate && data > ate) return false;
        return true;
      }),
    [deliveries, de, ate],
  );

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!isLogistica) return <Navigate to="/painel" replace />;

  const n = (fn: (d: Delivery) => boolean) => lista.filter(fn).length;
  const conferidas = lista.filter((d) => d.conferido_em);
  const mediaDias =
    conferidas.length === 0
      ? 0
      : conferidas.reduce((acc, d) => {
          const prev = new Date(`${d.data_prevista.slice(0, 10)}T00:00:00`).getTime();
          const conf = new Date(d.conferido_em!).getTime();
          return acc + (conf - prev) / 86400000;
        }, 0) / conferidas.length;

  const cards = [
    { label: "Total de entregas", value: lista.length },
    { label: "Concluídas", value: n((d) => d.status === "concluido") },
    { label: "Não entregues", value: n((d) => d.status === "nao_entregue") },
    { label: "Canceladas", value: n((d) => d.status === "cancelado") },
    { label: "Prazo encerrado", value: n(prazoEncerrado) },
    { label: "Dias médios até a conferência", value: mediaDias.toFixed(1) },
  ];

  const porVendedor = profiles
    .map((p) => ({ nome: p.nome, total: lista.filter((d) => d.vendedor_id === p.id).length }))
    .filter((r) => r.total > 0);
  const porMotoboy = motoboys
    .map((m) => ({ nome: m.nome, total: lista.filter((d) => d.motoboy_id === m.id).length }))
    .filter((r) => r.total > 0);
  const porPeriodo = (["manha", "tarde_noite"] as const).map((p) => ({
    nome: `${PERIOD_LABEL[p]} — ${PERIOD_WINDOW[p]}`,
    total: lista.filter((d) => d.periodo === p).length,
  }));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Consolidado por período de data prevista.</p>
      </header>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
        <div className="space-y-1.5">
          <Label htmlFor="de">De</Label>
          <Input id="de" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ate">Até</Label>
          <Input id="ate" type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-semibold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { titulo: "Entregas por vendedor", linhas: porVendedor },
          { titulo: "Entregas por motoboy", linhas: porMotoboy },
          { titulo: "Entregas por período", linhas: porPeriodo },
        ].map((bloco) => (
          <div key={bloco.titulo} className="rounded-lg border bg-card">
            <p className="border-b px-3 py-2 text-sm font-semibold">{bloco.titulo}</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bloco.linhas.map((l) => (
                  <TableRow key={l.nome}>
                    <TableCell>{l.nome}</TableCell>
                    <TableCell className="text-right">{l.total}</TableCell>
                  </TableRow>
                ))}
                {bloco.linhas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">Sem dados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  );
}
