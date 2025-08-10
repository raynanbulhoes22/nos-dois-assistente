import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { useAdvancedFinancialStats } from "@/hooks/useAdvancedFinancialStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const CategoryAnalysisCard = () => {
  const stats = useAdvancedFinancialStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Análise Detalhada por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.categoryAnalysis.slice(0, 8).map((category, index) => (
              <div key={category.name} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }} />
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {category.transactionCount} transações
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(category.totalAmount)}</p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(category.trend)}
                      <span className={`text-sm ${getTrendColor(category.trend)}`}>
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ticket médio:</span>
                    <span className="font-medium">{formatCurrency(category.averageAmount)}</span>
                  </div>
                  
                  {/* Mini gráfico de evolução */}
                  {category.monthlyEvolution.length > 1 && (
                    <div className="h-16 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={category.monthlyEvolution}>
                          <XAxis dataKey="month" hide />
                          <YAxis hide />
                          <Tooltip 
                            formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                            labelFormatter={(label) => `Mês: ${label}`}
                          />
                          <Bar dataKey="amount" fill={`hsl(${index * 45}, 70%, 50%)`} radius={2} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};