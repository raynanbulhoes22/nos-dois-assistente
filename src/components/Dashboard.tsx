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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Nós Dois</h1>
                <p className="text-sm text-muted-foreground">
                  Olá, {profile?.nome || user.email}! 👋
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl mb-8">
          <div 
            className="h-64 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/60 flex items-center">
              <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-white mb-2">
                  Bem-vindo ao seu Assistente Pessoal
                </h2>
                <p className="text-xl text-white/90">
                  Gerencie suas finanças, tarefas e agenda em um só lugar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-income" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income">
                {formatCurrency(dashboardData.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de receitas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-expense" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(dashboardData.totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de gastos
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${dashboardData.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(dashboardData.balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Saldo atual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="financial" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="financial" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Gestão Financeira</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button size="sm" variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </div>
            </div>

            <Card className="shadow-medium">
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