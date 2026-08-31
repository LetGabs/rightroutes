import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logHistory } from "@/lib/api";
import { PERIOD_LABEL, PERIOD_WINDOW, TIPO_LABEL, todayISO, type DeliveryPeriod, type DeliveryType } from "@/lib/domain";
import { Plus } from "lucide-react";

export function NewDeliveryDialog() {
  const { user, nome } = useAuth();
  const { unidades } = useAppData();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pedido, setPedido] = useState("");
  const [romaneio, setRomaneio] = useState("");
  const [cliente, setCliente] = useState("");
  const [data, setData] = useState(todayISO());
  const [periodo, setPeriodo] = useState<DeliveryPeriod>("manha");
  const [tipo, setTipo] = useState<DeliveryType>("domicilio");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [formulas, setFormulas] = useState("1");
  const [temRevenda, setTemRevenda] = useState<"sim" | "nao">("nao");
  const [qtdRevenda, setQtdRevenda] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const unidadesAtivas = unidades.filter((u) => u.ativo);

  const reset = () => {
    setPedido("");
    setRomaneio("");
    setCliente("");
    setData(todayISO());
    setPeriodo("manha");
    setTipo("domicilio");
    setOrigem("");
    setDestino("");
    setFormulas("1");
    setTemRevenda("nao");
    setQtdRevenda("");
    setObservacoes("");
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sessão expirada.");
      const isTransfer = tipo === "transferencia";
      const { data: created, error } = await supabase
        .from("deliveries")
        .insert({
          numero_pedido: pedido.trim(),
          numero_romaneio: romaneio.trim(),
          cliente: cliente.trim(),
          data_prevista: data,
          periodo,
          observacoes: observacoes.trim() || null,
          vendedor_id: user.id,
          tipo_entrega: tipo,
          unidade_origem_id: isTransfer ? origem : null,
          unidade_destino_id: isTransfer ? destino : null,
          numero_formulas: Math.max(1, parseInt(formulas, 10) || 1),
          tem_revenda: temRevenda === "sim",
          quantidade_revenda: temRevenda === "sim" ? parseInt(qtdRevenda, 10) || 0 : null,
        } as never)
        .select("id")
        .single();
      if (error) throw error;
      await logHistory({ id: user.id, nome }, [
        {
          delivery_id: (created as { id: string }).id,
          acao: `Entrega cadastrada (${TIPO_LABEL[tipo]})`,
          status_novo: "aguardando_logistica",
        },
      ]);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Entrega cadastrada e enviada para a logística.");
      reset();
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const valid =
    pedido.trim() &&
    romaneio.trim() &&
    cliente.trim() &&
    data &&
    parseInt(formulas, 10) >= 1 &&
    (tipo === "domicilio" || (origem && destino && origem !== destino)) &&
    (temRevenda === "nao" || parseInt(qtdRevenda, 10) >= 1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="size-4" /> Nova Entrega</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova entrega</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) create.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label>Tipo de entrega *</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as DeliveryType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="domicilio">Entrega a domicílio</SelectItem>
                <SelectItem value="transferencia">Transferência entre lojas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="romaneio">Nº do romaneio *</Label>
              <Input id="romaneio" value={romaneio} onChange={(e) => setRomaneio(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pedido">Nº do pedido *</Label>
              <Input id="pedido" value={pedido} onChange={(e) => setPedido(e.target.value)} required />
            </div>
          </div>

          {tipo === "transferencia" && (
            <div className="grid gap-3 rounded-md border border-primary/30 bg-primary/5 p-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Unidade de origem *</Label>
                <Select value={origem} onValueChange={setOrigem}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {unidadesAtivas.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Unidade de destino *</Label>
                <Select value={destino} onValueChange={setDestino}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {unidadesAtivas.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {origem && destino && origem === destino && (
                <p className="text-xs text-destructive sm:col-span-2">Origem e destino devem ser unidades diferentes.</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cliente">Nome do cliente *</Label>
            <Input id="cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} required />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="data">Data prevista *</Label>
              <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Período da entrega *</Label>
              <Select value={periodo} onValueChange={(v) => setPeriodo(v as DeliveryPeriod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã — 10:00 às 13:00</SelectItem>
                  <SelectItem value="tarde_noite">Tarde/Noite — 15:00 às 19:00</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Janela informada ao cliente: {PERIOD_LABEL[periodo]} — {PERIOD_WINDOW[periodo]}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="formulas">Nº de fórmulas *</Label>
              <Input
                id="formulas"
                type="number"
                min={1}
                value={formulas}
                onChange={(e) => setFormulas(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tem revenda? *</Label>
              <Select value={temRevenda} onValueChange={(v) => setTemRevenda(v as "sim" | "nao")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao">Não</SelectItem>
                  <SelectItem value="sim">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {temRevenda === "sim" && (
            <div className="space-y-1.5">
              <Label htmlFor="qtdRevenda">Quantidade de revenda *</Label>
              <Input
                id="qtdRevenda"
                type="number"
                min={1}
                value={qtdRevenda}
                onChange={(e) => setQtdRevenda(e.target.value)}
                required
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Fórmulas e revenda são apenas contagens de volume do romaneio — não identificam medicamentos ou produtos.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="obs">Observações</Label>
            <Textarea id="obs" rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={!valid || create.isPending}>
            {create.isPending ? "Salvando..." : "Cadastrar entrega"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
