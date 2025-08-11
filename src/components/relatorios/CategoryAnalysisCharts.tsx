import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, PieChart as PieChartIcon } from "lucide-react";
import { CategoryAnalysis } from "@/hooks/useAdvancedReportsData";

interface CategoryAnalysisChartsProps {
  data: CategoryAnalysis[];
  isLoading?: boolean;
}

const COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea',
  '#c2410c', '#0891b2', '#be123c', '#059669', '#7c3aed',
  '#ea580c', '#0284c7', '#e11d48', '#065f46', '#7c2d12'
];

export const CategoryAnalysisCharts = ({ data, isLoading }: CategoryAnalysisChartsProps) => {
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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Análise por Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  // Prepare data for pie chart (top 10 categories)
  const pieData = data.slice(0, 10).map((item, index) => ({
    name: item.name,
    value: item.amount,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare data for comparison chart (top 8 categories)
  const comparisonData = data.slice(0, 8).map((item, index) => ({
    name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
    amount: item.amount,
    transactions: item.transactionCount,
    avgAmount: item.avgAmount,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare data for evolution chart (top 5 categories)
  const evolutionData = data.slice(0, 5);
  
  // Transform monthly evolution data for the chart
  const monthlyEvolutionData = evolutionData[0]?.monthlyEvolution.map((month, index) => {
    const dataPoint: any = { month: month.month };
    evolutionData.forEach((category, catIndex) => {
      dataPoint[category.name] = category.monthlyEvolution[index]?.amount || 0;
    });
    return dataPoint;
  }) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatTooltipCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm">
            Valor: {formatTooltipCurrency(data.value)}
          </p>
          <p className="text-sm">
            Percentual: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Análise por Categorias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="distribution">Distribuição</TabsTrigger>
            <TabsTrigger value="comparison">Comparativo</TabsTrigger>
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking" className="mt-6">
            <div className="space-y-4">
              {data.slice(0, 10).map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{category.name}</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(category.trend)}
                        <span className={`text-xs ${getTrendColor(category.trend)}`}>
                          {category.trendPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(category.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}% • {category.transactionCount} transações
                      </div>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Ticket médio: {formatCurrency(category.avgAmount)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => 
                      percentage > 5 ? `${name} (${percentage.toFixed(1)}%)` : ''
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="Valor Total">
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="evolution" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyEvolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {evolutionData.map((category, index) => (
                    <Line
                      key={category.name}
                      type="monotone"
                      dataKey={category.name}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};