import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Target,
  Calendar,
  BarChart3,
  Activity,
  AlertTriangle,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionForm } from "./TransactionForm";

// Hooks for real data
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";

interface User {
  id: string;
  email?: string;
}

export const Dashboard = ({ user }: { user: User }) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const { toast } = useToast();

  // Real data hooks
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const comparativo = useComparativoFinanceiro(currentMonth, currentYear);
  const { movimentacoes, isLoading: movimentacoesLoading } = useMovimentacoes();

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
    const categoryTotals: { [key: string]: number } = {};
    currentMonthMovs
      .filter(mov => !mov.isEntrada)
      .forEach(mov => {
        const category = mov.categoria || 'Sem categoria';
        categoryTotals[category] = (categoryTotals[category] || 0) + Number(mov.valor);
      });

    const topCategories = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      income,
      expenses,
      balance,
      currentMonthMovs,
      topCategories,
      transactionCount: currentMonthMovs.length,
      monthlyTrend: balance >= 0 ? 'positive' : 'negative' as 'positive' | 'negative'
    };
  }, [comparativo.comparativo, movimentacoes, currentMonth, currentYear]);

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
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-40 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Dashboard Financeiro
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão completa das suas finanças
            </p>
          </div>
          <Button 
            onClick={() => setShowTransactionForm(true)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {/* Main Balance Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Visão Geral Financeira</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowBalance(!showBalance)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance */}
              <div className="text-center p-4 rounded-lg bg-background/50 border">
                <p className="text-sm text-muted-foreground mb-2">Saldo Atual</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className={`text-2xl sm:text-3xl font-bold ${
                    financialData.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {showBalance ? formatCurrency(financialData.balance) : '••••••'}
                  </p>
                  {financialData.balance >= 0 ? 
                    <TrendingUp className="h-5 w-5 text-green-600" /> : 
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  }
                </div>
                <Badge variant={financialData.balance >= 0 ? "default" : "destructive"} className="text-xs">
                  {financialData.monthlyTrend === 'positive' ? 'Positivo' : 'Negativo'}
                </Badge>
              </div>
              
              {/* Income */}
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-muted-foreground mb-2">Receitas</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <p className="text-xl font-bold text-green-600">
                    {showBalance ? formatCurrency(financialData.income) : '••••••'}
                  </p>
                </div>
                <p className="text-xs text-green-600">Este mês</p>
              </div>
              
              {/* Expenses */}
              <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-muted-foreground mb-2">Despesas</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  <p className="text-xl font-bold text-red-600">
                    {showBalance ? formatCurrency(financialData.expenses) : '••••••'}
                  </p>
                </div>
                <p className="text-xs text-red-600">Este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    {((financialData.expenses) / (comparativo.comparativo?.gastosProjetados || 1) * 100).toFixed(1)}%
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

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
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

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumo de Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Renda Realizada</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(financialData.income)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Gastos Realizados</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(financialData.expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Saldo Final</span>
                    <span className={`font-bold ${financialData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(financialData.balance)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Alertas Financeiros</CardTitle>
                </CardHeader>
                <CardContent>
                  {financialData.balance < 0 ? (
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-200">Saldo Negativo</p>
                        <p className="text-sm text-red-600 dark:text-red-300">
                          Seus gastos estão maiores que sua renda este mês.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Situação Positiva</p>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          Suas finanças estão equilibradas este mês.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {financialData.currentMonthMovs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma transação este mês</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {financialData.currentMonthMovs.slice(0, 10).map((mov) => (
                      <div key={mov.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {mov.isEntrada ? 
                            <TrendingUp className="h-4 w-4 text-green-600" /> : 
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          }
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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Categorias de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                {financialData.topCategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma categoria de gasto este mês</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {financialData.topCategories.map((category, index) => {
                      const percentage = (category.value / financialData.expenses) * 100;
                      return (
                        <div key={category.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{category.name}</span>
                            <span className="text-sm font-semibold">
                              {formatCurrency(category.value)} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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