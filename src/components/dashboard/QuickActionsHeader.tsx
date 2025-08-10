import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Filter, 
  Download, 
  Calendar,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff 
} from "lucide-react";
import { TransactionForm } from "../TransactionForm";

interface QuickActionsHeaderProps {
  user: { id: string; email?: string };
  showBalance: boolean;
  onToggleBalance: () => void;
  onRefresh?: () => void;
}

export const QuickActionsHeader = ({ 
  user, 
  showBalance, 
  onToggleBalance,
  onRefresh 
}: QuickActionsHeaderProps) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const periods = [
    { id: "week", label: "7 dias" },
    { id: "month", label: "Este mês" },
    { id: "quarter", label: "Trimestre" },
    { id: "year", label: "Ano" }
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            Tempo real
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <div className="flex items-center border rounded-lg p-1 bg-muted/30">
            {periods.map((period) => (
              <Button
                key={period.id}
                variant={selectedPeriod === period.id ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setSelectedPeriod(period.id)}
              >
                {period.label}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleBalance}
            className="gap-2"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {showBalance ? "Ocultar" : "Mostrar"}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>

          <Button
            onClick={() => setShowTransactionForm(true)}
            className="gap-2 button-gradient"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          open={showTransactionForm}
          onOpenChange={setShowTransactionForm}
          onSuccess={() => {
            setShowTransactionForm(false);
            onRefresh?.();
          }}
          userId={user.id}
        />
      )}
    </>
  );
};