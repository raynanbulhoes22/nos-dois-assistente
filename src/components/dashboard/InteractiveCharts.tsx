import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, BarChart3, TrendingUp, Activity, DollarSign, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area, ComposedChart, ReferenceLine } from "recharts";
const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--success))'];
interface ChartData {
  categoryData: Array<{
    name: string;
    value: number;
  }>;
  monthlyData: Array<{
    month: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
  projectionData: Array<{
    month: string;
    entradas: number;
    saidas: number;
    saldo: number;
    isProjection?: boolean;
  }>;
  comparativeData: Array<{
    categoria: string;
    projetado: number;
    realizado: number;
    diferenca: number;
  }>;
}
interface InteractiveChartsProps {
  data: ChartData;
  isLoading?: boolean;
}
export const InteractiveCharts = ({
  data,
  isLoading = false
}: InteractiveChartsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const [selectedChart, setSelectedChart] = useState("category");

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    const filteredMonthlyData = data.monthlyData.slice(-selectedPeriod);
    
    // Recalculate category data based on filtered months
    const categoryMap = new Map<string, number>();
    
    // Process projection data for conditional coloring
    const projectionDataWithConditions = [...filteredMonthlyData.slice(-3), ...data.projectionData].map(item => ({
      ...item,
      saldoPositivo: item.saldo > 0 ? item.saldo : null,
      saldoNegativo: item.saldo < 0 ? item.saldo : null,
      saldoZero: item.saldo === 0 ? 0 : null
    }));
    
    // Since we don't have access to raw transactions here, we'll filter the existing data
    // This is a simplified approach - ideally we'd filter at the data source level
    return {
      ...data,
      monthlyData: filteredMonthlyData,
      projectionData: data.projectionData, // Keep projections as is
      projectionDataWithConditions
    };
  }, [data, selectedPeriod]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  const formatCurrencyShort = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return formatCurrency(value);
  };
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-background border rounded-lg shadow-lg p-3 max-w-xs">
          {label && <p className="font-medium mb-2 text-sm">{label}</p>}
          {payload.map((entry: any, index: number) => {
            const value = typeof entry.value === 'number' ? entry.value : 0;
            const isNegative = value < 0;
            const textColor = isNegative ? 'text-destructive' : 'text-success';
            
            return <p key={index} className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{
                backgroundColor: entry.color
              }} />
              <span className="flex-1">{entry.name}:</span>
              <span className={`font-medium ${textColor}`}>
                {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
              </span>
            </p>
          })}
        </div>;
    }
    return null;
  };
  if (isLoading) {
    return <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-muted rounded"></div>
              </CardContent>
            </Card>)}
        </div>
      </div>;
  }
  return <div className="space-y-6">
      {/* Chart Navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Visão Geral</h3>
        <div className="flex items-center gap-2">
          <Button variant={selectedPeriod === 3 ? "default" : "outline"} size="sm" onClick={() => setSelectedPeriod(3)}>
            3M
          </Button>
          <Button variant={selectedPeriod === 6 ? "default" : "outline"} size="sm" onClick={() => setSelectedPeriod(6)}>
            6M
          </Button>
          <Button variant={selectedPeriod === 12 ? "default" : "outline"} size="sm" onClick={() => setSelectedPeriod(12)}>
            12M
          </Button>
        </div>
      </div>

      <Tabs value={selectedChart} onValueChange={setSelectedChart} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="category" className="text-xs">
            <PieChart className="h-3 w-3 mr-1" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            Mensal
          </TabsTrigger>
          <TabsTrigger value="trends" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Tendências
          </TabsTrigger>
          <TabsTrigger value="projections" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            Projeções
          </TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gastos por Categoria */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Top 6 Categorias de Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <RechartsPieChart>
                       <Pie data={filteredData.categoryData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({
                       name,
                       percent
                     }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                         {filteredData.categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                       </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Categorias */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-base">Ranking de Gastos</CardTitle>
              </CardHeader>
               <CardContent className="space-y-3">
                 {filteredData.categoryData.map((category, index) => <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                     <div className="flex items-center gap-3">
                       <div className="w-4 h-4 rounded-full" style={{
                     backgroundColor: COLORS[index % COLORS.length]
                   }} />
                       <span className="font-medium text-sm">{category.name}</span>
                     </div>
                     <div className="text-right">
                       <p className="font-semibold text-sm">{formatCurrency(category.value)}</p>
                       <p className="text-xs text-muted-foreground">
                         {(category.value / filteredData.categoryData.reduce((sum, c) => sum + c.value, 0) * 100).toFixed(1)}%
                       </p>
                     </div>
                   </div>)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Comparativo Mensal */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Histórico Receitas vs Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={filteredData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" tick={{
                      fontSize: 12
                    }} axisLine={false} />
                      <YAxis tick={{
                      fontSize: 12
                    }} tickFormatter={formatCurrencyShort} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="entradas" fill="hsl(var(--success))" name="Receitas" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="saidas" fill="hsl(var(--destructive))" name="Despesas" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="saldo" stroke="hsl(var(--primary))" strokeWidth={3} name="Saldo" dot={{
                      fill: 'hsl(var(--primary))',
                      strokeWidth: 2,
                      r: 4
                    }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Evolução do Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{
                    fontSize: 12
                  }} axisLine={false} />
                    <YAxis tick={{
                    fontSize: 12
                  }} tickFormatter={formatCurrencyShort} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="saldo" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={3} name="Saldo" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Projeções Próximos Meses
                <Badge variant="secondary" className="text-xs">Baseado na média</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={filteredData.projectionDataWithConditions}>
                     <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                     <XAxis dataKey="month" tick={{
                     fontSize: 12
                   }} axisLine={false} />
                     <YAxis tick={{
                     fontSize: 12
                   }} tickFormatter={formatCurrencyShort} axisLine={false} />
                     <Tooltip content={<CustomTooltip />} />
                     <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" strokeWidth={1} />
                     {/* Negative values area - Red (rendered first so it appears below) */}
                     <Area 
                       type="monotone" 
                       dataKey="saldoNegativo" 
                       stroke="hsl(var(--destructive))" 
                       fill="hsl(var(--destructive))" 
                       fillOpacity={0.4} 
                       strokeWidth={2} 
                       name="Saldo Negativo"
                       strokeDasharray="5 5"
                       connectNulls={true}
                     />
                     {/* Positive values area - Green */}
                     <Area 
                       type="monotone" 
                       dataKey="saldoPositivo" 
                       stroke="hsl(var(--success))" 
                       fill="hsl(var(--success))" 
                       fillOpacity={0.4} 
                       strokeWidth={2} 
                       name="Saldo Positivo"
                       strokeDasharray="5 5"
                       connectNulls={true}
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};