import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/unidades")({
  head: () => ({
    meta: [
      { title: "Unidades e lojas | Controle da Farmácia" },
      { name: "description", content: "Cadastre as unidades da farmácia usadas nas transferências de romaneios entre lojas." },
      { property: "og:title", content: "Unidades e lojas | Controle da Farmácia" },
      { property: "og:description", content: "Cadastre unidades usadas nas transferências entre lojas." },
    ],
  }),
  component: Unidades,
});

function Unidades() {
  const { isLogistica, loading } = useAuth();
  const { unidades } = useAppData();
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["unidades"] });

  const criar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("unidades").insert({ nome: nome.trim() } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      refresh();
      setNome("");
      toast.success("Unidade cadastrada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alternar = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("unidades").update({ ativo } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!isLogistica) return <Navigate to="/painel" replace />;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Unidades / Lojas</h1>
        <p className="text-sm text-muted-foreground">
          Unidades usadas nas transferências de romaneios entre lojas.
        </p>
      </header>

      <form
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (nome.trim()) criar.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome da unidade</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <Button type="submit" disabled={criar.isPending}>Cadastrar unidade</Button>
      </form>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unidades.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nome}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={u.ativo}
                      onCheckedChange={(v) => alternar.mutate({ id: u.id, ativo: v })}
                      aria-label="Ativa"
                    />
                    <span className="text-sm">{u.ativo ? "Ativa" : "Inativa"}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {unidades.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  Nenhuma unidade cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
