import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  CreditCard,
  PiggyBank,
  ArrowRight,
  Clock
} from "lucide-react";
import { useState } from "react";

interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'Receita' | 'Despesa';
  category: string;
  date: string;
  source?: string;
}

interface QuickInsightsProps {
  recentTransactions: Transaction[];
  upcomingCommitments: Array<{
    description: string;
    value: number;
    dueDate: string;
    type: string;
  }>;
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral' | 'warning';
    title: string;
    description: string;
    action?: string;
  }>;
  isLoading?: boolean;
}

export const QuickInsights = ({ 
  recentTransactions, 
  upcomingCommitments, 
  insights,
  isLoading = false 
}: QuickInsightsProps) => {
  const [selectedTab, setSelectedTab] = useState<'recent' | 'upcoming' | 'insights'>('recent');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'Receita' ? 
      <TrendingUp className="h-4 w-4 text-success" /> : 
      <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Target className="h-4 w-4 text-primary" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="text-base">Insights Rápidos</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={selectedTab === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('recent')}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Recentes
          </Button>
          <Button
            variant={selectedTab === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('upcoming')}
            className="text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            Próximos
          </Button>
          <Button
            variant={selectedTab === 'insights' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('insights')}
            className="text-xs"
          >
            <Target className="h-3 w-3 mr-1" />
            Insights
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {selectedTab === 'recent' && (
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon bg-muted">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Nenhuma transação recente</p>
              </div>
            ) : (
              recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="list-item group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getTransactionIcon(transaction.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.date)}</span>
                          {transaction.source && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs px-1">
                                {transaction.source}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${
                        transaction.type === 'Receita' ? 'text-success' : 'text-destructive'
                      }`}>
                        {transaction.type === 'Receita' ? '+' : '-'}{formatCurrency(transaction.value)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'upcoming' && (
          <div className="space-y-3">
            {upcomingCommitments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon bg-muted">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Nenhum compromisso próximo</p>
              </div>
            ) : (
              upcomingCommitments.slice(0, 5).map((commitment, index) => (
                <div key={index} className="list-item">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="icon-warning">
                        {commitment.type === 'Cartão' ? 
                          <CreditCard className="h-4 w-4" /> : 
                          <PiggyBank className="h-4 w-4" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {commitment.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{commitment.type}</span>
                          <span>•</span>
                          <span>Vence {formatDate(commitment.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-warning">
                        {formatCurrency(commitment.value)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'insights' && (
          <div className="space-y-3">
            {insights.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon bg-muted">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Nenhum insight disponível</p>
              </div>
            ) : (
              insights.map((insight, index) => (
                <div key={index} className="list-item">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{insight.title}</p>
                        <Badge variant={getInsightBadgeVariant(insight.type)} className="text-xs">
                          {insight.type === 'positive' ? 'Positivo' :
                           insight.type === 'negative' ? 'Atenção' :
                           insight.type === 'warning' ? 'Alerta' : 'Neutro'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          {insight.action}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};