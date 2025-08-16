import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calendar, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { PredictabilityAnalysis } from "@/hooks/useAdvancedReportsData";
import { formatCurrency } from "@/lib/utils";

interface PredictabilityAnalysisCardProps {
  data: PredictabilityAnalysis;
  isLoading?: boolean;
}

export const PredictabilityAnalysisCard = ({ data, isLoading }: PredictabilityAnalysisCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: 'Gastos Fixos', value: data.fixedVsVariable.fixos, color: '#8b5cf6' },
    { name: 'Gastos Variáveis', value: data.fixedVsVariable.variaveis, color: '#06b6d4' }
  ];

  const getPredictabilityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getCommitmentColor = (percentage: number) => {
    if (percentage > 70) return "text-red-600";
    if (percentage > 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getReliabilityColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Análise de Previsibilidade
        </CardTitle>
        <CardDescription>
          Avalie a estabilidade e previsibilidade do seu fluxo financeiro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score de Previsibilidade */}
        <div className="text-center space-y-3">
          <div className={`text-4xl font-bold ${getPredictabilityColor(data.cashFlowPredictability)}`}>
            {data.cashFlowPredictability.toFixed(0)}/100
          </div>
          <div className="text-sm text-muted-foreground">Score de Previsibilidade</div>
          <Progress value={data.cashFlowPredictability} className="h-3" />
          <div className="text-xs text-muted-foreground">
            {data.cashFlowPredictability >= 80 && "Fluxo financeiro muito previsível"}
            {data.cashFlowPredictability >= 60 && data.cashFlowPredictability < 80 && "Fluxo financeiro moderadamente previsível"}
            {data.cashFlowPredictability < 60 && "Fluxo financeiro pouco previsível"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gastos Fixos vs Variáveis */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Distribuição de Gastos</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm">Fixos</span>
                </div>
                <span className="text-sm font-medium">
                  {data.fixedVsVariable.percentualFixos.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-sm">Variáveis</span>
                </div>
                <span className="text-sm font-medium">
                  {(100 - data.fixedVsVariable.percentualFixos).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Métricas de Confiabilidade */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Métricas de Estabilidade</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Renda Recorrente</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getReliabilityColor(data.recurringIncome.confiabilidade)}`}>
                    {data.recurringIncome.confiabilidade.toFixed(0)}%
                  </span>
                  {data.recurringIncome.confiabilidade >= 80 ? 
                    <Shield className="h-4 w-4 text-green-600" /> : 
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  }
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(data.recurringIncome.valor)} de renda garantida
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Comprometimento</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getCommitmentColor(data.monthlyCommitments.percentualRenda)}`}>
                    {data.monthlyCommitments.percentualRenda.toFixed(0)}%
                  </span>
                  {data.monthlyCommitments.percentualRenda > 70 ? 
                    <AlertTriangle className="h-4 w-4 text-red-600" /> : 
                    <Shield className="h-4 w-4 text-green-600" />
                  }
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(data.monthlyCommitments.valor)} de compromissos mensais
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Compromissos */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximos Compromissos (6 meses)
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.upcomingCommitments.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  fontSize={10}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  fontSize={10}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Total']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Rápidos */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h5 className="font-medium text-sm">💡 Insights de Previsibilidade</h5>
          <div className="text-sm text-muted-foreground space-y-1">
            {data.fixedVsVariable.percentualFixos > 60 && (
              <div>• Você tem boa previsibilidade com {data.fixedVsVariable.percentualFixos.toFixed(0)}% de gastos fixos</div>
            )}
            {data.recurringIncome.confiabilidade > 80 && (
              <div>• Sua renda é muito estável ({data.recurringIncome.confiabilidade.toFixed(0)}% recorrente)</div>
            )}
            {data.monthlyCommitments.percentualRenda > 70 && (
              <div>• ⚠️ Alto comprometimento da renda ({data.monthlyCommitments.percentualRenda.toFixed(0)}%)</div>
            )}
            {data.cashFlowPredictability >= 80 && (
              <div>• ✅ Seu fluxo financeiro é muito previsível, ideal para planejamento</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};