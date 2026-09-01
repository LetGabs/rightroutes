export type DeliveryStatus =
  | "aguardando_logistica"
  | "impressao_romaneios"
  | "pronto_saida"
  | "em_rota"
  | "aguardando_conferencia"
  | "concluido"
  | "nao_entregue"
  | "cancelado";

export type DeliveryPeriod = "manha" | "tarde_noite";

export type DeliveryType = "domicilio" | "transferencia";

export const TIPO_LABEL: Record<DeliveryType, string> = {
  domicilio: "Entrega a domicílio",
  transferencia: "Transferência entre lojas",
};

export const TIPO_SHORT: Record<DeliveryType, string> = {
  domicilio: "Domicílio",
  transferencia: "Transferência",
};

export const TIPO_CLASS: Record<DeliveryType, string> = {
  domicilio: "bg-muted text-muted-foreground border-border",
  transferencia: "bg-primary/15 text-primary border-primary/40",
};

export const STATUS_ORDER: DeliveryStatus[] = [
  "aguardando_logistica",
  "impressao_romaneios",
  "pronto_saida",
  "em_rota",
  "aguardando_conferencia",
  "concluido",
  "nao_entregue",
];

export const ALL_STATUSES: DeliveryStatus[] = [...STATUS_ORDER, "cancelado"];

export const KANBAN_STATUSES: DeliveryStatus[] = ALL_STATUSES.filter(
  (status) => status !== "concluido" && status !== "nao_entregue",
);

export const STATUS_LABEL: Record<DeliveryStatus, string> = {
  aguardando_logistica: "Aguardando logística",
  impressao_romaneios: "Impressão de romaneios",
  pronto_saida: "Pronto para saída",
  em_rota: "Em rota",
  aguardando_conferencia: "Aguardando conferência",
  concluido: "Concluído",
  nao_entregue: "Não entregue",
  cancelado: "Cancelado",
};

export const STATUS_CLASS: Record<DeliveryStatus, string> = {
  aguardando_logistica: "bg-muted text-muted-foreground border-border",
  impressao_romaneios: "bg-chart-3/15 text-chart-3 border-chart-3/40",
  pronto_saida: "bg-chart-5/15 text-chart-5 border-chart-5/40",
  em_rota: "bg-amber-100 text-amber-700 border-amber-300",
  aguardando_conferencia: "bg-accent text-accent-foreground border-accent-foreground/30",
  concluido: "bg-chart-2/15 text-chart-2 border-chart-2/40",
  nao_entregue: "bg-red-100 text-red-700 border-red-300",
  cancelado: "bg-muted text-muted-foreground border-border line-through",
};

// Cores de destaque das colunas do Kanban (borda superior + fundo do cabeçalho)
export const STATUS_COLUMN_CLASS: Record<DeliveryStatus, string> = {
  aguardando_logistica: "border-t-muted-foreground/50 bg-muted/60",
  impressao_romaneios: "border-t-chart-3 bg-chart-3/10",
  pronto_saida: "border-t-chart-5 bg-chart-5/10",
  em_rota: "border-t-amber-400 bg-amber-50",
  aguardando_conferencia: "border-t-accent-foreground/40 bg-accent/60",
  concluido: "border-t-chart-2 bg-chart-2/10",
  nao_entregue: "border-t-red-500 bg-red-50",
  cancelado: "border-t-muted-foreground/50 bg-muted/60",
};

export const PERIOD_LABEL: Record<DeliveryPeriod, string> = {
  manha: "Manhã",
  tarde_noite: "Tarde/Noite",
};

export const PERIOD_WINDOW: Record<DeliveryPeriod, string> = {
  manha: "10:00 às 13:00",
  tarde_noite: "15:00 às 19:00",
};

export const PERIOD_END_HOUR: Record<DeliveryPeriod, number> = {
  manha: 13,
  tarde_noite: 19,
};

export const NAO_ENTREGA_MOTIVOS = [
  "Cliente ausente",
  "Cliente recusou",
  "Endereço não localizado",
  "Problema com o pedido",
  "Problema com o transporte",
  "Outro",
];

export type Delivery = {
  id: string;
  numero_pedido: string;
  numero_romaneio: string;
  cliente: string;
  tipo_entrega: DeliveryType;
  unidade_origem_id: string | null;
  unidade_destino_id: string | null;
  numero_formulas: number;
  tem_revenda: boolean;
  quantidade_revenda: number | null;
  data_prevista: string;
  periodo: DeliveryPeriod;
  status: DeliveryStatus;
  vendedor_id: string;
  motoboy_id: string | null;
  observacoes: string | null;
  motivo_nao_entrega: string | null;
  conferido_em: string | null;
  conferido_por: string | null;
  impresso_em: string | null;
  impresso_por: string | null;
  created_at: string;
  updated_at: string;
};

export type Motoboy = {
  id: string;
  nome: string;
  telefone: string | null;
  ativo: boolean;
};

export type Profile = { id: string; nome: string; email: string; ativo: boolean; created_at: string };

export type Unidade = { id: string; nome: string; ativo: boolean };

export type HistoryEntry = {
  id: string;
  delivery_id: string;
  usuario_nome: string | null;
  acao: string;
  status_anterior: DeliveryStatus | null;
  status_novo: DeliveryStatus | null;
  observacao: string | null;
  created_at: string;
};

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Janela de entrega encerrada e entrega ainda não finalizada. Nunca altera o status. */
export function prazoEncerrado(d: Pick<Delivery, "data_prevista" | "periodo" | "status">): boolean {
  if (["concluido", "nao_entregue", "cancelado"].includes(d.status)) return false;
  const [y, m, day] = d.data_prevista.slice(0, 10).split("-").map(Number);
  const end = new Date(y!, (m ?? 1) - 1, day, PERIOD_END_HOUR[d.periodo], 0, 0);
  return new Date() > end;
}
