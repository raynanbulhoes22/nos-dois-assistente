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
    },
    { 
      id: 'analyses', 
      label: 'Análises Detalhadas', 
      icon: PieChart 
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
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm px-4 py-3 rounded-lg transition-colors font-medium"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <InteractiveCharts 
            data={chartData}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="analyses" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <CategoryAnalysisCard />
            <PaymentMethodAnalysisCard />
            <BehaviorAnalysisCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};