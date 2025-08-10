import { useMemo } from "react";
import { useMovimentacoes } from "./useMovimentacoes";

export interface AdvancedFinancialStats {
  // Estatísticas Temporais
  monthlyComparison: {
    currentMonth: {
      income: number;
      expenses: number;
      balance: number;
      transactionCount: number;
    };
    previousMonth: {
      income: number;
      expenses: number;
      balance: number;
      transactionCount: number;
    };
    growth: {
      income: number;
      expenses: number;
      balance: number;
      transactions: number;
    };
  };

  // Análises por Categoria
  categoryAnalysis: {
    name: string;
    totalAmount: number;
    averageAmount: number;
    transactionCount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    monthlyEvolution: { month: string; amount: number }[];
  }[];

  // Análises por Forma de Pagamento
  paymentMethodAnalysis: {
    method: string;
    totalAmount: number;
    averageAmount: number;
    transactionCount: number;
    percentage: number;
    categories: string[];
  }[];

  // Estatísticas de Comportamento
  behaviorAnalysis: {
    dayOfWeekDistribution: { day: string; amount: number; count: number }[];
    topEstablishments: { name: string; amount: number; count: number }[];
    recurrentVsOneTime: {
      recurrent: { amount: number; count: number };
      oneTime: { amount: number; count: number };
    };
  };

  // Métricas de Performance
  performanceMetrics: {
    monthlyGrowthRate: number;
    expenseVariability: number;
    averageTransactionValue: number;
    financialHealthScore: number;
  };

  // Alertas e Insights
  insights: {
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action?: string;
  }[];

  // Dados para Visualizações
  chartData: {
    weeklyTrend: { week: string; income: number; expenses: number }[];
    categoryHeatmap: { category: string; day: string; amount: number }[];
    paymentMethodPie: { name: string; value: number; color: string }[];
    expenseDistribution: { range: string; count: number }[];
  };
}

