import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  PieChart
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Import components
import { InteractiveCharts } from "./InteractiveCharts";
import { CategoryAnalysisCard } from "./CategoryAnalysisCard";
import { PaymentMethodAnalysisCard } from "./PaymentMethodAnalysisCard";
import { BehaviorAnalysisCard } from "./BehaviorAnalysisCard";
import { QuickInsights } from "./QuickInsights";

interface MobileOptimizedTabsProps {
  user: { id: string; email?: string };
  chartData: any;
  currentMonthMovs: any[];
  isLoading?: boolean;
}

export const MobileOptimizedTabs = ({
  user,
  chartData,
  currentMonthMovs,
  isLoading
}: MobileOptimizedTabsProps) => {
  const tabs = [
    { 
      id: 'overview', 
      label: 'Visão Geral', 
      icon: BarChart3
    }
  ];

  // Map currentMonthMovs to the expected transaction format
  const recentTransactions = currentMonthMovs.slice(0, 5).map(mov => ({
    id: mov.id || String(Math.random()),
    description: mov.nome || mov.categoria || 'Transação',
    value: Math.abs(Number(mov.valor) || 0),
    type: (mov.isEntrada ? 'Receita' : 'Despesa') as 'Receita' | 'Despesa',
    category: mov.categoria || 'Outros',
    date: mov.data || new Date().toISOString(),
    source: mov.forma_pagamento
  }));

  return (
    <div className="w-full space-y-4">
      {/* Charts Section - Mobile optimized */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Análise Financeira
        </h3>
        <InteractiveCharts 
          data={chartData}
          isLoading={isLoading}
        />
      </div>
      
      {/* Quick Insights for mobile */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Resumo Rápido
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Transações recentes:</span>
            <span className="font-medium">{recentTransactions.length}</span>
          </div>
          {recentTransactions.slice(0, 3).map((transaction, index) => (
            <div key={transaction.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{transaction.category}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${transaction.type === 'Receita' ? 'text-income' : 'text-expense'}`}>
                  {transaction.type === 'Receita' ? '+' : '-'}{formatCurrency(transaction.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};