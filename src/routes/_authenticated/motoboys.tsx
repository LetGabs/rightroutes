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

export const Route = createFileRoute("/_authenticated/motoboys")({
  head: () => ({
    meta: [
      { title: "Cadastro de motoboys | Controle da Farmácia" },
      { name: "description", content: "Cadastre e mantenha ativos os motoboys responsáveis pelas entregas da farmácia." },
      { property: "og:title", content: "Cadastro de motoboys | Controle da Farmácia" },
      { property: "og:description", content: "Cadastre e mantenha ativos os motoboys responsáveis pelas entregas." },
    ],
  }),
  component: Motoboys,
});

function Motoboys() {
  const { isLogistica, loading } = useAuth();
  const { motoboys } = useAppData();
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["motoboys"] });

  const criar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("motoboys")
        .insert({ nome: nome.trim(), telefone: telefone.trim() || null } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      refresh();
      setNome("");
      setTelefone("");
      toast.success("Motoboy cadastrado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alternar = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("motoboys").update({ ativo } as never).eq("id", id);
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
        <h1 className="text-2xl font-semibold tracking-tight">Motoboys</h1>
        <p className="text-sm text-muted-foreground">Motoboys não usam o sistema — o cadastro serve para atribuição.</p>
      </header>

      <form
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (nome.trim()) criar.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tel">Telefone</Label>
          <Input id="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>
        <Button type="submit" disabled={criar.isPending}>Cadastrar motoboy</Button>
      </form>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {motoboys.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.nome}</TableCell>
                <TableCell>{m.telefone ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={m.ativo}
                      onCheckedChange={(v) => alternar.mutate({ id: m.id, ativo: v })}
                      aria-label="Ativo"
                    />
                    <span className="text-sm">{m.ativo ? "Ativo" : "Inativo"}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {motoboys.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Nenhum motoboy cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
