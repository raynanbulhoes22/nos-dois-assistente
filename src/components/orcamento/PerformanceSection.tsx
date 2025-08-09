import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparativoCard } from "./ComparativoCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle } from "lucide-react";
import { CalendarioFinanceiro } from "@/components/calendario/CalendarioFinanceiro";
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";

interface PerformanceSectionProps {
  mes?: number;
  ano?: number;
}

export const PerformanceSection = ({ mes, ano }: PerformanceSectionProps) => {
  const { comparativo, isLoading } = useComparativoFinanceiro(mes, ano);
  const mesAtual = mes || new Date().getMonth() + 1;
  const anoAtual = ano || new Date().getFullYear();

  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getPerformanceGeral = () => {
    const mediaPerformance = (comparativo.taxaRealizacaoRenda + (200 - comparativo.taxaControleGastos)) / 2;
    if (mediaPerformance >= 90) return { label: "Excelente", variant: "default" as const };
    if (mediaPerformance >= 70) return { label: "Bom", variant: "secondary" as const };
    return { label: "Precisa melhorar", variant: "destructive" as const };
  };

  const performanceGeral = getPerformanceGeral();

  return (
    <div className="space-y-6">
      {/* Comparações Diretas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Projetado vs Realizado
          </CardTitle>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Comparação direta entre valores planejados e realizados
            </p>
            <Badge variant={performanceGeral.variant} className="text-xs">
              {performanceGeral.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ComparativoCard
              title="Renda"
              valorProjetado={comparativo.rendaProjetada}
              valorRealizado={comparativo.rendaRealizada}
              isLoading={isLoading}
              formatValue={formatCurrency}
            />
            
            <ComparativoCard
              title="Gastos"
              valorProjetado={comparativo.gastosProjetados}
              valorRealizado={comparativo.gastosRealizados}
              isLoading={isLoading}
              formatValue={formatCurrency}
            />
            
            <ComparativoCard
              title="Saldo"
              valorProjetado={comparativo.saldoProjetado}
              valorRealizado={comparativo.saldoRealizado}
              isLoading={isLoading}
              formatValue={formatCurrency}
            />
          </div>
        </CardContent>
      </Card>

      {/* Calendário Principal */}
      <Card>
        <CardContent className="p-0">
          <CalendarioFinanceiro mesAtual={mesAtual} anoAtual={anoAtual} />
        </CardContent>
      </Card>

      {/* Métricas de Performance Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Métricas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Taxa de Realização de Renda</p>
                    <p className="text-xs text-muted-foreground">Meta: ≥ 90%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {comparativo.taxaRealizacaoRenda.toFixed(0)}%
                    </p>
                    {comparativo.taxaRealizacaoRenda >= 90 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 ml-auto" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Controle de Gastos</p>
                    <p className="text-xs text-muted-foreground">Meta: ≤ 100%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {comparativo.taxaControleGastos.toFixed(0)}%
                    </p>
                    {comparativo.taxaControleGastos <= 100 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500 ml-auto" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Economia Efetiva</p>
                    <p className="text-xs text-muted-foreground">Diferença Real vs Projetado</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      comparativo.economiaEfetiva >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(comparativo.economiaEfetiva)}
                    </p>
                    {comparativo.economiaEfetiva >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 ml-auto" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};