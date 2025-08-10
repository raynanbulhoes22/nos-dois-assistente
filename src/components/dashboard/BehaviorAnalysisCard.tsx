import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, TrendingUp, Activity } from "lucide-react";
import { useAdvancedFinancialStats } from "@/hooks/useAdvancedFinancialStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const BehaviorAnalysisCard = () => {
  const stats = useAdvancedFinancialStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDayOrder = (day: string) => {
    const order = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
    return order.indexOf(day.toLowerCase());
  };

  const sortedDayData = stats.behaviorAnalysis.dayOfWeekDistribution
    .sort((a, b) => getDayOrder(a.day) - getDayOrder(b.day));

  return (
    <div className="space-y-6">
      {/* Análise por Dia da Semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Padrão de Gastos por Dia da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? formatCurrency(Number(value)) : value,
                    name === 'amount' ? 'Total Gasto' : 'Transações'
                  ]}
                />
                <Bar dataKey="amount" fill="#8884d8" name="amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedDayData.slice(0, 3).map((day, index) => {
              const avgPerTransaction = day.amount / day.count;
              return (
                <div key={day.day} className="p-4 bg-muted/30 rounded-lg text-center">
                  <h4 className="font-medium capitalize">{day.day}</h4>
                  <p className="text-lg font-bold mt-1">{formatCurrency(day.amount)}</p>
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                    <span>{day.count} transações</span>
                    <span>•</span>
                    <span>{formatCurrency(avgPerTransaction)} média</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Estabelecimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Estabelecimentos Mais Frequentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.behaviorAnalysis.topEstablishments.slice(0, 8).map((establishment, index) => {
              const avgPerVisit = establishment.amount / establishment.count;
              return (
                <div key={establishment.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{establishment.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {establishment.count} visitas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(establishment.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(avgPerVisit)}/visita
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Taxa de Crescimento</span>
              </div>
              <p className="text-xl font-bold text-green-600">
                {stats.performanceMetrics.monthlyGrowthRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Receitas mensais</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Ticket Médio</span>
              </div>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(stats.performanceMetrics.averageTransactionValue)}
              </p>
              <p className="text-xs text-muted-foreground">Por transação</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Score Financeiro</span>
              </div>
              <p className="text-xl font-bold text-purple-600">
                {stats.performanceMetrics.financialHealthScore.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Saúde financeira</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Variabilidade</span>
              </div>
              <p className="text-xl font-bold text-orange-600">
                {stats.performanceMetrics.expenseVariability.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Desvio de gastos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};