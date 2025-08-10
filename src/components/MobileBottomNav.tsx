import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, ListTodo, Wallet, BarChart3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import * as React from "react";

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { to: "/dashboard", label: "Início", icon: Home },
    { to: "/movimentacoes", label: "Lista", icon: ListTodo },
    { to: "/orcamento", label: "Orçamento", icon: Wallet },
    { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  ];

  const handlePrimaryAction = React.useCallback(() => {
    navigate("/movimentacoes");
  }, [navigate]);

  return (
    <div className="sm:hidden">
      {/* Floating primary action (sticky CTA) */}
      <Button
        onClick={handlePrimaryAction}
        size="icon"
        aria-label="Nova transação"
        className={cn(
          "fixed bottom-20 right-4 z-50 rounded-full h-12 w-12",
          "shadow-lg hover:shadow-xl transition-shadow",
          "animate-scale-in"
        )}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Bottom navigation bar */}
      <nav
        className={cn(
          "fixed bottom-0 inset-x-0 z-40 border-t border-border",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        )}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
        aria-label="Navegação inferior"
      >
        <ul className="grid grid-cols-4">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center py-2 px-2 text-xs",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    isActive || location.pathname === to
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
                end
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-0.5">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
