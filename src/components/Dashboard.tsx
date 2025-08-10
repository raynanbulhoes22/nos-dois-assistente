import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  CheckSquare,
  CreditCard,
  DollarSign,
  PieChart,
  Heart,
  LogOut,
  Plus,
  Filter,
  Target,
  AlertCircle,
  Smartphone,
  Edit3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionForm } from "./TransactionForm";
import { TransactionsList } from "./TransactionsList";
import { FinancialChart } from "./FinancialChart";
import { FinancialOverview } from "@/components/dashboard/FinancialOverview";
import { AdvancedCharts } from "@/components/dashboard/AdvancedCharts";
import { MonthlyProjections } from "@/components/dashboard/MonthlyProjections";
import { useFinancialStats } from "@/hooks/useFinancialStats";

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  recentTransactions: any[];
  monthlyTrend: string;
}

interface User {
  id: string;
  email?: string;
}

interface Profile {
  nome?: string;
}

export const Dashboard = ({ user }: { user: User }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentTransactions: [],
    monthlyTrend: "up"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const stats = useFinancialStats();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil:', profileError);
        } else {
          setProfile(profileData);
        }

        // Buscar dados financeiros do mês atual
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const { data: financialData, error: financialError } = await supabase
          .from('registros_financeiros')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', firstDayOfMonth.toISOString().split('T')[0])
          .lte('data', lastDayOfMonth.toISOString().split('T')[0]);

        if (financialError) {
          console.error('Erro ao buscar dados financeiros:', financialError);
        } else {
          const income = financialData
            ?.filter(item => item.tipo === 'Receita')
            ?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;

          const expenses = financialData
            ?.filter(item => item.tipo === 'Despesa')
            ?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;

          setDashboardData({
            totalIncome: income,
            totalExpenses: expenses,
            balance: income - expenses,
            recentTransactions: financialData || [],
            monthlyTrend: income > expenses ? "up" : "down"
          });
        }
      } catch (error) {
        console.error('Erro geral:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.id, refreshTrigger]);

  const handleTransactionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo!"
      });
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-500/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-green-500/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm border-gray-200">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 animate-pulse-glow" />
                <div className="absolute inset-0 h-8 w-8 sm:h-10 sm:w-10 text-blue-500/20 animate-ping"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  LucraAI
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                  Olá, {profile?.nome || user.email}! 👋
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              size="sm" 
              onClick={handleSignOut}
              className="gap-1 sm:gap-2 hover:scale-105 transition-spring border-gray-300 hover:bg-gray-50 
                         min-h-[40px] px-2 sm:px-3 touch-manipulation flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl mb-6 sm:mb-8 group">
          <div 
            className="h-36 sm:h-72 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/70 to-green-600/80 flex items-center transition-smooth group-hover:from-blue-600/95 group-hover:via-purple-600/75 group-hover:to-green-600/85">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-2xl animate-fade-in">
                  <h2 className="text-2xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 leading-tight">
                    Bem-vindo ao seu
                    <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Assistente Pessoal
                    </span>
                  </h2>
                  <p className="text-sm sm:text-xl text-white/90 mb-4 sm:mb-6">
                    Gerencie suas finanças, tarefas e agenda em um só lugar com inteligência e simplicidade
                  </p>
                  <div className="flex gap-2 sm:gap-4">
                    <Button 
                      size="sm" 
                      className="bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-sm 
                                 min-h-[40px] px-3 sm:px-4 touch-manipulation text-sm sm:text-base"
                    >
                      Explorar recursos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas Inteligentes */}
        {stats.alertas.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="grid gap-3">
              {stats.alertas.slice(0, 2).map((alerta) => (
                <Card key={alerta.id} className={`border-l-4 ${
                  alerta.tipo === 'sucesso' ? 'border-l-green-500 bg-green-50' :
                  alerta.tipo === 'alerta' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-red-500 bg-red-50'
                } shadow-md touch-manipulation`}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{alerta.titulo}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{alerta.mensagem}</p>
                      </div>
                      {alerta.acao && (
                        <Button variant="outline" size="sm" className="text-xs min-h-[32px] touch-manipulation">
                          {alerta.acao}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Smart Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="group hover:scale-[1.02] transition-spring bg-white shadow-lg hover:shadow-xl border border-gray-200 touch-manipulation">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-500" />
                <p className="text-xs font-medium text-gray-600">Meta Economia</p>
              </div>
              <div className="space-y-2">
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  {stats.percentualMetaEconomia.toFixed(1)}%
                </div>
                <Progress value={Math.min(stats.percentualMetaEconomia, 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] transition-spring bg-white shadow-lg hover:shadow-xl border border-gray-200 touch-manipulation">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-purple-500" />
                <p className="text-xs font-medium text-gray-600">Cartões</p>
              </div>
              <div className="text-lg sm:text-xl font-bold text-purple-600">
                {formatCurrency(stats.limiteCartaoUsado)}
              </div>
              <p className="text-xs text-gray-500">
                de {formatCurrency(stats.limiteCartaoTotal)}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] transition-spring bg-white shadow-lg hover:shadow-xl border border-gray-200 touch-manipulation">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-blue-500" />
                <p className="text-xs font-medium text-gray-600">WhatsApp</p>
              </div>
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {stats.transacoesWhatsApp}
              </div>
              <p className="text-xs text-gray-500">transações IA</p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] transition-spring bg-white shadow-lg hover:shadow-xl border border-gray-200 touch-manipulation">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="h-4 w-4 text-orange-500" />
                <p className="text-xs font-medium text-gray-600">Manuais</p>
              </div>
              <div className="text-lg sm:text-xl font-bold text-orange-600">
                {stats.transacoesManuais}
              </div>
              <p className="text-xs text-gray-500">transações</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="group hover:scale-[1.02] transition-spring overflow-hidden bg-white shadow-lg hover:shadow-xl border border-gray-200 touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Entradas</CardTitle>
              <div className="relative">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                <div className="absolute inset-0 h-4 w-4 sm:h-5 sm:w-5 text-green-500/30 animate-ping group-hover:animate-pulse"></div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full blur-xl"></div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1">
                {formatCurrency(dashboardData.totalIncome)}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                Total de receitas
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] transition-spring overflow-hidden bg-white shadow-lg hover:shadow-xl border border-gray-200 touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Saídas</CardTitle>
              <div className="relative">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                <div className="absolute inset-0 h-4 w-4 sm:h-5 sm:w-5 text-red-500/30 animate-ping group-hover:animate-pulse"></div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 rounded-full blur-xl"></div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold text-red-600 mb-1">
                {formatCurrency(dashboardData.totalExpenses)}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                Total de gastos
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] transition-spring overflow-hidden bg-white shadow-lg hover:shadow-xl border border-gray-200 touch-manipulation sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Saldo</CardTitle>
              <div className="relative">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <div className="absolute inset-0 h-4 w-4 sm:h-5 sm:w-5 text-blue-500/30 animate-ping group-hover:animate-pulse"></div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-full blur-xl"></div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className={`text-xl sm:text-3xl font-bold mb-1 ${dashboardData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(dashboardData.balance)}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className={`inline-block w-2 h-2 rounded-full ${dashboardData.balance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Saldo atual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-md p-1 border border-gray-200 h-10 sm:h-auto">
            <TabsTrigger 
              value="overview" 
              className="gap-1 sm:gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-smooth 
                         text-xs sm:text-sm font-medium py-2 px-1 sm:px-3"
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger 
              value="projections" 
              className="gap-1 sm:gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-smooth
                         text-xs sm:text-sm font-medium py-2 px-1 sm:px-3"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Projeções</span>
              <span className="sm:hidden">Proj.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              className="gap-1 sm:gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-smooth
                         text-xs sm:text-sm font-medium py-2 px-1 sm:px-3"
            >
              <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Análises</span>
              <span className="sm:hidden">Anál.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="gap-1 sm:gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-smooth
                         text-xs sm:text-sm font-medium py-2 px-1 sm:px-3"
            >
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Transações</span>
              <span className="sm:hidden">Trans.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Performance financeira e resumo */}
            <FinancialOverview />

            {/* Resumo tradicional simplificado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Saldo Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Entradas:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(dashboardData.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Saídas:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(dashboardData.totalExpenses)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Saldo:</span>
                      <span className={`font-bold text-lg ${dashboardData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(dashboardData.balance)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Movimentações Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboardData.recentTransactions.slice(0, 4).map((mov: any) => (
                      <div key={mov.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {mov.title || mov.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(mov.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold ${
                          mov.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mov.tipo === 'Receita' ? '+' : '-'}{formatCurrency(mov.valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <MonthlyProjections />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <AdvancedCharts />
            <FinancialChart userId={user?.id || ''} refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestão de Transações
              </h3>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="shadow-md hover:shadow-lg border-gray-300 flex-1 sm:flex-none min-h-[40px] touch-manipulation"
                >
                  <Filter className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filtros</span>
                  <span className="sm:hidden">⚡</span>
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg 
                           flex-1 sm:flex-none min-h-[40px] touch-manipulation"
                  onClick={() => setShowTransactionForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Nova Transação</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </div>
            </div>

            {/* Lista de Transações */}
            <TransactionsList 
              userId={user.id} 
              refreshTrigger={refreshTrigger} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Formulário de Nova Transação */}
      <TransactionForm
        open={showTransactionForm}
        onOpenChange={setShowTransactionForm}
        onSuccess={handleTransactionSuccess}
        editTransaction={null}
        userId={user.id}
      />
    </div>
  );
};