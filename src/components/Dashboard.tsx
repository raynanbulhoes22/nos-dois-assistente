import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Plus, Calendar, Eye, EyeOff, BarChart3, ArrowUpRight, ArrowDownRight, Target, AlertTriangle, PieChart, Activity, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionForm } from "./TransactionForm";
import { FinancialOverview } from "@/components/dashboard/FinancialOverview";
import { AdvancedCharts } from "@/components/dashboard/AdvancedCharts";
import { MonthlyProjections } from "@/components/dashboard/MonthlyProjections";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from "recharts";
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  recentTransactions: any[];
  monthlyTrend: string;
  categoryData: any[];
  monthlyData: any[];
  projectionData: any[];
}
interface User {
  id: string;
  email?: string;
}
export const Dashboard = ({
  user
}: {
  user: User;
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentTransactions: [],
    monthlyTrend: 'stable',
    categoryData: [],
    monthlyData: [],
    projectionData: []
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("6");
  const {
    toast
  } = useToast();
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const currentDate = new Date();
      const periodMonths = parseInt(selectedPeriod);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - periodMonths + 1, 1);

      // Buscar todas as transações do período
      const {
        data: allTransactions,
        error
      } = await supabase.from('registros_financeiros').select('*').eq('user_id', user.id).gte('data', startDate.toISOString().split('T')[0]).order('data', {
        ascending: false
      });
      if (error) throw error;

      // Transações do mês atual
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const currentMonthTransactions = allTransactions?.filter(t => {
        const transactionDate = new Date(t.data);
        return transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth;
      }) || [];
      const income = currentMonthTransactions.filter(t => t.tipo === 'Receita').reduce((sum, t) => sum + Number(t.valor), 0);
      const expenses = currentMonthTransactions.filter(t => t.tipo === 'Despesa').reduce((sum, t) => sum + Number(t.valor), 0);

      // Dados por categoria
      const categoryTotals: {
        [key: string]: number;
      } = {};
      currentMonthTransactions.filter(t => t.tipo === 'Despesa').forEach(transaction => {
        const category = transaction.categoria || 'Sem categoria';
        categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.valor);
      });
      const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value
      })).sort((a, b) => b.value - a.value).slice(0, 6);

      // Dados mensais
      const monthlyTotals: any[] = [];
      for (let i = periodMonths - 1; i >= 0; i--) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        const monthTransactions = allTransactions?.filter(t => {
          const tDate = new Date(t.data);
          return tDate >= monthDate && tDate <= nextMonth;
        }) || [];
        const monthIncome = monthTransactions.filter(t => t.tipo === 'Receita').reduce((sum, t) => sum + Number(t.valor), 0);
        const monthExpenses = monthTransactions.filter(t => t.tipo === 'Despesa').reduce((sum, t) => sum + Number(t.valor), 0);
        monthlyTotals.push({
          month: monthDate.toLocaleDateString('pt-BR', {
            month: 'short'
          }),
          entradas: monthIncome,
          saidas: monthExpenses,
          saldo: monthIncome - monthExpenses
        });
      }

      // Projeções (próximos 3 meses baseado na média)
      const avgIncome = monthlyTotals.reduce((sum, m) => sum + m.entradas, 0) / monthlyTotals.length;
      const avgExpenses = monthlyTotals.reduce((sum, m) => sum + m.saidas, 0) / monthlyTotals.length;
      const projectionData = [];
      for (let i = 1; i <= 3; i++) {
        const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        projectionData.push({
          month: futureDate.toLocaleDateString('pt-BR', {
            month: 'short'
          }),
          entradas: avgIncome * (0.95 + Math.random() * 0.1),
          // Variação de ±5%
          saidas: avgExpenses * (0.95 + Math.random() * 0.1),
          saldo: (avgIncome - avgExpenses) * (0.95 + Math.random() * 0.1),
          isProjection: true
        });
      }
      setDashboardData({
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        recentTransactions: currentMonthTransactions.slice(0, 5),
        monthlyTrend: income > expenses ? 'positive' : 'negative',
        categoryData,
        monthlyData: monthlyTotals,
        projectionData
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, [user.id, refreshTrigger, selectedPeriod]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowTransactionForm(false);
    toast({
      title: "Sucesso!",
      description: "Transação adicionada com sucesso"
    });
  };
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-background border rounded-lg shadow-lg p-3">
          {label && <p className="font-medium mb-2">{label}</p>}
          {payload.map((entry: any, index: number) => <p key={index} className="text-sm" style={{
          color: entry.color
        }}>
              {entry.name}: {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
            </p>)}
        </div>;
    }
    return null;
  };
  if (isLoading) {
    return <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-muted rounded-lg"></div>)}
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header Sticky */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        
      </div>

      <div className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Card Principal - Saldo */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Visão Geral Financeira</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)}>
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground mb-2">Saldo Atual</p>
                <p className={`text-2xl font-bold ${dashboardData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {showBalance ? formatCurrency(dashboardData.balance) : '••••••'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {dashboardData.balance >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                  <span className="text-xs text-muted-foreground">Este mês</span>
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-green-50">
                <p className="text-sm text-muted-foreground mb-2">Entradas</p>
                <p className="text-xl font-bold text-green-600">
                  {showBalance ? formatCurrency(dashboardData.totalIncome) : '••••••'}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Receitas</span>
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-red-50">
                <p className="text-sm text-muted-foreground mb-2">Saídas</p>
                <p className="text-xl font-bold text-red-600">
                  {showBalance ? formatCurrency(dashboardData.totalExpenses) : '••••••'}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">Despesas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs com Análises Completas */}
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="charts" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Gráficos</span>
            </TabsTrigger>
            <TabsTrigger value="projections" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Projeções</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Análise</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Recentes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            {/* Gráficos Interativos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gráfico de Pizza - Categorias */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Gastos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie data={dashboardData.categoryData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value" label={({
                        name,
                        percent
                      }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {dashboardData.categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de Barras - Histórico Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Histórico Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{
                        fontSize: 12
                      }} />
                        <YAxis tick={{
                        fontSize: 12
                      }} tickFormatter={value => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="entradas" fill="#00C49F" name="Entradas" />
                        <Bar dataKey="saidas" fill="#FF8042" name="Saídas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Linha - Evolução do Saldo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Evolução do Saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{
                      fontSize: 12
                    }} />
                      <YAxis tick={{
                      fontSize: 12
                    }} tickFormatter={value => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="saldo" stroke="#8884d8" strokeWidth={3} name="Saldo" dot={{
                      fill: '#8884d8',
                      strokeWidth: 2,
                      r: 4
                    }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4">
            <MonthlyProjections />
            
            {/* Projeções Visuais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projeções dos Próximos Meses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[...dashboardData.monthlyData.slice(-3), ...dashboardData.projectionData]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{
                      fontSize: 12
                    }} />
                      <YAxis tick={{
                      fontSize: 12
                    }} tickFormatter={value => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="saldo" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Saldo Projetado" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <FinancialOverview />
            <AdvancedCharts />
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {/* Transações Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Movimentações Recentes
                  <Badge variant="secondary">Este mês</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.recentTransactions.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Nenhuma movimentação este mês</p>
                  </div> : dashboardData.recentTransactions.map(transaction => <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {transaction.title || transaction.nome || 'Sem título'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.data).toLocaleDateString('pt-BR')}
                          </p>
                          {transaction.categoria && <Badge variant="outline" className="text-xs">
                              {transaction.categoria}
                            </Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${transaction.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.tipo === 'Receita' ? '+' : '-'}
                          {showBalance ? formatCurrency(transaction.valor) : '••••'}
                        </p>
                      </div>
                    </div>)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <TransactionForm open={showTransactionForm} onOpenChange={setShowTransactionForm} onSuccess={handleTransactionAdded} userId={user.id} />
    </div>;
};