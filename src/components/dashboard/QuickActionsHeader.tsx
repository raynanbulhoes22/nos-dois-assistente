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
      <div className="flex items-center gap-3">
        {/* Period Filter - Clean Design */}
        <div className="hidden md:flex items-center bg-muted/30 rounded-lg p-1">
          {periods.map((period) => (
            <Button
              key={period.id}
              variant={selectedPeriod === period.id ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs font-medium"
              onClick={() => setSelectedPeriod(period.id)}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Quick Actions - Minimal Icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleBalance}
            className="gap-2 border-border/50"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline text-xs">
              {showBalance ? "Ocultar" : "Mostrar"}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/50"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Filtros</span>
          </Button>

          <Button
            onClick={() => setShowTransactionForm(true)}
            className="gap-2 h-8 px-4 bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs font-medium">Nova Transação</span>
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