import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useCartoes } from '@/hooks/useCartoes';
import { useGastosFixos } from '@/hooks/useGastosFixos';
import { useContasParceladas } from '@/hooks/useContasParceladas';
import { useFontesRenda } from '@/hooks/useFontesRenda';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { supabase } from '@/integrations/supabase/client';
import { calcularSaldoAtualMes } from '@/lib/saldo-utils';
import { startOfMonth, endOfMonth, format, subMonths, parseISO, differenceInDays } from 'date-fns';

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  categories: string[];
  paymentMethods: string[];
  groupBy: 'week' | 'month' | 'quarter';
  includeFixed: boolean;
  includeInstallments: boolean;
  includeCards: boolean;
}

export interface AdvancedKPI {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  monthlyGrowthRate: number;
  expenseVariability: number;
  avgTransactionValue: number;
  financialHealthScore: number;
  transactionCount: number;
  recurrentTransactions: number;
  oneTimeTransactions: number;
}

export interface CategoryAnalysis {
  name: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  avgAmount: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  monthlyEvolution: { month: string; amount: number }[];
}

export interface PaymentMethodAnalysis {
  method: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  avgAmount: number;
  categories: string[];
}

export interface BehavioralInsight {
  spendingByWeekday: { day: string; amount: number; count: number }[];
  topEstablishments: { name: string; amount: number; count: number; avgPerVisit: number }[];
  recurrentVsOneTime: { recurrent: number; oneTime: number };
  peakSpendingHours: { hour: number; amount: number }[];
}

export interface TemporalAnalysis {
  monthlyEvolution: { month: string; income: number; expenses: number; balance: number }[];
  yearOverYear: { period: string; currentYear: number; previousYear: number; growth: number }[];
  seasonalTrends: { season: string; avgAmount: number; pattern: string }[];
}

export interface SmartInsight {
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
  impact?: string;
  confidence: number;
}

export interface ProjectionData {
  nextMonth: { income: number; expenses: number; balance: number };
  next3Months: { income: number; expenses: number; balance: number };
  next6Months: { income: number; expenses: number; balance: number };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

// Nova interface para análise de saldo patrimonial
export interface PatrimonialAnalysis {
  monthlyBalanceEvolution: { month: string; saldoInicial: number; saldoFinal: number; crescimento: number }[];
  totalGrowth: number;
  avgMonthlyGrowth: number;
  bestPerformingMonth: { month: string; growth: number };
  worstPerformingMonth: { month: string; growth: number };
  stabilityIndex: number; // 0-100, quanto maior mais estável
}

// Nova interface para análise de orçamentos
export interface BudgetAnalysis {
  monthlyBudgetVsActual: { 
    month: string; 
    orcado: number; 
    realizado: number; 
    diferenca: number; 
    eficiencia: number; 
  }[];
  overallEfficiency: number; // % de aderência ao orçamento
  categoriesPerformance: { 
    categoria: string; 
    orcado: number; 
    realizado: number; 
    performance: 'excelente' | 'boa' | 'atencao' | 'critica'; 
  }[];
  budgetTrends: { 
    crescimento_orcamento: number; 
    crescimento_gastos: number; 
    tendencia: 'melhorando' | 'estavel' | 'piorando'; 
  };
}

// Nova interface para análise de previsibilidade
export interface PredictabilityAnalysis {
  fixedVsVariable: { fixos: number; variaveis: number; percentualFixos: number };
  recurringIncome: { valor: number; confiabilidade: number };
  monthlyCommitments: { valor: number; percentualRenda: number };
  cashFlowPredictability: number; // 0-100
  upcomingCommitments: { 
    mes: string; 
    gastos_fixos: number; 
    parcelas: number; 
    total: number; 
  }[];
}

export interface AdvancedReportsData {
  filters: ReportFilters;
  setFilters: (filters: Partial<ReportFilters>) => void;
  kpis: AdvancedKPI;
  categoryAnalysis: CategoryAnalysis[];
  paymentMethodAnalysis: PaymentMethodAnalysis[];
  behavioralInsights: BehavioralInsight;
  temporalAnalysis: TemporalAnalysis;
  smartInsights: SmartInsight[];
  projections: ProjectionData;
  patrimonialAnalysis: PatrimonialAnalysis;
  budgetAnalysis: BudgetAnalysis;
  predictabilityAnalysis: PredictabilityAnalysis;
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

const defaultFilters: ReportFilters = {
  startDate: subMonths(new Date(), 6),
  endDate: new Date(),
  categories: [],
  paymentMethods: [],
  groupBy: 'month',
  includeFixed: true,
  includeInstallments: true,
  includeCards: true,
};

export const useAdvancedReportsData = (): AdvancedReportsData => {
  const { user } = useAuth();
  const { movimentacoes, isLoading: movimentacoesLoading } = useMovimentacoes();
  const { cartoes } = useCartoes();
  const { gastosFixos } = useGastosFixos();
  const { contas: contasParceladas } = useContasParceladas();
  const { fontes: fontesRenda } = useFontesRenda();
  const { orcamentos } = useOrcamentos();

  const [filters, setFiltersState] = useState<ReportFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFilters = (newFilters: Partial<ReportFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return movimentacoes.filter(mov => {
      const movDate = parseISO(mov.data);
      const inDateRange = movDate >= filters.startDate && movDate <= filters.endDate;
      const inCategories = filters.categories.length === 0 || filters.categories.includes(mov.categoria);
      const inPaymentMethods = filters.paymentMethods.length === 0 || filters.paymentMethods.includes(mov.forma_pagamento || '');
      
      return inDateRange && inCategories && inPaymentMethods;
    });
  }, [movimentacoes, filters]);

