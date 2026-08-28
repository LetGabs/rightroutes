import { supabase } from "@/integrations/supabase/client";
import type { Delivery, DeliveryStatus, HistoryEntry, Motoboy, Profile } from "./domain";
import { PERIOD_WINDOW, STATUS_LABEL, formatDate } from "./domain";

export type HistoryInput = {
  delivery_id: string;
  acao: string;
  status_anterior?: DeliveryStatus | null;
  status_novo?: DeliveryStatus | null;
  observacao?: string | null;
};

export async function fetchDeliveries(): Promise<Delivery[]> {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .order("data_prevista", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Delivery[];
}

export async function fetchMotoboys(): Promise<Motoboy[]> {
  const { data, error } = await supabase.from("motoboys").select("*").order("nome");
  if (error) throw error;
  return (data ?? []) as unknown as Motoboy[];
}

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("nome");
  if (error) throw error;
  return (data ?? []) as unknown as Profile[];
}

export async function fetchRoles(): Promise<{ user_id: string; role: string }[]> {
  const { data, error } = await supabase.from("user_roles").select("user_id, role");
  if (error) throw error;
  return (data ?? []) as { user_id: string; role: string }[];
}

export async function fetchHistory(deliveryId: string): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from("delivery_history")
    .select("*")
    .eq("delivery_id", deliveryId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as HistoryEntry[];
}

export async function logHistory(
  user: { id: string; nome: string },
  entries: HistoryInput[],
): Promise<void> {
  if (entries.length === 0) return;
  const rows = entries.map((e) => ({
    delivery_id: e.delivery_id,
    usuario_id: user.id,
    usuario_nome: user.nome,
    acao: e.acao,
    status_anterior: e.status_anterior ?? null,
    status_novo: e.status_novo ?? null,
    observacao: e.observacao ?? null,
  }));
  const { error } = await supabase.from("delivery_history").insert(rows as never);
  if (error) throw error;
}

export async function updateDeliveries(ids: string[], patch: Record<string, unknown>): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from("deliveries").update(patch as never).in("id", ids);
  if (error) throw error;
}

export function printRomaneios(deliveries: Delivery[], motoboys: Motoboy[]): void {
  const nomeMotoboy = (id: string | null) => motoboys.find((m) => m.id === id)?.nome ?? "—";
  const blocks = deliveries
    .map(
      (d) => `
      <section>
        <h1>Romaneio ${escapeHtml(d.numero_romaneio)}</h1>
        <table>
          <tr><td>Pedido</td><td>${escapeHtml(d.numero_pedido)}</td></tr>
          <tr><td>Cliente</td><td>${escapeHtml(d.cliente)}</td></tr>
          <tr><td>Data prevista</td><td>${formatDate(d.data_prevista)}</td></tr>
          <tr><td>Período</td><td>${PERIOD_WINDOW[d.periodo]}</td></tr>
          <tr><td>Motoboy</td><td>${escapeHtml(nomeMotoboy(d.motoboy_id))}</td></tr>
          <tr><td>Status</td><td>${STATUS_LABEL[d.status]}</td></tr>
          <tr><td>Observações</td><td>${escapeHtml(d.observacoes ?? "—")}</td></tr>
        </table>
        <p class="assinatura">Recebido por: ______________________________  Data: ____ / ____ / ______</p>
      </section>`,
    )
    .join("");

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Romaneios</title>
    <style>
      body{font-family:system-ui,sans-serif;margin:24px;color:#111}
      section{page-break-after:always;border:1px solid #ccc;padding:16px;margin-bottom:16px;border-radius:8px}
      h1{font-size:18px;margin:0 0 12px}
      table{width:100%;border-collapse:collapse;font-size:14px}
      td{padding:6px 4px;border-bottom:1px solid #eee}
      td:first-child{width:160px;color:#555}
      .assinatura{margin-top:24px;font-size:13px;color:#333}
    </style></head><body>${blocks}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}