export const useAdvancedFinancialStats = (): AdvancedFinancialStats => {
  const { movimentacoes } = useMovimentacoes();

  return useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrar transações por período
    const currentMonthTxns = movimentacoes.filter(mov => {
      const date = new Date(mov.data);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const previousMonthTxns = movimentacoes.filter(mov => {
      const date = new Date(mov.data);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    // Estatísticas Temporais
    const currentIncome = currentMonthTxns.filter(t => t.isEntrada).reduce((sum, t) => sum + t.valor, 0);
    const currentExpenses = currentMonthTxns.filter(t => !t.isEntrada).reduce((sum, t) => sum + t.valor, 0);
    const previousIncome = previousMonthTxns.filter(t => t.isEntrada).reduce((sum, t) => sum + t.valor, 0);
    const previousExpenses = previousMonthTxns.filter(t => !t.isEntrada).reduce((sum, t) => sum + t.valor, 0);

    const monthlyComparison = {
      currentMonth: {
        income: currentIncome,
        expenses: currentExpenses,
        balance: currentIncome - currentExpenses,
        transactionCount: currentMonthTxns.length,
      },
      previousMonth: {
        income: previousIncome,
        expenses: previousExpenses,
        balance: previousIncome - previousExpenses,
        transactionCount: previousMonthTxns.length,
      },
      growth: {
        income: previousIncome ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0,
        expenses: previousExpenses ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0,
        balance: (previousIncome - previousExpenses) ? (((currentIncome - currentExpenses) - (previousIncome - previousExpenses)) / (previousIncome - previousExpenses)) * 100 : 0,
        transactions: previousMonthTxns.length ? ((currentMonthTxns.length - previousMonthTxns.length) / previousMonthTxns.length) * 100 : 0,
      },
    };

    // Análises por Categoria
    const categoryData: { [key: string]: { amount: number; count: number; months: { [key: string]: number } } } = {};
    
    movimentacoes.forEach(mov => {
      if (mov.isEntrada) return;
      const category = mov.categoria || 'Sem categoria';
      const date = new Date(mov.data);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!categoryData[category]) {
        categoryData[category] = { amount: 0, count: 0, months: {} };
      }
      
      categoryData[category].amount += mov.valor;
      categoryData[category].count += 1;
      categoryData[category].months[monthKey] = (categoryData[category].months[monthKey] || 0) + mov.valor;
    });

    const totalExpenses = Object.values(categoryData).reduce((sum, cat) => sum + cat.amount, 0);
    
    const categoryAnalysis = Object.entries(categoryData).map(([name, data]) => {
      const months = Object.entries(data.months).sort().slice(-6);
      const trend = months.length >= 2 ? 
        (months[months.length - 1][1] > months[months.length - 2][1] ? 'up' : 
         months[months.length - 1][1] < months[months.length - 2][1] ? 'down' : 'stable') : 'stable';

      return {
        name,
        totalAmount: data.amount,
        averageAmount: data.amount / data.count,
        transactionCount: data.count,
        percentage: (data.amount / totalExpenses) * 100,
        trend: trend as 'up' | 'down' | 'stable',
        monthlyEvolution: months.map(([month, amount]) => ({ month, amount })),
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);

    // Análises por Forma de Pagamento
    const paymentData: { [key: string]: { amount: number; count: number; categories: Set<string> } } = {};
    
    movimentacoes.forEach(mov => {
      if (mov.isEntrada) return;
      const method = mov.forma_pagamento || 'Não informado';
      
      if (!paymentData[method]) {
        paymentData[method] = { amount: 0, count: 0, categories: new Set() };
      }
      
      paymentData[method].amount += mov.valor;
      paymentData[method].count += 1;
      if (mov.categoria) paymentData[method].categories.add(mov.categoria);
    });

    const paymentMethodAnalysis = Object.entries(paymentData).map(([method, data]) => ({
      method,
      totalAmount: data.amount,
      averageAmount: data.amount / data.count,
      transactionCount: data.count,
      percentage: (data.amount / totalExpenses) * 100,
      categories: Array.from(data.categories),
    })).sort((a, b) => b.totalAmount - a.totalAmount);

    // Estatísticas de Comportamento
    const dayData: { [key: string]: { amount: number; count: number } } = {};
    const establishmentData: { [key: string]: { amount: number; count: number } } = {};
    
    movimentacoes.forEach(mov => {
      if (mov.isEntrada) return;
      
      const dayOfWeek = new Date(mov.data).toLocaleDateString('pt-BR', { weekday: 'long' });
      if (!dayData[dayOfWeek]) dayData[dayOfWeek] = { amount: 0, count: 0 };
      dayData[dayOfWeek].amount += mov.valor;
      dayData[dayOfWeek].count += 1;

      const establishment = mov.estabelecimento || 'Não informado';
      if (!establishmentData[establishment]) establishmentData[establishment] = { amount: 0, count: 0 };
      establishmentData[establishment].amount += mov.valor;
      establishmentData[establishment].count += 1;
    });

    const behaviorAnalysis = {
      dayOfWeekDistribution: Object.entries(dayData).map(([day, data]) => ({
        day,
        amount: data.amount,
        count: data.count,
      })),
      topEstablishments: Object.entries(establishmentData)
        .sort(([,a], [,b]) => b.amount - a.amount)
        .slice(0, 10)
        .map(([name, data]) => ({
          name,
          amount: data.amount,
          count: data.count,
        })),
      recurrentVsOneTime: {
        recurrent: { amount: 0, count: 0 },
        oneTime: { amount: 0, count: 0 },
      },
    };

    // Métricas de Performance
    const performanceMetrics = {
      monthlyGrowthRate: monthlyComparison.growth.income,
      expenseVariability: 0, // Calcular desvio padrão dos gastos mensais
      averageTransactionValue: totalExpenses / movimentacoes.filter(m => !m.isEntrada).length || 0,
      financialHealthScore: Math.max(0, Math.min(100, 
        (monthlyComparison.currentMonth.income - monthlyComparison.currentMonth.expenses) / 
        (monthlyComparison.currentMonth.income || 1) * 100
      )),
    };

    // Insights e Alertas
    const insights = [];
    
    if (monthlyComparison.growth.expenses > 20) {
      insights.push({
        type: 'warning' as const,
        title: 'Gastos em Alta',
        description: `Seus gastos aumentaram ${monthlyComparison.growth.expenses.toFixed(1)}% em relação ao mês anterior`,
        action: 'Revisar orçamento',
      });
    }

    if (performanceMetrics.financialHealthScore > 80) {
      insights.push({
        type: 'success' as const,
        title: 'Ótima Saúde Financeira',
        description: `Score de ${performanceMetrics.financialHealthScore.toFixed(0)}% - Continue assim!`,
      });
    }

    // Dados para Visualizações
    const chartData = {
      weeklyTrend: [], // Implementar trend semanal
      categoryHeatmap: [], // Implementar heatmap categoria x dia
      paymentMethodPie: paymentMethodAnalysis.slice(0, 6).map((item, index) => ({
        name: item.method,
        value: item.totalAmount,
        color: `hsl(${index * 60}, 70%, 50%)`,
      })),
      expenseDistribution: [], // Implementar distribuição de valores
    };

    return {
      monthlyComparison,
      categoryAnalysis,
      paymentMethodAnalysis,
      behaviorAnalysis,
      performanceMetrics,
      insights,
      chartData,
    };
  }, [movimentacoes]);
};