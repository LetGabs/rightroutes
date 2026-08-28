import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { fetchRoles } from "@/lib/api";
import { formatDate } from "@/lib/domain";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({
    meta: [
      { title: "Gerenciar usuários | Controle da Farmácia" },
      { name: "description", content: "Defina quem é vendedor e quem é logística/administrador e ative ou desative contas do sistema." },
      { property: "og:title", content: "Gerenciar usuários | Controle da Farmácia" },
      { property: "og:description", content: "Defina perfis de vendedor e logística e ative ou desative contas." },
    ],
  }),
  component: Usuarios,
});

function Usuarios() {
  const { isLogistica, loading, user } = useAuth();
  const { profiles } = useAppData();
  const queryClient = useQueryClient();
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: fetchRoles });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["roles"] });
    void queryClient.invalidateQueries({ queryKey: ["profiles"] });
  };

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "vendedor" | "logistica" }) => {
      const del = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (del.error) throw del.error;
      const ins = await supabase.from("user_roles").insert({ user_id: userId, role } as never);
      if (ins.error) throw ins.error;
    },
    onSuccess: () => {
      refresh();
      toast.success("Perfil atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("profiles").update({ ativo } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!isLogistica) return <Navigate to="/painel" replace />;

  const roleOf = (id: string) =>
    roles.some((r) => r.user_id === id && r.role === "logistica") ? "logistica" : "vendedor";

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted-foreground">Perfis de acesso e situação das contas.</p>
      </header>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>
                  <Select
                    value={roleOf(p.id)}
                    onValueChange={(v) => setRole.mutate({ userId: p.id, role: v as "vendedor" | "logistica" })}
                    disabled={p.id === user?.id}
                  >
                    <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="logistica">Logística / Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={p.ativo}
                      onCheckedChange={(v) => setAtivo.mutate({ id: p.id, ativo: v })}
                      aria-label="Ativo"
                    />
                    <span className="text-sm">{p.ativo ? "Ativo" : "Inativo"}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(p.created_at.slice(0, 10))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
