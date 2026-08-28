import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, PrazoBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useDeliveryActions } from "@/hooks/useDeliveryActions";
import { fetchHistory } from "@/lib/api";
import {
  ALL_STATUSES,
  NAO_ENTREGA_MOTIVOS,
  PERIOD_LABEL,
  PERIOD_WINDOW,
  STATUS_LABEL,
  formatDate,
  formatDateTime,
  prazoEncerrado,
  type Delivery,
  type DeliveryStatus,
  type Motoboy,
  type Profile,
} from "@/lib/domain";

type Props = {
  delivery: Delivery | null;
  motoboys: Motoboy[];
  profiles: Profile[];
  onOpenChange: (open: boolean) => void;
};

export function DeliveryDialog({ delivery, motoboys, profiles, onOpenChange }: Props) {
  const { isLogistica } = useAuth();
  const { moveStatus, assignMotoboy, printAndRegister } = useDeliveryActions();
  const [motivo, setMotivo] = useState(NAO_ENTREGA_MOTIVOS[0]!);
  const [obs, setObs] = useState("");

  const { data: history = [] } = useQuery({
    queryKey: ["history", delivery?.id],
    queryFn: () => fetchHistory(delivery!.id),
    enabled: !!delivery,
  });

  if (!delivery) return null;
  const vendedor = profiles.find((p) => p.id === delivery.vendedor_id)?.nome ?? "—";
  const conferente = profiles.find((p) => p.id === delivery.conferido_por)?.nome ?? "—";
  const impressor = profiles.find((p) => p.id === delivery.impresso_por)?.nome ?? "—";
  const motoboy = motoboys.find((m) => m.id === delivery.motoboy_id);

  const info: [string, string][] = [
    ["Nº do romaneio", delivery.numero_romaneio],
    ["Nº do pedido", delivery.numero_pedido],
    ["Cliente", delivery.cliente],
    ["Data prevista", formatDate(delivery.data_prevista)],
    ["Período", `${PERIOD_LABEL[delivery.periodo]} — ${PERIOD_WINDOW[delivery.periodo]}`],
    ["Vendedor responsável", vendedor],
    ["Motoboy", motoboy?.nome ?? "—"],
    ["Observações", delivery.observacoes || "—"],
    ["Romaneio impresso em", delivery.impresso_em ? `${formatDateTime(delivery.impresso_em)} — ${impressor}` : "—"],
    ["Conferência", delivery.conferido_em ? `${formatDateTime(delivery.conferido_em)} — ${conferente}` : "—"],
    ["Motivo da não entrega", delivery.motivo_nao_entrega || "—"],
  ];

  return (
    <Dialog open={!!delivery} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Romaneio {delivery.numero_romaneio}
            <StatusBadge status={delivery.status} />
            {prazoEncerrado(delivery) && <PrazoBadge />}
          </DialogTitle>
        </DialogHeader>

        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {info.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-medium break-words">{value}</dd>
            </div>
          ))}
        </dl>

        {isLogistica && (
          <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
            <p className="text-sm font-semibold">Ações da logística</p>
            <div className="flex flex-wrap gap-2">
              <Select
                value={delivery.status}
                onValueChange={(v) => moveStatus.mutate({ deliveries: [delivery], status: v as DeliveryStatus })}
              >
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={delivery.motoboy_id ?? ""}
                onValueChange={(v) => {
                  const m = motoboys.find((x) => x.id === v);
                  if (m) assignMotoboy.mutate({ deliveries: [delivery], motoboy: m });
                }}
              >
                <SelectTrigger className="w-48"><SelectValue placeholder="Atribuir motoboy" /></SelectTrigger>
                <SelectContent>
                  {motoboys.filter((m) => m.ativo).map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => printAndRegister.mutate({ deliveries: [delivery], motoboys })}>
                Imprimir romaneio
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={() => moveStatus.mutate({ deliveries: [delivery], status: "concluido" })}>
                ✅ Entregue (concluir)
              </Button>
              <div className="space-y-2 rounded-md border bg-background p-2">
                <p className="text-xs font-medium">❌ Não entregue — informe o motivo</p>
                <Select value={motivo} onValueChange={setMotivo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NAO_ENTREGA_MOTIVOS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Observação adicional (opcional)"
                  rows={2}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    moveStatus.mutate({
                      deliveries: [delivery],
                      status: "nao_entregue",
                      observacao: obs ? `${motivo} — ${obs}` : motivo,
                    })
                  }
                >
                  Marcar como não entregue
                </Button>
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold">Histórico</p>
          <ol className="space-y-2 border-l pl-4 text-sm">
            {history.length === 0 && <li className="text-muted-foreground">Sem registros.</li>}
            {history.map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                <p className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
                <p className="font-medium">{h.acao}</p>
                <p className="text-xs text-muted-foreground">
                  {h.usuario_nome ?? "—"}
                  {h.status_anterior && h.status_novo && h.status_anterior !== h.status_novo
                    ? ` · ${STATUS_LABEL[h.status_anterior]} → ${STATUS_LABEL[h.status_novo]}`
                    : ""}
                </p>
                {h.observacao && <p className="text-xs">{h.observacao}</p>}
              </li>
            ))}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
