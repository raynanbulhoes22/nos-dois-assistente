import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, Calendar,
  BarChart3, ArrowUpRight, ArrowDownRight, Eye, EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionForm } from "./TransactionForm";
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

export const Dashboard = ({ user }: { user: User }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentTransactions: [],
    monthlyTrend: 'stable'
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const financialStats = useFinancialStats();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data: transactions, error } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .gte('data', firstDayOfMonth.toISOString().split('T')[0])
        .lte('data', lastDayOfMonth.toISOString().split('T')[0])
        .order('data', { ascending: false });

      if (error) throw error;

      const income = transactions?.filter(t => t.tipo === 'Receita')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0;
      
      const expenses = transactions?.filter(t => t.tipo === 'Despesa')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0;

      setDashboardData({
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        recentTransactions: transactions?.slice(0, 5) || [],
        monthlyTrend: income > expenses ? 'positive' : 'negative'
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id, refreshTrigger]);

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
      description: "Transação adicionada com sucesso",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowTransactionForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* Saldo Principal */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"></div>
          <CardContent className="relative p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-sm font-medium text-muted-foreground">Saldo Atual</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </div>
            <p className={`text-3xl font-bold ${dashboardData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {showBalance ? formatCurrency(dashboardData.balance) : '••••••'}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>{showBalance ? formatCurrency(dashboardData.totalIncome) : '••••'}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <ArrowDownRight className="h-3 w-3" />
                <span>{showBalance ? formatCurrency(dashboardData.totalExpenses) : '••••'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-1"
            onClick={() => setShowTransactionForm(true)}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Adicionar</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-1"
            onClick={() => window.location.href = '/movimentacoes'}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Histórico</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-1"
            onClick={() => window.location.href = '/orcamento'}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Calendário</span>
          </Button>
        </div>

        {/* Movimentações Recentes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Recentes
              <Badge variant="secondary" className="text-xs">
                Este mês
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Nenhuma movimentação este mês</p>
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => setShowTransactionForm(true)}
                >
                  Adicionar primeira transação
                </Button>
              </div>
            ) : (
              dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {transaction.title || transaction.nome || 'Sem título'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.tipo === 'Receita' ? '+' : '-'}
                      {showBalance ? formatCurrency(transaction.valor) : '••••'}
                    </p>
                    {transaction.categoria && (
                      <p className="text-xs text-muted-foreground">{transaction.categoria}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Estatísticas Simples */}
        {dashboardData.recentTransactions.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Transações</p>
                  <p className="text-sm font-semibold text-green-600">
                    {dashboardData.recentTransactions.filter(t => t.tipo === 'Receita').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Gastos</p>
                  <p className="text-sm font-semibold text-red-600">
                    {dashboardData.recentTransactions.filter(t => t.tipo === 'Despesa').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <TransactionForm 
        open={showTransactionForm}
        onOpenChange={setShowTransactionForm}
        onSuccess={handleTransactionAdded}
        userId={user.id}
      />
    </div>
  );
};