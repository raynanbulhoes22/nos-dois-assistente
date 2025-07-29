import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";

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

        // Buscar dados financeiros
        const { data: financialData, error: financialError } = await supabase
          .from('registros_financeiros')
          .select('*')
          .eq('user_id', user.id)
          .order('data', { ascending: false })
          .limit(10);

        if (financialError) {
          console.error('Erro ao buscar dados financeiros:', financialError);
        } else {
          const income = financialData
            ?.filter(item => item.tipo_movimento === 'entrada')
            ?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;

          const expenses = financialData
            ?.filter(item => item.tipo_movimento === 'saida')
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
  }, [user.id]);

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
    <div className="min-h-screen bg-gradient-to-br from-primary/3 via-background to-secondary/3 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Heart className="h-10 w-10 text-primary animate-pulse-glow" />
                <div className="absolute inset-0 h-10 w-10 text-primary/20 animate-ping"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Nós Dois
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Olá, {profile?.nome || user.email}! 👋
                </p>
              </div>
            </div>
            <Button 
              variant="floating" 
              size="sm" 
              onClick={handleSignOut}
              className="gap-2 hover:scale-105 transition-spring"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden rounded-2xl mb-8 group">
          <div 
            className="h-72 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-secondary/70 to-accent/80 flex items-center transition-smooth group-hover:from-primary/95 group-hover:via-secondary/75 group-hover:to-accent/85">
              <div className="container mx-auto px-6">
                <div className="max-w-2xl animate-fade-in">
                  <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
                    Bem-vindo ao seu
                    <br />
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Assistente Pessoal
                    </span>
                  </h2>
                  <p className="text-xl text-white/90 mb-6">
                    Gerencie suas finanças, tarefas e agenda em um só lugar com inteligência e simplicidade
                  </p>
                  <div className="flex gap-4">
                    <Button variant="glass" size="lg" className="text-white border-white/30 hover:bg-white/20">
                      Explorar recursos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="elevated" className="group hover:scale-[1.02] transition-spring overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entradas</CardTitle>
              <div className="relative">
                <TrendingUp className="h-5 w-5 text-income" />
                <div className="absolute inset-0 h-5 w-5 text-income/30 animate-ping group-hover:animate-pulse"></div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-income/10 rounded-full blur-xl"></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-income mb-1">
                {formatCurrency(dashboardData.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-income rounded-full"></span>
                Total de receitas
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="group hover:scale-[1.02] transition-spring overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saídas</CardTitle>
              <div className="relative">
                <TrendingDown className="h-5 w-5 text-expense" />
                <div className="absolute inset-0 h-5 w-5 text-expense/30 animate-ping group-hover:animate-pulse"></div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-expense/10 rounded-full blur-xl"></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-expense mb-1">
                {formatCurrency(dashboardData.totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-expense rounded-full"></span>
                Total de gastos
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="group hover:scale-[1.02] transition-spring overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
              <div className="relative">
                <DollarSign className="h-5 w-5 text-primary" />
                <div className="absolute inset-0 h-5 w-5 text-primary/30 animate-ping group-hover:animate-pulse"></div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-1 ${dashboardData.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(dashboardData.balance)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={`inline-block w-2 h-2 rounded-full ${dashboardData.balance >= 0 ? 'bg-income' : 'bg-expense'}`}></span>
                Saldo atual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="financial" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm shadow-md p-1">
            <TabsTrigger value="financial" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-smooth">
              <CreditCard className="h-4 w-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-smooth">
              <CheckSquare className="h-4 w-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-smooth">
              <Calendar className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Gestão Financeira
              </h3>
              <div className="flex gap-3">
                <Button variant="glass" size="sm" className="shadow-md hover:shadow-lg">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button size="sm" variant="gradient" className="shadow-glow hover:shadow-glow-accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </div>
            </div>

            <Card variant="elevated" className="shadow-xl">
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>
                  Últimas movimentações financeiras
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{transaction.categoria || 'Sem categoria'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.tipo_movimento === 'entrada' ? 'text-income' : 'text-expense'
                          }`}>
                            {transaction.tipo_movimento === 'entrada' ? '+' : '-'}
                            {formatCurrency(Number(transaction.valor))}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.forma_pagamento || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                    <Button size="sm" className="mt-4">
                      Adicionar primeira transação
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Gerenciador de Tarefas</h3>
              <Button size="sm" variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
            
            <Card className="shadow-medium">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Sistema de tarefas em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground">
                    Em breve você poderá gerenciar suas tarefas aqui
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Agenda</h3>
              <Button size="sm" variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </div>
            
            <Card className="shadow-medium">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Sistema de agenda em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground">
                    Em breve você poderá gerenciar seus compromissos aqui
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};