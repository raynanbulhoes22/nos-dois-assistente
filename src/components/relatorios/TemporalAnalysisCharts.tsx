import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";
import { TemporalAnalysis } from "@/hooks/useAdvancedReportsData";

interface TemporalAnalysisChartsProps {
  data: TemporalAnalysis;
  isLoading?: boolean;
}

export const TemporalAnalysisCharts = ({ data, isLoading }: TemporalAnalysisChartsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTooltipCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Análise Temporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  // Prepare data for balance evolution chart
  const balanceEvolutionData = data.monthlyEvolution.map(item => ({
    ...item,
    balanceColor: item.balance >= 0 ? '#16a34a' : '#dc2626'
  }));

  // Calculate trends
  const calculateTrend = (data: { income: number; expenses: number; balance: number }[]) => {
    if (data.length < 2) return { income: 0, expenses: 0, balance: 0 };
    
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    
    return {
      income: previous.income > 0 ? ((current.income - previous.income) / previous.income) * 100 : 0,
      expenses: previous.expenses > 0 ? ((current.expenses - previous.expenses) / previous.expenses) * 100 : 0,
      balance: previous.balance !== 0 ? ((current.balance - previous.balance) / Math.abs(previous.balance)) * 100 : 0
    };
  };

  const trends = calculateTrend(data.monthlyEvolution);

  // Prepare data for income vs expenses comparison
  const comparisonData = data.monthlyEvolution.map(item => ({
    month: item.month,
    income: item.income,
    expenses: -item.expenses, // Negative for better visualization
    balance: item.balance
  }));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Análise Temporal
        </CardTitle>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Receita: {trends.income >= 0 ? '+' : ''}{trends.income.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span>Gastos: {trends.expenses >= 0 ? '+' : ''}{trends.expenses.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>Saldo: {trends.balance >= 0 ? '+' : ''}{trends.balance.toFixed(1)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="evolution" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 h-auto p-1 gap-1">
            <TabsTrigger value="evolution" className="text-xs sm:text-sm px-2 py-2 h-auto">
              Evolução Mensal
            </TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs sm:text-sm px-2 py-2 h-auto">
              Receitas vs Gastos
            </TabsTrigger>
            <TabsTrigger value="balance" className="text-xs sm:text-sm px-2 py-2 h-auto">
              Saldo Acumulado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evolution" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyEvolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => formatTooltipCurrency(Number(value))}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    name="Receitas"
                    dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    name="Gastos"
                    dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    name="Saldo"
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      const formattedValue = formatTooltipCurrency(Math.abs(Number(value)));
                      return [formattedValue, name];
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#16a34a"
                    fill="#16a34a"
                    fillOpacity={0.6}
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#dc2626"
                    fill="#dc2626"
                    fillOpacity={0.6}
                    name="Gastos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="balance" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={balanceEvolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => formatTooltipCurrency(Number(value))}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="balance" 
                    name="Saldo Mensal"
                  >
                    {balanceEvolutionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.balance >= 0 ? '#16a34a' : '#dc2626'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};