import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PrazoBadge } from "@/components/StatusBadge";
import { DeliveryDialog } from "@/components/DeliveryDialog";
import { NewDeliveryDialog } from "@/components/NewDeliveryDialog";
import { useAppData } from "@/hooks/useAppData";
import {
  ALL_STATUSES,
  PERIOD_WINDOW,
  STATUS_LABEL,
  formatDate,
  prazoEncerrado,
  type Delivery,
} from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/entregas")({
  head: () => ({
    meta: [
      { title: "Entregas e busca | Controle da Farmácia" },
      { name: "description", content: "Pesquise qualquer entrega por romaneio, pedido, cliente, vendedor ou motoboy e acompanhe o status." },
      { property: "og:title", content: "Entregas e busca | Controle da Farmácia" },
      { property: "og:description", content: "Pesquise qualquer entrega por romaneio, pedido, cliente, vendedor ou motoboy." },
    ],
  }),
  component: Entregas,
});

function Entregas() {
  const { deliveries, motoboys, profiles } = useAppData();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [periodo, setPeriodo] = useState("todos");
  const [data, setData] = useState("");
  const [vendedor, setVendedor] = useState("todos");
  const [motoboy, setMotoboy] = useState("todos");
  const [prazo, setPrazo] = useState(false);
  const [selected, setSelected] = useState<Delivery | null>(null);

  const nomeVendedor = (id: string) => profiles.find((p) => p.id === id)?.nome ?? "—";
  const nomeMotoboy = (id: string | null) => motoboys.find((m) => m.id === id)?.nome ?? "—";

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return deliveries.filter((d) => {
      if (q) {
        const alvo = [
          d.numero_romaneio,
          d.numero_pedido,
          d.cliente,
          nomeVendedor(d.vendedor_id),
          nomeMotoboy(d.motoboy_id),
        ]
          .join(" ")
          .toLowerCase();
        if (!alvo.includes(q)) return false;
      }
      if (status !== "todos" && d.status !== status) return false;
      if (periodo !== "todos" && d.periodo !== periodo) return false;
      if (data && d.data_prevista.slice(0, 10) !== data) return false;
      if (vendedor !== "todos" && d.vendedor_id !== vendedor) return false;
      if (motoboy !== "todos" && d.motoboy_id !== motoboy) return false;
      if (prazo && !prazoEncerrado(d)) return false;
      return true;
    });
  }, [deliveries, busca, status, periodo, data, vendedor, motoboy, prazo, profiles, motoboys]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entregas</h1>
          <p className="text-sm text-muted-foreground">
            Todas as entregas cadastradas no sistema, de todos os vendedores.
          </p>
        </div>
        <NewDeliveryDialog />
      </header>

      <div className="grid gap-2 rounded-lg border bg-card p-3 md:grid-cols-3 xl:grid-cols-6">
        <Input
          className="md:col-span-3 xl:col-span-2"
          placeholder="Buscar por romaneio, pedido, cliente, vendedor ou motoboy"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os períodos</SelectItem>
            <SelectItem value="manha">Manhã — 10:00 às 13:00</SelectItem>
            <SelectItem value="tarde_noite">Tarde/Noite — 15:00 às 19:00</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        <Select value={vendedor} onValueChange={setVendedor}>
          <SelectTrigger><SelectValue placeholder="Vendedor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os vendedores</SelectItem>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={motoboy} onValueChange={setMotoboy}>
          <SelectTrigger><SelectValue placeholder="Motoboy" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os motoboys</SelectItem>
            {motoboys.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 md:col-span-3 xl:col-span-6">
          <Button size="sm" variant={prazo ? "default" : "outline"} onClick={() => setPrazo(!prazo)}>
            Somente prazo encerrado
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setBusca("");
              setStatus("todos");
              setPeriodo("todos");
              setData("");
              setVendedor("todos");
              setMotoboy("todos");
              setPrazo(false);
            }}
          >
            Limpar filtros
          </Button>
          <span className="ml-auto self-center text-sm text-muted-foreground">{lista.length} entrega(s)</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Romaneio</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data prevista</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Motoboy</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((d) => (
              <TableRow key={d.id} className="cursor-pointer" onClick={() => setSelected(d)}>
                <TableCell className="font-medium">{d.numero_romaneio}</TableCell>
                <TableCell>{d.numero_pedido}</TableCell>
                <TableCell>{d.cliente}</TableCell>
                <TableCell>{formatDate(d.data_prevista)}</TableCell>
                <TableCell className="whitespace-nowrap">{PERIOD_WINDOW[d.periodo]}</TableCell>
                <TableCell>{nomeVendedor(d.vendedor_id)}</TableCell>
                <TableCell>{nomeMotoboy(d.motoboy_id)}</TableCell>
                <TableCell className="space-y-1">
                  <StatusBadge status={d.status} />
                  {prazoEncerrado(d) && <PrazoBadge />}
                </TableCell>
              </TableRow>
            ))}
            {lista.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Nenhuma entrega encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeliveryDialog
        delivery={selected}
        motoboys={motoboys}
        profiles={profiles}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}
