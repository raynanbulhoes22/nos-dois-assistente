import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  PieChart
} from "lucide-react";

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
    <div className="w-full">
      <InteractiveCharts 
        data={chartData}
        isLoading={isLoading}
      />
    </div>
  );
};