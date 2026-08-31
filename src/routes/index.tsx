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
    if (!loading) {
      void navigate({ to: "/auth", replace: true });
    }
  }, [loading, navigate]);

  return null;
}
