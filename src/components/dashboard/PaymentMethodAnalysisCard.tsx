import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Banknote, CircleDollarSign } from "lucide-react";
import { useAdvancedFinancialStats } from "@/hooks/useAdvancedFinancialStats";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const PaymentMethodAnalysisCard = () => {
  const stats = useAdvancedFinancialStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentIcon = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower.includes('cartão') || methodLower.includes('cartao')) {
      return <CreditCard className="h-5 w-5" />;
    } else if (methodLower.includes('pix')) {
      return <Smartphone className="h-5 w-5" />;
    } else if (methodLower.includes('dinheiro')) {
      return <Banknote className="h-5 w-5" />;
    }
    return <CircleDollarSign className="h-5 w-5" />;
  };

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff0088'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise por Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.chartData.paymentMethodPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.chartData.paymentMethodPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Total']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Lista Detalhada */}
            <div className="space-y-3">
              {stats.paymentMethodAnalysis.slice(0, 6).map((method, index) => (
                <div key={method.method} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      {getPaymentIcon(method.method)}
                    </div>
                    <div>
                      <h4 className="font-medium">{method.method}</h4>
                      <p className="text-sm text-muted-foreground">
                        {method.transactionCount} transações
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(method.totalAmount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {method.percentage.toFixed(1)}% do total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estatísticas Resumidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            {stats.paymentMethodAnalysis.slice(0, 3).map((method, index) => (
              <div key={method.method} className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-center mb-2">
                  {getPaymentIcon(method.method)}
                </div>
                <h4 className="font-medium text-sm">{method.method}</h4>
                <p className="text-lg font-bold mt-1">{formatCurrency(method.averageAmount)}</p>
                <p className="text-xs text-muted-foreground">Ticket médio</p>
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {method.categories.slice(0, 3).map(category => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                  {method.categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{method.categories.length - 3}
                    </Badge>
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