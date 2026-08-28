import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logHistory } from "@/lib/api";
import { PERIOD_LABEL, PERIOD_WINDOW, todayISO, type DeliveryPeriod } from "@/lib/domain";
import { Plus } from "lucide-react";

export function NewDeliveryDialog() {
  const { user, nome } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pedido, setPedido] = useState("");
  const [romaneio, setRomaneio] = useState("");
  const [cliente, setCliente] = useState("");
  const [data, setData] = useState(todayISO());
  const [periodo, setPeriodo] = useState<DeliveryPeriod>("manha");
  const [observacoes, setObservacoes] = useState("");

  const reset = () => {
    setPedido("");
    setRomaneio("");
    setCliente("");
    setData(todayISO());
    setPeriodo("manha");
    setObservacoes("");
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sessão expirada.");
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
        } as never)
        .select("id")
        .single();
      if (error) throw error;
      await logHistory({ id: user.id, nome }, [
        {
          delivery_id: (created as { id: string }).id,
          acao: "Entrega cadastrada",
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

  const valid = pedido.trim() && romaneio.trim() && cliente.trim() && data;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="size-4" /> Nova Entrega</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
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
