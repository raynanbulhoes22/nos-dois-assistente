import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, BarChart3, Target, Activity, Zap, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionForm } from "./TransactionForm";

// Dashboard Components
import { FinancialKPIs } from "@/components/dashboard/FinancialKPIs";
import { InteractiveCharts } from "@/components/dashboard/InteractiveCharts";
import { QuickInsights } from "@/components/dashboard/QuickInsights";

// Hooks for real data
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useFinancialStats } from "@/hooks/useFinancialStats";
import { useContasParceladas } from "@/hooks/useContasParceladas";

interface User {
  id: string;
  email?: string;
}

export const Dashboard = ({ user }: { user: User }) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const { toast } = useToast();

  // Real data hooks
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const comparativo = useComparativoFinanceiro(currentMonth, currentYear);
  const { movimentacoes, isLoading: movimentacoesLoading } = useMovimentacoes();
  const stats = useFinancialStats();
  const { contas } = useContasParceladas();

  const isLoading = movimentacoesLoading || comparativo.isLoading;

  // Process data for charts
  const getDashboardData = () => {
    const currentMonthMovs = movimentacoes.filter(mov => {
      const movDate = new Date(mov.data);
      return movDate.getMonth() + 1 === currentMonth && movDate.getFullYear() === currentYear;
    });

    // Category data
    const categoryTotals: { [key: string]: number } = {};
    currentMonthMovs
      .filter(mov => !mov.isEntrada)
      .forEach(mov => {
        const category = mov.categoria || 'Sem categoria';
        categoryTotals[category] = (categoryTotals[category] || 0) + Number(mov.valor);
      });

    const categoryData = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Monthly data
    const monthlyData = [];
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const monthMovs = movimentacoes.filter(mov => {
        const movDate = new Date(mov.data);
        return movDate.getMonth() === date.getMonth() && movDate.getFullYear() === date.getFullYear();
      });
      
      const entradas = monthMovs.filter(m => m.isEntrada).reduce((sum, m) => sum + Number(m.valor), 0);
      const saidas = monthMovs.filter(m => !m.isEntrada).reduce((sum, m) => sum + Number(m.valor), 0);
      
      monthlyData.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        entradas,
        saidas,
        saldo: entradas - saidas
      });
    }

    // Projection data
    const avgIncome = monthlyData.reduce((sum, m) => sum + m.entradas, 0) / monthlyData.length || 0;
    const avgExpenses = monthlyData.reduce((sum, m) => sum + m.saidas, 0) / monthlyData.length || 0;
    const projectionData = [];
    
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(currentYear, currentMonth - 1 + i, 1);
      projectionData.push({
        month: futureDate.toLocaleDateString('pt-BR', { month: 'short' }),
        entradas: avgIncome * (0.95 + Math.random() * 0.1),
        saidas: avgExpenses * (0.95 + Math.random() * 0.1),
        saldo: (avgIncome - avgExpenses) * (0.95 + Math.random() * 0.1),
        isProjection: true
      });
    }

    return {
      categoryData,
      monthlyData,
      projectionData,
      comparativeData: []
    };
  };

  const dashboardData = getDashboardData();

  const handleTransactionAdded = () => {
    setShowTransactionForm(false);
    toast({
      title: "Sucesso!",
      description: "Transação adicionada com sucesso"
    });
  };

  // Generate insights
  const generateInsights = () => {
    const insights = [];
    
    if (stats.saldoAtual < 0) {
      insights.push({
        type: 'negative' as const,
        title: 'Saldo Negativo',
        description: 'Seu saldo está negativo. Considere revisar seus gastos.',
        action: 'Ver detalhes'
      });
    }

    if (stats.percentualMetaEconomia && stats.percentualMetaEconomia < 50) {
      insights.push({
        type: 'warning' as const,
        title: 'Meta de Poupança',
        description: `Você está com ${stats.percentualMetaEconomia.toFixed(1)}% da meta atingida.`,
        action: 'Ajustar meta'
      });
    }

    return insights;
  };

  // Generate upcoming commitments
  const getUpcomingCommitments = () => {
    if (!contas || contas.length === 0) return [];
    
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    
    // Use data_primeira_parcela to calculate next due date
    return contas
      .filter(conta => {
        // Calculate next due date based on first installment date and paid installments
        const firstDate = new Date(conta.data_primeira_parcela);
        const nextMonth = new Date(firstDate);
        nextMonth.setMonth(nextMonth.getMonth() + conta.parcelas_pagas);
        return nextMonth <= next30Days && conta.parcelas_pagas < conta.total_parcelas;
      })
      .slice(0, 5)
      .map(conta => {
        const firstDate = new Date(conta.data_primeira_parcela);
        const nextDue = new Date(firstDate);
        nextDue.setMonth(nextDue.getMonth() + conta.parcelas_pagas);
        
        return {
          description: conta.nome || 'Conta sem nome',
          value: conta.valor_parcela,
          dueDate: nextDue.toISOString().split('T')[0],
          type: 'Parcelamento'
        };
      });
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-muted rounded-lg"></div>
              <div className="h-80 bg-muted rounded-lg"></div>
            </div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content space-y-6">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Dashboard Financeiro</h1>
              <p className="page-subtitle">
                Visão completa das suas finanças com dados reais e projeções
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowTransactionForm(true)}
                className="button-gradient"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nova</span> Transação
              </Button>
            </div>
          </div>
        </div>

        {/* Financial KPIs */}
        <FinancialKPIs
          totalIncome={comparativo.comparativo?.rendaRealizada || 0}
          totalExpenses={comparativo.comparativo?.gastosRealizados || 0}
          balance={(comparativo.comparativo?.rendaRealizada || 0) - (comparativo.comparativo?.gastosRealizados || 0)}
          savingsRate={comparativo.comparativo?.taxaRealizacaoRenda || 0}
          budgetUsage={(comparativo.comparativo?.gastosRealizados || 0) / (comparativo.comparativo?.gastosProjetados || 1) * 100}
          monthlyTrend={
            (comparativo.comparativo?.rendaRealizada || 0) > (comparativo.comparativo?.gastosRealizados || 0) 
              ? 'positive' 
              : 'negative'
          }
          isLoading={isLoading}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2">
            <InteractiveCharts 
              data={dashboardData}
              isLoading={isLoading}
            />
          </div>

          {/* Insights Section */}
          <div className="space-y-6">
            <QuickInsights
              recentTransactions={movimentacoes.slice(0, 5).map(mov => ({
                id: mov.id,
                description: mov.nome || 'Transação sem nome',
                value: mov.valor,
                type: mov.isEntrada ? 'Receita' : 'Despesa',
                category: mov.categoria || 'Sem categoria',
                date: mov.data,
                source: mov.numero_wpp ? 'WhatsApp' : 'Manual'
              }))}
              upcomingCommitments={getUpcomingCommitments()}
              insights={generateInsights()}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Performance Cards */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="text-base">Performance do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="metric-card-success p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="icon-success">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Taxa de Realização</p>
                    <p className="font-bold text-lg text-success">
                      {comparativo.comparativo?.taxaRealizacaoRenda?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="metric-card-primary p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="icon-primary">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Controle de Gastos</p>
                    <p className="font-bold text-lg text-primary">
                      {((comparativo.comparativo?.gastosRealizados || 0) / (comparativo.comparativo?.gastosProjetados || 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="metric-card-warning p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="icon-warning">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transações</p>
                    <p className="font-bold text-lg text-warning">
                      {movimentacoes.filter(mov => {
                        const movDate = new Date(mov.data);
                        return movDate.getMonth() + 1 === currentMonth && movDate.getFullYear() === currentYear;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="metric-card-purple p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="icon-purple">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Compromissos</p>
                    <p className="font-bold text-lg text-purple-600">
                      {getUpcomingCommitments().length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <TransactionForm
            open={showTransactionForm}
            onOpenChange={setShowTransactionForm}
            onSuccess={handleTransactionAdded}
            userId={user.id}
          />
        )}
      </div>
    </div>
  );
};