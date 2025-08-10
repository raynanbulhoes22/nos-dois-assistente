import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

// Hooks for real data
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";

// New improved dashboard components
import { QuickActionsHeader } from "./dashboard/QuickActionsHeader";
import { ConsolidatedKPIs } from "./dashboard/ConsolidatedKPIs";
import { MonthlyComparison } from "./dashboard/MonthlyComparison";
import { SmartInsights } from "./dashboard/SmartInsights";
import { MobileOptimizedTabs } from "./dashboard/MobileOptimizedTabs";
import { AdvancedStatsCards } from "./dashboard/AdvancedStatsCards";
interface User {
  id: string;
  email?: string;
}
export const Dashboard = ({
  user
}: {
  user: User;
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const { toast } = useToast();

  // Real data hooks
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const comparativo = useComparativoFinanceiro(currentMonth, currentYear);
  const {
    movimentacoes,
    isLoading: movimentacoesLoading
  } = useMovimentacoes();
  const isLoading = movimentacoesLoading || comparativo.isLoading;

  // Helper functions for data generation
  const generateMonthlyData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      // Filter movimentacoes for this month
      const monthMovs = movimentacoes.filter(mov => {
        const movDate = new Date(mov.data);
        return movDate.getMonth() === date.getMonth() && movDate.getFullYear() === date.getFullYear();
      });
      
      const entradas = monthMovs.filter(mov => mov.isEntrada).reduce((sum, mov) => sum + mov.valor, 0);
      const saidas = monthMovs.filter(mov => !mov.isEntrada).reduce((sum, mov) => sum + mov.valor, 0);
      
      months.push({
        month: monthStr,
        entradas,
        saidas,
        saldo: entradas - saidas
      });
    }
    
    return months;
  };

  const generateProjectionData = () => {
    const months = [];
    const now = new Date();
    const avgIncome = comparativo.comparativo?.rendaRealizada || 0;
    const avgExpenses = comparativo.comparativo?.gastosRealizados || 0;
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      months.push({
        month: monthStr,
        entradas: avgIncome * 0.95, // 5% de variação
        saidas: avgExpenses * 1.05, // 5% de aumento
        saldo: (avgIncome * 0.95) - (avgExpenses * 1.05),
        isProjection: true
      });
    }
    
    return months;
  };

  // Memoized calculations to prevent re-renders
  const financialData = useMemo(() => {
    const income = comparativo.comparativo?.rendaRealizada || 0;
    const expenses = comparativo.comparativo?.gastosRealizados || 0;
    const balance = income - expenses;
    const currentMonthMovs = movimentacoes.filter(mov => {
      const movDate = new Date(mov.data);
      return movDate.getMonth() + 1 === currentMonth && movDate.getFullYear() === currentYear;
    });

    // Top categories
    const categoryTotals: {
      [key: string]: number;
    } = {};
    currentMonthMovs.filter(mov => !mov.isEntrada).forEach(mov => {
      const category = mov.categoria || 'Sem categoria';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(mov.valor);
    });
    const topCategories = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 6);

    // Advanced chart data
    const chartData = {
      categoryData: topCategories,
      monthlyData: generateMonthlyData(),
      projectionData: generateProjectionData(),
      comparativeData: []
    };

    return {
      income,
      expenses,
      balance,
      currentMonthMovs,
      topCategories,
      transactionCount: currentMonthMovs.length,
      monthlyTrend: balance >= 0 ? 'positive' : 'negative' as 'positive' | 'negative',
      chartData,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      budgetUsage: expenses > 0 ? (expenses / (income || 1)) * 100 : 0
    };
  }, [comparativo.comparativo, movimentacoes, currentMonth, currentYear]);

  const handleRefresh = () => {
    toast({
      title: "Dados atualizados!",
      description: "Dashboard atualizado com sucesso"
    });
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-muted"></div>
          <div className="page-content space-y-6">
            <div className="h-40 bg-muted rounded-lg"></div>
            <div className="metric-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="section-grid">
              <div className="h-80 bg-muted rounded-lg"></div>
              <div className="h-80 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Quick Actions Header */}
      <QuickActionsHeader 
        user={user}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
        onRefresh={handleRefresh}
      />

      <div className="page-content space-y-6">
        {/* Consolidated KPIs */}
        <ConsolidatedKPIs
          totalIncome={financialData.income}
          totalExpenses={financialData.expenses}
          balance={financialData.balance}
          savingsRate={financialData.savingsRate}
          budgetUsage={financialData.budgetUsage}
          monthlyTrend={financialData.monthlyTrend}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
          isLoading={isLoading}
        />

        {/* Main Dashboard Grid */}
        <div className="section-grid">
          {/* Monthly Comparison */}
          <MonthlyComparison />
          
          {/* Smart Insights */}
          <SmartInsights />
        </div>

        {/* Advanced Statistics */}
        <AdvancedStatsCards />

        {/* Mobile-Optimized Tabs */}
        <MobileOptimizedTabs
          user={user}
          chartData={financialData.chartData}
          currentMonthMovs={financialData.currentMonthMovs}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};