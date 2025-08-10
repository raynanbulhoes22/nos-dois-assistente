import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, Eye, EyeOff, DollarSign, Target, Calendar, BarChart3, Activity, AlertTriangle, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionForm } from "./TransactionForm";

// Hooks for real data
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";

// Dashboard components
import { FinancialChart } from "./FinancialChart";
import { AdvancedCharts } from "./dashboard/AdvancedCharts";
import { InteractiveCharts } from "./dashboard/InteractiveCharts";
import { FinancialKPIs } from "./dashboard/FinancialKPIs";
interface User {
  id: string;
  email?: string;
}
export const Dashboard = ({
  user
}: {
  user: User;
}) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const {
    toast
  } = useToast();

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

  // Generate monthly data for charts
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

  // Generate projection data
  const generateProjectionData = () => {
    const months = [];
    const now = new Date();
    const avgIncome = financialData.income;
    const avgExpenses = financialData.expenses;
    
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
  const handleTransactionAdded = () => {
    setShowTransactionForm(false);
    toast({
      title: "Sucesso!",
      description: "Transação adicionada com sucesso"
    });
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  if (isLoading) {
    return <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-40 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg"></div>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-muted rounded-lg"></div>
              <div className="h-80 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        

        {/* Financial KPIs Card */}
        <FinancialKPIs
          totalIncome={financialData.income}
          totalExpenses={financialData.expenses}
          balance={financialData.balance}
          savingsRate={financialData.savingsRate}
          budgetUsage={financialData.budgetUsage}
          monthlyTrend={financialData.monthlyTrend}
          isLoading={isLoading}
        />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Performance Rate */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taxa de Realização</p>
                  <p className="font-bold text-lg text-green-600">
                    {comparativo.comparativo?.taxaRealizacaoRenda?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Control */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Controle de Gastos</p>
                  <p className="font-bold text-lg text-blue-600">
                    {(financialData.expenses / (comparativo.comparativo?.gastosProjetados || 1) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Activity className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transações</p>
                  <p className="font-bold text-lg text-yellow-600">
                    {financialData.transactionCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <PieChart className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Categorias</p>
                  <p className="font-bold text-lg text-purple-600">
                    {financialData.topCategories.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="charts">
              <BarChart3 className="h-4 w-4 mr-2" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Activity className="h-4 w-4 mr-2" />
              Análises
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Calendar className="h-4 w-4 mr-2" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="categories">
              <PieChart className="h-4 w-4 mr-2" />
              Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            <FinancialChart userId={user.id} refreshTrigger={Date.now()} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <InteractiveCharts 
              data={financialData.chartData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {financialData.currentMonthMovs.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma transação este mês</p>
                  </div> : <div className="space-y-3">
                    {financialData.currentMonthMovs.slice(0, 10).map(mov => <div key={mov.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {mov.isEntrada ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                          <div>
                            <p className="font-medium text-sm">{mov.nome || 'Transação'}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{mov.categoria}</span>
                              <span>•</span>
                              <span>{new Date(mov.data).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`font-semibold ${mov.isEntrada ? 'text-green-600' : 'text-red-600'}`}>
                          {mov.isEntrada ? '+' : '-'}{formatCurrency(mov.valor)}
                        </span>
                      </div>)}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Categorias de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                {financialData.topCategories.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma categoria de gasto este mês</p>
                  </div> : <div className="space-y-3">
                    {financialData.topCategories.map((category, index) => {
                  const percentage = category.value / financialData.expenses * 100;
                  return <div key={category.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{category.name}</span>
                            <span className="text-sm font-semibold">
                              {formatCurrency(category.value)} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{
                        width: `${percentage}%`
                      }} />
                          </div>
                        </div>;
                })}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transaction Form Modal */}
        {showTransactionForm && <TransactionForm open={showTransactionForm} onOpenChange={setShowTransactionForm} onSuccess={handleTransactionAdded} userId={user.id} />}
      </div>
    </div>;
};