import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sistema de Controle de Entregas | Farmácia de Manipulação" },
      {
        name: "description",
        content:
          "Sistema interno para cadastrar, separar, roteirizar e conferir as entregas de medicamentos manipulados, substituindo a planilha da farmácia.",
      },
      { property: "og:title", content: "Sistema de Controle de Entregas | Farmácia de Manipulação" },
      {
        property: "og:description",
        content: "Cadastro, painel de logística em kanban, conferência de romaneios e relatórios das entregas.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/painel", replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Sistema de Controle de Entregas</h1>
        <p className="mt-3 text-muted-foreground">
          Cadastro pelo vendedor, painel de logística em kanban, impressão de romaneios, conferência em lote e
          histórico completo de cada entrega.
        </p>
        <Button className="mt-6" onClick={() => navigate({ to: "/auth" })}>
          Acessar o sistema
        </Button>
      </div>
    </div>
  );
}
