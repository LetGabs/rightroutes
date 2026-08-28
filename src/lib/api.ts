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

