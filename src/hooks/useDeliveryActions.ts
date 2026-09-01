import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { logHistory, updateDeliveries } from "@/lib/api";
import { STATUS_LABEL, type Delivery, type DeliveryStatus, type Motoboy } from "@/lib/domain";

export function useDeliveryActions() {
  const { user, nome, isLogistica } = useAuth();
  const queryClient = useQueryClient();
  const actor = { id: user?.id ?? "", nome };

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    void queryClient.invalidateQueries({ queryKey: ["history"] });
  };

  const moveStatus = useMutation({
    mutationFn: async ({
      deliveries,
      status,
      observacao,
    }: {
      deliveries: Delivery[];
      status: DeliveryStatus;
      observacao?: string;
    }) => {
      const finalStatus = status === "concluido" || status === "nao_entregue";
      if (finalStatus && !isLogistica) {
        throw new Error("Apenas a logística pode fechar esta entrega.");
      }

      const ids = deliveries.map((d) => d.id);
      const patch: Record<string, unknown> = { status };
      if (finalStatus) {
        patch["conferido_em"] = new Date().toISOString();
        patch["conferido_por"] = actor.id;
      }
      if (status === "nao_entregue" && observacao) patch["motivo_nao_entrega"] = observacao;
      await updateDeliveries(ids, patch);
      await logHistory(
        actor,
        deliveries.map((d) => ({
          delivery_id: d.id,
          acao:
            status === "concluido"
              ? "Conferência realizada"
              : status === "nao_entregue"
                ? "Marcada como não entregue"
                : `Movida para ${STATUS_LABEL[status]}`,
          status_anterior: d.status,
          status_novo: status,
          observacao: observacao ?? null,
        })),
      );
    },
    onSuccess: (_d, vars) => {
      refresh();
      toast.success(`${vars.deliveries.length} entrega(s) → ${STATUS_LABEL[vars.status]}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignMotoboy = useMutation({
    mutationFn: async ({ deliveries, motoboy }: { deliveries: Delivery[]; motoboy: Motoboy }) => {
      await updateDeliveries(
        deliveries.map((d) => d.id),
        { motoboy_id: motoboy.id },
      );
      await logHistory(
        actor,
        deliveries.map((d) => ({
          delivery_id: d.id,
          acao: `Motoboy atribuído: ${motoboy.nome}`,
          status_anterior: d.status,
          status_novo: d.status,
        })),
      );
    },
    onSuccess: (_d, vars) => {
      refresh();
      toast.success(`Motoboy ${vars.motoboy.nome} atribuído a ${vars.deliveries.length} entrega(s)`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /** Marca romaneios como impressos no Fórmula Certa. Não gera documento nem muda o status. */
  const confirmPrint = useMutation({
    mutationFn: async ({ deliveries }: { deliveries: Delivery[] }) => {
      const jaConfirmados = deliveries.filter((d) => !!d.impresso_em);
      const pendentes = deliveries.filter((d) => !d.impresso_em);

      if (jaConfirmados.length > 0 && pendentes.length === 0) {
        toast.error("Romaneio já impresso", {
          description: "Este romaneio já foi confirmado como impresso.",
        });
        return;
      }

      if (jaConfirmados.length > 0 && pendentes.length > 0) {
        toast.warning("Alguns romaneios já estavam impressos", {
          description: `${jaConfirmados.length} item(ns) foram ignorados por já estarem confirmados.`,
        });
      }

      if (pendentes.length === 0) return;

      const now = new Date().toISOString();
      await updateDeliveries(
        pendentes.map((d) => d.id),
        { impresso_em: now, impresso_por: actor.id },
      );
      await logHistory(
        actor,
        pendentes.map((d) => ({
          delivery_id: d.id,
          acao: "Impressão do romaneio confirmada (Fórmula Certa)",
          status_anterior: d.status,
          status_novo: d.status,
        })),
      );
    },
    onSuccess: (_d, vars) => {
      const pendentes = vars.deliveries.filter((d) => !d.impresso_em);
      refresh();
      if (pendentes.length > 0) {
        toast.success(`${pendentes.length} romaneio(s) marcados como impressos`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { moveStatus, assignMotoboy, confirmPrint };
}