  // Calculate KPIs
  const kpis = useMemo((): AdvancedKPI => {
    const income = filteredTransactions
      .filter(mov => mov.isEntrada)
      .reduce((sum, mov) => sum + mov.valor, 0);

    const expenses = filteredTransactions
      .filter(mov => !mov.isEntrada)
      .reduce((sum, mov) => sum + mov.valor, 0);

    const netBalance = income - expenses;
    const savingsRate = income > 0 ? (netBalance / income) * 100 : 0;

    // Calculate monthly growth rate
    const currentMonth = new Date();
    const previousMonth = subMonths(currentMonth, 1);
    
    const currentMonthTransactions = filteredTransactions.filter(mov => {
      const movDate = parseISO(mov.data);
      return movDate >= startOfMonth(currentMonth) && movDate <= endOfMonth(currentMonth);
    });
    
    const previousMonthTransactions = filteredTransactions.filter(mov => {
      const movDate = parseISO(mov.data);
      return movDate >= startOfMonth(previousMonth) && movDate <= endOfMonth(previousMonth);
    });

    const currentMonthBalance = currentMonthTransactions
      .reduce((sum, mov) => sum + (mov.isEntrada ? mov.valor : -mov.valor), 0);
    
    const previousMonthBalance = previousMonthTransactions
      .reduce((sum, mov) => sum + (mov.isEntrada ? mov.valor : -mov.valor), 0);

    const monthlyGrowthRate = previousMonthBalance !== 0 
      ? ((currentMonthBalance - previousMonthBalance) / Math.abs(previousMonthBalance)) * 100 
      : 0;

    // Calculate expense variability (standard deviation of monthly expenses)
    const monthlyExpenses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const month = subMonths(new Date(), i);
      const monthExpenses = filteredTransactions
        .filter(mov => {
          const movDate = parseISO(mov.data);
          return !mov.isEntrada && 
                 movDate >= startOfMonth(month) && 
                 movDate <= endOfMonth(month);
        })
        .reduce((sum, mov) => sum + mov.valor, 0);
      monthlyExpenses.push(monthExpenses);
    }

    const avgMonthlyExpense = monthlyExpenses.reduce((sum, exp) => sum + exp, 0) / monthlyExpenses.length;
    const variance = monthlyExpenses.reduce((sum, exp) => sum + Math.pow(exp - avgMonthlyExpense, 2), 0) / monthlyExpenses.length;
    const expenseVariability = avgMonthlyExpense > 0 ? (Math.sqrt(variance) / avgMonthlyExpense) * 100 : 0;

    const avgTransactionValue = filteredTransactions.length > 0 
      ? filteredTransactions.reduce((sum, mov) => sum + mov.valor, 0) / filteredTransactions.length 
      : 0;

    // Calculate financial health score (0-100)
    let healthScore = 50; // Base score
    if (savingsRate > 20) healthScore += 30;
    else if (savingsRate > 10) healthScore += 20;
    else if (savingsRate > 0) healthScore += 10;
    else healthScore -= 20;

    if (expenseVariability < 20) healthScore += 10;
    else if (expenseVariability > 50) healthScore -= 10;

    if (monthlyGrowthRate > 0) healthScore += 10;
    else if (monthlyGrowthRate < -10) healthScore -= 10;

    healthScore = Math.max(0, Math.min(100, healthScore));

    const transactionCount = filteredTransactions.length;
    
    // Estimate recurrent vs one-time transactions
    const transactionGroups = filteredTransactions.reduce((groups, mov) => {
      const key = `${mov.categoria}-${Math.round(mov.valor / 10) * 10}`; // Group by category and rounded amount
      if (!groups[key]) groups[key] = [];
      groups[key].push(mov);
      return groups;
    }, {} as Record<string, typeof filteredTransactions>);

    const recurrentTransactions = Object.values(transactionGroups)
      .filter(group => group.length >= 2)
      .reduce((sum, group) => sum + group.length, 0);
    
    const oneTimeTransactions = transactionCount - recurrentTransactions;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance,
      savingsRate,
      monthlyGrowthRate,
      expenseVariability,
      avgTransactionValue,
      financialHealthScore: healthScore,
      transactionCount,
      recurrentTransactions,
      oneTimeTransactions,
    };
  }, [filteredTransactions]);

  // Calculate category analysis
  const categoryAnalysis = useMemo((): CategoryAnalysis[] => {
    const categories = filteredTransactions
      .filter(mov => !mov.isEntrada)
      .reduce((acc, mov) => {
        if (!acc[mov.categoria]) {
          acc[mov.categoria] = {
            amount: 0,
            count: 0,
            transactions: []
          };
        }
        acc[mov.categoria].amount += mov.valor;
        acc[mov.categoria].count += 1;
        acc[mov.categoria].transactions.push(mov);
        return acc;
      }, {} as Record<string, { amount: number; count: number; transactions: typeof filteredTransactions }>);

    const totalAmount = Object.values(categories).reduce((sum, cat) => sum + cat.amount, 0);

    return Object.entries(categories)
      .map(([name, data]) => {
        // Calculate monthly evolution
        const monthlyEvolution = [];
        for (let i = 5; i >= 0; i--) {
          const month = subMonths(new Date(), i);
          const monthAmount = data.transactions
            .filter(mov => {
              const movDate = parseISO(mov.data);
              return movDate >= startOfMonth(month) && movDate <= endOfMonth(month);
            })
            .reduce((sum, mov) => sum + mov.valor, 0);
          
          monthlyEvolution.push({
            month: format(month, 'MMM/yy'),
            amount: monthAmount
          });
        }

        // Calculate trend
        const lastMonth = monthlyEvolution[monthlyEvolution.length - 1]?.amount || 0;
        const previousMonth = monthlyEvolution[monthlyEvolution.length - 2]?.amount || 0;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        let trendPercentage = 0;
        
        if (previousMonth > 0) {
          trendPercentage = ((lastMonth - previousMonth) / previousMonth) * 100;
          if (Math.abs(trendPercentage) > 5) {
            trend = trendPercentage > 0 ? 'up' : 'down';
          }
        }

        return {
          name,
          amount: data.amount,
          percentage: (data.amount / totalAmount) * 100,
          transactionCount: data.count,
          avgAmount: data.amount / data.count,
          trend,
          trendPercentage: Math.abs(trendPercentage),
          monthlyEvolution
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Calculate payment method analysis
  const paymentMethodAnalysis = useMemo((): PaymentMethodAnalysis[] => {
    const methods = filteredTransactions
      .filter(mov => !mov.isEntrada && mov.forma_pagamento)
      .reduce((acc, mov) => {
        const method = mov.forma_pagamento || 'Não informado';
        if (!acc[method]) {
          acc[method] = {
            amount: 0,
            count: 0,
            categories: new Set<string>()
          };
        }
        acc[method].amount += mov.valor;
        acc[method].count += 1;
        acc[method].categories.add(mov.categoria);
        return acc;
      }, {} as Record<string, { amount: number; count: number; categories: Set<string> }>);

    const totalAmount = Object.values(methods).reduce((sum, method) => sum + method.amount, 0);

    return Object.entries(methods)
      .map(([method, data]) => ({
        method,
        amount: data.amount,
        percentage: (data.amount / totalAmount) * 100,
        transactionCount: data.count,
        avgAmount: data.amount / data.count,
        categories: Array.from(data.categories)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Calculate behavioral insights
  const behavioralInsights = useMemo((): BehavioralInsight => {
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const spendingByWeekday = weekdays.map((day, index) => {
      const dayTransactions = filteredTransactions.filter(mov => {
        const movDate = parseISO(mov.data);
        return !mov.isEntrada && movDate.getDay() === index;
      });
      
      return {
        day,
        amount: dayTransactions.reduce((sum, mov) => sum + mov.valor, 0),
        count: dayTransactions.length
      };
    });

    const establishments = filteredTransactions
      .filter(mov => !mov.isEntrada && mov.estabelecimento)
      .reduce((acc, mov) => {
        const est = mov.estabelecimento || 'Não informado';
        if (!acc[est]) {
          acc[est] = { amount: 0, count: 0 };
        }
        acc[est].amount += mov.valor;
        acc[est].count += 1;
        return acc;
      }, {} as Record<string, { amount: number; count: number }>);

    const topEstablishments = Object.entries(establishments)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        avgPerVisit: data.amount / data.count
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    const recurrentVsOneTime = {
      recurrent: kpis.recurrentTransactions,
      oneTime: kpis.oneTimeTransactions
    };

    return {
      spendingByWeekday,
      topEstablishments,
      recurrentVsOneTime,
      peakSpendingHours: [] // Would need time data from transactions
    };
  }, [filteredTransactions, kpis]);

  // Calculate temporal analysis
  const temporalAnalysis = useMemo((): TemporalAnalysis => {
    const monthlyEvolution = [];
    for (let i = 11; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const monthTransactions = filteredTransactions.filter(mov => {
        const movDate = parseISO(mov.data);
        return movDate >= startOfMonth(month) && movDate <= endOfMonth(month);
      });

      const income = monthTransactions
        .filter(mov => mov.isEntrada)
        .reduce((sum, mov) => sum + mov.valor, 0);
      
      const expenses = monthTransactions
        .filter(mov => !mov.isEntrada)
        .reduce((sum, mov) => sum + mov.valor, 0);

      monthlyEvolution.push({
        month: format(month, 'MMM/yy'),
        income,
        expenses,
        balance: income - expenses
      });
    }

    return {
      monthlyEvolution,
      yearOverYear: [], // Would need multiple years of data
      seasonalTrends: [] // Would need seasonal analysis
    };
  }, [filteredTransactions]);

  // Generate smart insights
  const smartInsights = useMemo((): SmartInsight[] => {
    const insights: SmartInsight[] = [];

    // Savings rate insights
    if (kpis.savingsRate < 0) {
      insights.push({
        type: 'critical',
        title: 'Taxa de Economia Negativa',
        description: `Você está gastando mais do que ganha. Seus gastos estão ${Math.abs(kpis.savingsRate).toFixed(1)}% acima da sua renda.`,
        actionable: true,
        action: 'Revise suas despesas e identifique onde cortar gastos',
        impact: 'Alto impacto na estabilidade financeira',
        confidence: 95
      });
    } else if (kpis.savingsRate < 10) {
      insights.push({
        type: 'warning',
        title: 'Taxa de Economia Baixa',
        description: `Sua taxa de economia está em ${kpis.savingsRate.toFixed(1)}%. O ideal é economizar pelo menos 10-20% da renda.`,
        actionable: true,
        action: 'Tente aumentar sua taxa de economia para pelo menos 10%',
        confidence: 85
      });
    } else if (kpis.savingsRate > 20) {
      insights.push({
        type: 'success',
        title: 'Excelente Taxa de Economia',
        description: `Parabéns! Você está economizando ${kpis.savingsRate.toFixed(1)}% da sua renda, acima da média recomendada.`,
        actionable: false,
        confidence: 90
      });
    }

    // Expense variability insights
    if (kpis.expenseVariability > 50) {
      insights.push({
        type: 'warning',
        title: 'Gastos Muito Variáveis',
        description: `Seus gastos têm alta variabilidade (${kpis.expenseVariability.toFixed(1)}%), dificultando o planejamento financeiro.`,
        actionable: true,
        action: 'Tente regularizar seus gastos mensais para melhor controle',
        confidence: 80
      });
    }

    // Category concentration insights
    if (categoryAnalysis.length > 0) {
      const topCategory = categoryAnalysis[0];
      if (topCategory.percentage > 40) {
        insights.push({
          type: 'info',
          title: 'Concentração Alta em Uma Categoria',
          description: `${topCategory.name} representa ${topCategory.percentage.toFixed(1)}% dos seus gastos. Alta concentração pode indicar oportunidade de otimização.`,
          actionable: true,
          action: `Analise se é possível reduzir gastos em ${topCategory.name}`,
          confidence: 75
        });
      }
    }

    // Growth trend insights
    if (kpis.monthlyGrowthRate < -20) {
      insights.push({
        type: 'critical',
        title: 'Declínio Financeiro Acentuado',
        description: `Seu saldo mensal caiu ${Math.abs(kpis.monthlyGrowthRate).toFixed(1)}% em relação ao mês anterior.`,
        actionable: true,
        action: 'Revise urgentemente seus gastos e fontes de renda',
        impact: 'Alto risco financeiro',
        confidence: 90
      });
    } else if (kpis.monthlyGrowthRate > 20) {
      insights.push({
        type: 'success',
        title: 'Crescimento Financeiro Excelente',
        description: `Seu saldo mensal cresceu ${kpis.monthlyGrowthRate.toFixed(1)}% em relação ao mês anterior.`,
        actionable: false,
        confidence: 85
      });
    }

    return insights.sort((a, b) => {
      const priority = { critical: 4, warning: 3, info: 2, success: 1 };
      return priority[b.type] - priority[a.type];
    });
  }, [kpis, categoryAnalysis]);

  // Calculate projections
  const projections = useMemo((): ProjectionData => {
    // Simple projection based on historical averages
    const lastThreeMonths = temporalAnalysis.monthlyEvolution.slice(-3);
    
    const avgIncome = lastThreeMonths.reduce((sum, month) => sum + month.income, 0) / 3;
    const avgExpenses = lastThreeMonths.reduce((sum, month) => sum + month.expenses, 0) / 3;
    const avgBalance = avgIncome - avgExpenses;

    // Add some growth/decline trend
    const trend = kpis.monthlyGrowthRate / 100;

    return {
      nextMonth: {
        income: avgIncome * (1 + trend * 0.3),
        expenses: avgExpenses * (1 + trend * 0.2),
        balance: avgBalance * (1 + trend)
      },
      next3Months: {
        income: avgIncome * 3 * (1 + trend * 0.5),
        expenses: avgExpenses * 3 * (1 + trend * 0.3),
        balance: avgBalance * 3 * (1 + trend * 0.8)
      },
      next6Months: {
        income: avgIncome * 6 * (1 + trend * 0.7),
        expenses: avgExpenses * 6 * (1 + trend * 0.4),
        balance: avgBalance * 6 * (1 + trend)
      },
      scenarios: {
        optimistic: avgBalance * 1.2,
        realistic: avgBalance,
        pessimistic: avgBalance * 0.8
      }
    };
  }, [temporalAnalysis, kpis]);

  // Nova análise patrimonial baseada nos orçamentos mensais
  const patrimonialAnalysis = useMemo((): PatrimonialAnalysis => {
    const monthlyEvolution = [];
    const growthRates = [];
    
    // Ordenar orçamentos por data
    const sortedOrcamentos = [...orcamentos].sort((a, b) => {
      const dateA = new Date(a.ano, a.mes - 1);
      const dateB = new Date(b.ano, b.mes - 1);
      return dateA.getTime() - dateB.getTime();
    });

    for (let i = 0; i < sortedOrcamentos.length; i++) {
      const orcamento = sortedOrcamentos[i];
      const saldoInicial = orcamento.saldo_inicial || 0;
      
      // Calcular saldo final do mês (usando função utilitária)
      const saldoFinal = user ? 0 : 0; // Placeholder - implementaremos o cálculo real
      
      let crescimento = 0;
      if (i > 0) {
        const saldoAnterior = sortedOrcamentos[i - 1].saldo_inicial || 0;
        crescimento = saldoAnterior !== 0 ? ((saldoInicial - saldoAnterior) / Math.abs(saldoAnterior)) * 100 : 0;
        growthRates.push(crescimento);
      }

      monthlyEvolution.push({
        month: `${orcamento.mes.toString().padStart(2, '0')}/${orcamento.ano}`,
        saldoInicial,
        saldoFinal: saldoInicial, // Placeholder
        crescimento
      });
    }

    const totalGrowth = monthlyEvolution.length > 1 ? 
      ((monthlyEvolution[monthlyEvolution.length - 1].saldoInicial - monthlyEvolution[0].saldoInicial) / 
       Math.abs(monthlyEvolution[0].saldoInicial || 1)) * 100 : 0;

    const avgMonthlyGrowth = growthRates.length > 0 ? 
      growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length : 0;

    // Encontrar melhor e pior mês
    const bestPerformingMonth = monthlyEvolution.length > 0 ? 
      monthlyEvolution.reduce((best, current) => 
        current.crescimento > best.crescimento ? current : best, 
        monthlyEvolution[0]
      ) : { month: 'N/A', crescimento: 0 };

    const worstPerformingMonth = monthlyEvolution.length > 0 ?
      monthlyEvolution.reduce((worst, current) => 
        current.crescimento < worst.crescimento ? current : worst, 
        monthlyEvolution[0]
      ) : { month: 'N/A', crescimento: 0 };

    // Calcular índice de estabilidade baseado na variabilidade do crescimento
    const variance = growthRates.length > 0 ? 
      growthRates.reduce((sum, rate) => sum + Math.pow(rate - (avgMonthlyGrowth || 0), 2), 0) / growthRates.length : 0;
    const standardDeviation = Math.sqrt(variance);
    const stabilityIndex = Math.max(0, Math.min(100, 100 - standardDeviation)); // Clamped between 0-100

    return {
      monthlyBalanceEvolution: monthlyEvolution,
      totalGrowth,
      avgMonthlyGrowth,
      bestPerformingMonth: { month: bestPerformingMonth.month, growth: bestPerformingMonth.crescimento },
      worstPerformingMonth: { month: worstPerformingMonth.month, growth: worstPerformingMonth.crescimento },
      stabilityIndex
    };
  }, [orcamentos, user]);

  // Nova análise de orçamentos vs realizado
  const budgetAnalysis = useMemo((): BudgetAnalysis => {
    // Placeholder implementation - requer integração com categorias orçadas
    return {
      monthlyBudgetVsActual: [],
      overallEfficiency: 0,
      categoriesPerformance: [],
      budgetTrends: {
        crescimento_orcamento: 0,
        crescimento_gastos: 0,
        tendencia: 'estavel'
      }
    };
  }, [orcamentos, categoryAnalysis]);

  // Nova análise de previsibilidade
  const predictabilityAnalysis = useMemo((): PredictabilityAnalysis => {
    // Calcular gastos fixos vs variáveis
    const gastosFixosTotal = gastosFixos
      .filter(gasto => gasto.ativo)
      .reduce((sum, gasto) => sum + gasto.valor_mensal, 0);

    const parcelasAtivas = contasParceladas
      .filter(conta => conta.ativa && conta.parcelas_pagas < conta.total_parcelas)
      .reduce((sum, conta) => sum + conta.valor_parcela, 0);

    const gastosVariaveis = kpis.totalExpenses - gastosFixosTotal - parcelasAtivas;
    const percentualFixos = kpis.totalExpenses > 0 ? 
      ((gastosFixosTotal + parcelasAtivas) / kpis.totalExpenses) * 100 : 0;

    // Calcular renda recorrente
    const rendaRecorrente = fontesRenda
      .filter(fonte => fonte.ativa)
      .reduce((sum, fonte) => sum + fonte.valor, 0);

    const confiabilidadeRenda = kpis.totalIncome > 0 ? 
      (rendaRecorrente / kpis.totalIncome) * 100 : 0;

    // Comprometimentos mensais
    const comprometimentosMensais = gastosFixosTotal + parcelasAtivas;
    const percentualRenda = kpis.totalIncome > 0 ? 
      (comprometimentosMensais / kpis.totalIncome) * 100 : 0;

    // Previsibilidade do fluxo de caixa (0-100)
    let cashFlowPredictability = 50; // Base
    if (percentualFixos > 60) cashFlowPredictability += 20; // Mais gastos fixos = mais previsível
    if (confiabilidadeRenda > 80) cashFlowPredictability += 20; // Renda estável
    if (kpis.expenseVariability < 20) cashFlowPredictability += 10; // Baixa variação nos gastos
    cashFlowPredictability = Math.min(100, cashFlowPredictability);

    // Projetar próximos compromissos
    const upcomingCommitments = [];
    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      
      upcomingCommitments.push({
        mes: `${(futureDate.getMonth() + 1).toString().padStart(2, '0')}/${futureDate.getFullYear()}`,
        gastos_fixos: gastosFixosTotal,
        parcelas: parcelasAtivas,
        total: gastosFixosTotal + parcelasAtivas
      });
    }

    return {
      fixedVsVariable: {
        fixos: gastosFixosTotal + parcelasAtivas,
        variaveis: Math.max(0, gastosVariaveis),
        percentualFixos
      },
      recurringIncome: {
        valor: rendaRecorrente,
        confiabilidade: confiabilidadeRenda
      },
      monthlyCommitments: {
        valor: comprometimentosMensais,
        percentualRenda
      },
      cashFlowPredictability,
      upcomingCommitments
    };
  }, [gastosFixos, contasParceladas, fontesRenda, kpis]);

  const refreshData = () => {
    // Trigger data refresh by updating filters
    setFiltersState(prev => ({ ...prev }));
  };

  return {
    filters,
    setFilters,
    kpis,
    categoryAnalysis,
    paymentMethodAnalysis,
    behavioralInsights,
    temporalAnalysis,
    smartInsights,
    projections,
    patrimonialAnalysis,
    budgetAnalysis,
    predictabilityAnalysis,
    isLoading: movimentacoesLoading || isLoading,
    error,
    refreshData
  };
};