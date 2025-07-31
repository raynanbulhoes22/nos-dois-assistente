import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ResumoMensal {
  mes: number;
  ano: number;
  entradas: number;
  saidas: number;
  saldo: number;
}

interface CategoriaRanking {
  categoria: string;
  valor: number;
  percentual: number;
}

export const Relatorios = () => {
  const { user } = useAuth();
  const [resumoMeses, setResumoMeses] = useState<ResumoMensal[]>([]);
  const [topCategorias, setTopCategorias] = useState<CategoriaRanking[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRelatorios = async () => {
    if (!user) return;
    
    try {
      // Buscar dados dos últimos 6 meses
      const dataAtual = new Date();
      const meses: ResumoMensal[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        
        // Entradas do mês
        const { data: entradas } = await supabase
          .from('registros_financeiros')
          .select('valor')
          .eq('user_id', user.id)
          .eq('tipo_movimento', 'entrada')
          .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
          .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);

        // Saídas do mês
        const { data: saidas } = await supabase
          .from('registros_financeiros')
          .select('valor')
          .eq('user_id', user.id)
          .eq('tipo_movimento', 'saida')
          .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
          .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);

        const totalEntradas = entradas?.reduce((sum, e) => sum + e.valor, 0) || 0;
        const totalSaidas = saidas?.reduce((sum, s) => sum + s.valor, 0) || 0;

        meses.push({
          mes,
          ano,
          entradas: totalEntradas,
          saidas: totalSaidas,
          saldo: totalEntradas - totalSaidas
        });
      }

      setResumoMeses(meses);

      // Top categorias de gastos (últimos 3 meses)
      const { data: gastosCategorias } = await supabase
        .from('registros_financeiros')
        .select('categoria, valor')
        .eq('user_id', user.id)
        .eq('tipo_movimento', 'saida')
        .gte('data', new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 2, 1).toISOString().split('T')[0]);

      if (gastosCategorias) {
        const categoriasSoma: Record<string, number> = gastosCategorias.reduce((acc, gasto) => {
          acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.valor;
          return acc;
        }, {} as Record<string, number>);

        const totalGastos = Object.values(categoriasSoma).reduce((sum, valor) => sum + valor, 0);
        
        const ranking = Object.entries(categoriasSoma)
          .map(([categoria, valor]) => ({
            categoria,
            valor,
            percentual: (valor / totalGastos) * 100
          }))
          .sort((a, b) => b.valor - a.valor)
          .slice(0, 5);

        setTopCategorias(ranking);
      }

      // Gerar insights
      const insightsGerados = [];
      
      if (meses.length >= 2) {
        const mesAtual = meses[meses.length - 1];
        const mesAnterior = meses[meses.length - 2];
        const diferencaSaldo = mesAtual.saldo - mesAnterior.saldo;
        
        if (diferencaSaldo > 0) {
          insightsGerados.push(`Você economizou ${formatCurrency(diferencaSaldo)} a mais em relação ao mês passado! 📈`);
        } else if (diferencaSaldo < 0) {
          insightsGerados.push(`Seus gastos aumentaram ${formatCurrency(Math.abs(diferencaSaldo))} em relação ao mês passado 📉`);
        }
      }

      if (topCategorias.length > 0) {
        const categoriaTop = topCategorias[0];
        insightsGerados.push(`${categoriaTop.categoria} representa ${categoriaTop.percentual.toFixed(1)}% dos seus gastos`);
      }

      setInsights(insightsGerados);

    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorios();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatMes = (mes: number) => {
    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return meses[mes - 1];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {insights.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Insights Inteligentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resumoMeses.map((resumo) => (
                <div key={`${resumo.mes}-${resumo.ano}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{formatMes(resumo.mes)} {resumo.ano}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        {formatCurrency(resumo.entradas)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-red-600" />
                        {formatCurrency(resumo.saidas)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(resumo.saldo)}
                    </p>
                    <Badge variant={resumo.saldo >= 0 ? "default" : "destructive"}>
                      {resumo.saldo >= 0 ? "Positivo" : "Negativo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Categorias de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategorias.map((categoria, index) => (
                <div key={categoria.categoria} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium">{categoria.categoria}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(categoria.valor)}</p>
                    <p className="text-sm text-muted-foreground">
                      {categoria.percentual.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparativo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resumoMeses.slice(-3).map((resumo) => (
              <div key={`${resumo.mes}-${resumo.ano}`} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-center mb-3">
                  {formatMes(resumo.mes)} {resumo.ano}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Entradas:</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(resumo.entradas)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saídas:</span>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(resumo.saidas)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Saldo:</span>
                    <span className={resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(resumo.saldo)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};