import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, ListTodo, Wallet, BarChart3, Plus, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import * as React from "react";

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const items = [
    { to: "/dashboard", label: "Início", icon: Home },
    { to: "/movimentacoes", label: "Lista", icon: ListTodo },
    { to: "/orcamento", label: "Orçamento", icon: Wallet },
    { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  ];

  const transactionOptions = [
    {
      type: "entrada",
      label: "Entrada",
      description: "Receitas e recebimentos",
      icon: TrendingUp,
      color: "text-green-600 hover:bg-green-50 border-green-200"
    },
    {
      type: "saida", 
      label: "Saída",
      description: "Gastos e despesas",
      icon: TrendingDown,
      color: "text-red-600 hover:bg-red-50 border-red-200"
    },
    {
      type: "transferencia",
      label: "Transferência", 
      description: "Entre contas e investimentos",
      icon: ArrowLeftRight,
      color: "text-blue-600 hover:bg-blue-50 border-blue-200"
    }
  ];

  const handleTransactionSelect = React.useCallback((type: string) => {
    setSheetOpen(false);
    // Navigate to movimentações with state to open form
    navigate("/movimentacoes", { state: { openForm: true, formType: type } });
  }, [navigate]);

  return (
    <div className="sm:hidden">
      {/* Floating primary action with sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
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
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-72 p-4"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="space-y-4 mt-4">
            <h3 className="font-semibold text-base mb-4">
              Novo Registro
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {transactionOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleTransactionSelect(option.type)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2 transition-all hover:scale-[1.02]",
                    option.color
                  )}
                >
                  <option.icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
