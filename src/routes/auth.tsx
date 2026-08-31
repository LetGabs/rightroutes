import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar | Controle de Entregas da Farmácia" },
      { name: "description", content: "Acesse o sistema interno de controle de entregas de medicamentos manipulados." },
      { property: "og:title", content: "Entrar | Controle de Entregas da Farmácia" },
      { property: "og:description", content: "Acesse o sistema interno de controle de entregas de medicamentos manipulados." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/painel", replace: true });
  }, [loading, user, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setBusy(false);
    if (error) toast.error(error.message);
    else void navigate({ to: "/painel", replace: true });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome }, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Conta criada. Perfil inicial: vendedor.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(180,31,31,0.12),_transparent_35%),linear-gradient(135deg,#fff5f5_0%,#f8fafc_35%,#f4f4f5_100%)] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_20px_50px_rgba(88,12,12,0.08)]">
        <div className="border-b bg-gradient-to-r from-primary/8 via-primary/3 to-transparent px-6 py-5">
          <div className="flex items-center gap-3">
            <img
              src="/roval%20fav.png"
              alt="Roval logo"
              className="h-12 w-12 rounded-xl object-cover shadow-sm ring-1 ring-border bg-white"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Roval</p>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">Sistema de entregas</h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="mb-4 text-sm text-muted-foreground">Acesso interno · Farmácia de manipulação</p>

          <Tabs defaultValue="entrar">
          <TabsList className="w-full rounded-lg bg-muted p-1">
            <TabsTrigger value="entrar" className="flex-1 rounded-md">Entrar</TabsTrigger>
            <TabsTrigger value="criar" className="flex-1 rounded-md">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="entrar">
            <form className="space-y-3 pt-3" onSubmit={signIn}>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>Entrar</Button>
            </form>
          </TabsContent>

          <TabsContent value="criar">
            <form className="space-y-3 pt-3" onSubmit={signUp}>
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email2">E-mail</Label>
                <Input id="email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="senha2">Senha</Label>
                <Input id="senha2" type="password" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>Criar conta</Button>
              <p className="text-xs text-muted-foreground">
                Novas contas entram como <strong>Vendedor</strong>. A logística promove o perfil em Usuários.
              </p>
            </form>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
