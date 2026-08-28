import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { logHistory, updateDeliveries } from "@/lib/api";
import { STATUS_LABEL, type Delivery, type DeliveryStatus, type Motoboy } from "@/lib/domain";

export function useDeliveryActions() {
  const { user, nome } = useAuth();
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
      const ids = deliveries.map((d) => d.id);
      const patch: Record<string, unknown> = { status };
      if (status === "concluido" || status === "nao_entregue") {
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
      const now = new Date().toISOString();
      await updateDeliveries(
        deliveries.map((d) => d.id),
        { impresso_em: now, impresso_por: actor.id },
      );
      await logHistory(
        actor,
        deliveries.map((d) => ({
          delivery_id: d.id,
          acao: "Impressão do romaneio confirmada (Fórmula Certa)",
          status_anterior: d.status,
          status_novo: d.status,
        })),
      );
    },
    onSuccess: (_d, vars) => {
      refresh();
      toast.success(`${vars.deliveries.length} romaneio(s) marcados como impressos`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { moveStatus, assignMotoboy, confirmPrint };
}
