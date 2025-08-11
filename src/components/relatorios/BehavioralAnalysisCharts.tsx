import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, Store, Repeat } from "lucide-react";
import { BehavioralInsight } from "@/hooks/useAdvancedReportsData";

interface BehavioralAnalysisChartsProps {
  data: BehavioralInsight;
  isLoading?: boolean;
}

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#c2410c', '#0891b2'];

export const BehavioralAnalysisCharts = ({ data, isLoading }: BehavioralAnalysisChartsProps) => {
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
            <Users className="h-5 w-5" />
            Análise Comportamental
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  // Prepare data for weekday spending chart
  const weekdayData = data.spendingByWeekday.map(item => ({
    ...item,
    avgPerTransaction: item.count > 0 ? item.amount / item.count : 0
  }));

  // Prepare data for recurrent vs one-time pie chart
  const recurrentData = [
    { name: 'Transações Recorrentes', value: data.recurrentVsOneTime.recurrent, color: COLORS[0] },
    { name: 'Transações Pontuais', value: data.recurrentVsOneTime.oneTime, color: COLORS[1] }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'amount' ? 'Valor: ' : 'Transações: '}
              {entry.dataKey === 'amount' ? formatTooltipCurrency(entry.value) : entry.value}
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
      const total = recurrentData.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? (data.value / total) * 100 : 0;
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm">
            Quantidade: {data.value}
          </p>
          <p className="text-sm">
            Percentual: {percentage.toFixed(1)}%
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
          <Users className="h-5 w-5" />
          Análise Comportamental
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekday" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekday">Por Dia da Semana</TabsTrigger>
            <TabsTrigger value="establishments">Estabelecimentos</TabsTrigger>
            <TabsTrigger value="patterns">Padrões</TabsTrigger>
          </TabsList>

          <TabsContent value="weekday" className="mt-6">
            <div className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="#2563eb" name="Valor Gasto" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {weekdayData.map((day, index) => (
                  <div key={day.day} className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-medium text-sm">{day.day}</div>
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(day.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {day.count} transações
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Média: {formatCurrency(day.avgPerTransaction)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="establishments" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Store className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Top Estabelecimentos Frequentados</span>
              </div>
              
              {data.topEstablishments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum estabelecimento identificado no período</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topEstablishments.map((establishment, index) => (
                    <div key={establishment.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <div className="font-medium">{establishment.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {establishment.count} visitas • Média por visita: {formatCurrency(establishment.avgPerVisit)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(establishment.amount)}</div>
                        </div>
                      </div>
                      <Progress 
                        value={(establishment.amount / data.topEstablishments[0].amount) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="mt-6">
            <div className="space-y-6">
              {/* Recurrent vs One-time Transactions */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Repeat className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Padrão de Transações</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={recurrentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => {
                            const total = recurrentData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = total > 0 ? (value / total) * 100 : 0;
                            return `${percentage.toFixed(1)}%`;
                          }}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {recurrentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-4">
                    {recurrentData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-lg font-bold">{item.value}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.name === 'Transações Recorrentes' 
                              ? 'Gastos que se repetem mensalmente'
                              : 'Gastos únicos ou esporádicos'
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Dia Mais Ativo</span>
                    </div>
                    <div className="mt-2">
                      {weekdayData.length > 0 && (
                        <>
                          <div className="font-bold">
                            {weekdayData.reduce((max, day) => day.amount > max.amount ? day : max, weekdayData[0]).day}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(Math.max(...weekdayData.map(d => d.amount)))}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Estabelecimentos</span>
                    </div>
                    <div className="mt-2">
                      <div className="font-bold">{data.topEstablishments.length}</div>
                      <div className="text-sm text-muted-foreground">
                        Locais diferentes
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Recorrência</span>
                    </div>
                    <div className="mt-2">
                      <div className="font-bold">
                        {data.recurrentVsOneTime.recurrent + data.recurrentVsOneTime.oneTime > 0 
                          ? ((data.recurrentVsOneTime.recurrent / (data.recurrentVsOneTime.recurrent + data.recurrentVsOneTime.oneTime)) * 100).toFixed(0)
                          : 0
                        }%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Gastos recorrentes
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};