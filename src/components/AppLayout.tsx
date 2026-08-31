import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Package, Kanban, ClipboardCheck, Bike, BarChart3, Users, Store, LogOut, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/painel", label: "Dashboard", icon: LayoutDashboard, logisticaOnly: false },
  { to: "/entregas", label: "Entregas", icon: Package, logisticaOnly: false },
  { to: "/kanban", label: "Painel de logística", icon: Kanban, logisticaOnly: true },
  { to: "/conferencia", label: "Conferência", icon: ClipboardCheck, logisticaOnly: true },
  { to: "/motoboys", label: "Motoboys", icon: Bike, logisticaOnly: true },
  { to: "/unidades", label: "Unidades / Lojas", icon: Store, logisticaOnly: true },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3, logisticaOnly: true },
  { to: "/usuarios", label: "Usuários", icon: Users, logisticaOnly: true },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { nome, role, isLogistica } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const items = NAV.filter((i) => !i.logisticaOnly || isLogistica);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-sidebar-border px-5 py-4">
          <p className="text-sm font-semibold tracking-tight">Controle de Entregas</p>
          <p className="text-xs text-sidebar-foreground/60">Farmácia de manipulação</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <p className="px-2 text-sm font-medium">{nome}</p>
          <p className="px-2 pb-2 text-xs text-sidebar-foreground/60">
            {role === "logistica" ? "Logística / Administrador" : "Vendedor"}
          </p>
          <Button variant="secondary" size="sm" className="w-full" onClick={handleSignOut}>
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
      </aside>

      {open && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-semibold">Controle de Entregas</span>
        </header>
        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
