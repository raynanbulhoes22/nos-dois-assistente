import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { PatrimonialAnalysis } from "@/hooks/useAdvancedReportsData";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PatrimonialAnalysisCardProps {
  data: PatrimonialAnalysis;
  isLoading?: boolean;
}

export const PatrimonialAnalysisCard = ({ data, isLoading }: PatrimonialAnalysisCardProps) => {
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

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 5) return "bg-green-100 text-green-800 border-green-200";
    if (growth < -5) return "bg-red-100 text-red-800 border-red-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getStabilityColor = (index: number) => {
    if (index >= 80) return "text-green-600";
    if (index >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Evolução Patrimonial
        </CardTitle>
        <CardDescription>
          Análise da evolução dos seus saldos mensais e crescimento patrimonial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico de Evolução */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyBalanceEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Saldo Inicial']}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="saldoInicial" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Crescimento Total</span>
              {getTrendIcon(data.totalGrowth)}
            </div>
            <div className="text-2xl font-bold">
              {data.totalGrowth >= 0 ? '+' : ''}{data.totalGrowth.toFixed(1)}%
            </div>
            <Badge variant="outline" className={getTrendColor(data.totalGrowth)}>
              Período completo
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Média Mensal</span>
              {getTrendIcon(data.avgMonthlyGrowth)}
            </div>
            <div className="text-2xl font-bold">
              {data.avgMonthlyGrowth >= 0 ? '+' : ''}{data.avgMonthlyGrowth.toFixed(1)}%
            </div>
            <Badge variant="outline" className={getTrendColor(data.avgMonthlyGrowth)}>
              Por mês
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Melhor Mês</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold text-green-600">
              +{data.bestPerformingMonth.growth.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {data.bestPerformingMonth.month}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pior Mês</span>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-lg font-semibold text-red-600">
              {data.worstPerformingMonth.growth.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {data.worstPerformingMonth.month}
            </div>
          </div>
        </div>

        {/* Índice de Estabilidade */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Índice de Estabilidade</span>
            <span className={`text-sm font-semibold ${getStabilityColor(data.stabilityIndex)}`}>
              {data.stabilityIndex.toFixed(0)}/100
            </span>
          </div>
          <Progress 
            value={data.stabilityIndex} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            {data.stabilityIndex >= 80 && "Excelente estabilidade patrimonial"}
            {data.stabilityIndex >= 60 && data.stabilityIndex < 80 && "Boa estabilidade com algumas variações"}
            {data.stabilityIndex < 60 && "Patrimônio com alta variabilidade"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};