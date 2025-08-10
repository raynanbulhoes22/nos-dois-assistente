import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  Area, AreaChart
} from "recharts";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

export const AdvancedCharts = () => {
  const { entradas, saidas } = useMovimentacoes();
  const [selectedPeriod, setSelectedPeriod] = useState("3");
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [balanceData, setBalanceData] = useState<any[]>([]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  useEffect(() => {
    const months = parseInt(selectedPeriod);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // Filtrar movimentações do período
    const filteredEntradas = entradas.filter(e => new Date(e.data) >= startDate);
    const filteredSaidas = saidas.filter(s => new Date(s.data) >= startDate);

    // Dados por categoria (gastos)
    const categoryTotals: { [key: string]: number } = {};
    filteredSaidas.forEach(saida => {
      const category = saida.categoria || 'Sem categoria';
      categoryTotals[category] = (categoryTotals[category] || 0) + saida.valor;
    });

    const categoryChartData = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    setCategoryData(categoryChartData);

    // Dados mensais
    const monthlyTotals: { [key: string]: { entradas: number; saidas: number; saldo: number } } = {};
    
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      monthlyTotals[monthKey] = { entradas: 0, saidas: 0, saldo: 0 };
      
      filteredEntradas
        .filter(e => {
          const eDate = new Date(e.data);
          return eDate.getFullYear() === date.getFullYear() && eDate.getMonth() === date.getMonth();
        })
        .forEach(e => monthlyTotals[monthKey].entradas += e.valor);

      filteredSaidas
        .filter(s => {
          const sDate = new Date(s.data);
          return sDate.getFullYear() === date.getFullYear() && sDate.getMonth() === date.getMonth();
        })
        .forEach(s => monthlyTotals[monthKey].saidas += s.valor);

      monthlyTotals[monthKey].saldo = monthlyTotals[monthKey].entradas - monthlyTotals[monthKey].saidas;
    }

    const monthlyChartData = Object.entries(monthlyTotals).map(([key, data]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      return {
        ...data,
        month: monthName
      };
    }).reverse();
    setMonthlyData(monthlyChartData);

    // Dados de saldo acumulado
    let saldoAcumulado = 0;
    const balanceChartData = monthlyChartData.map(month => {
      saldoAcumulado += month.saldo;
      return {
        ...month,
        saldoAcumulado
      };
    });
    setBalanceData(balanceChartData);

  }, [entradas, saidas, selectedPeriod]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          {label && <p className="font-medium mb-2">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Seletor de período */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Análise Avançada</h3>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Pizza - Gastos por Categoria */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Entradas vs Saídas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Entradas vs Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="entradas" fill="#00C49F" name="Entradas" />
                  <Bar dataKey="saidas" fill="#FF8042" name="Saídas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Linha - Saldo Mensal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Evolução do Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    name="Saldo Mensal"
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Área - Saldo Acumulado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Saldo Acumulado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="saldoAcumulado" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                    name="Saldo Acumulado"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};