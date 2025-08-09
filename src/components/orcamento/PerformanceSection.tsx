import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparativoCard } from "./ComparativoCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle } from "lucide-react";
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Projetado vs Realizado
          </CardTitle>
          <Badge variant={performanceGeral.variant} className="text-xs">
            {performanceGeral.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cards Comparativos Compactos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ComparativoCard
            title="Renda"
            valorProjetado={comparativo.rendaProjetada}
            valorRealizado={comparativo.rendaRealizada}
            isLoading={isLoading}
            formatValue={formatCurrency}
            className="h-auto"
          />
          
          <ComparativoCard
            title="Gastos"
            valorProjetado={comparativo.gastosProjetados}
            valorRealizado={comparativo.gastosRealizados}
            isLoading={isLoading}
            formatValue={formatCurrency}
            className="h-auto"
          />
          
          <ComparativoCard
            title="Saldo"
            valorProjetado={comparativo.saldoProjetado}
            valorRealizado={comparativo.saldoRealizado}
            isLoading={isLoading}
            formatValue={formatCurrency}
            className="h-auto"
          />
        </div>

        {/* Métricas Resumidas em uma linha */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t space-x-4">
          <div className="flex items-center gap-1">
            <span>Taxa Renda:</span>
            <span className="font-medium">{comparativo.taxaRealizacaoRenda.toFixed(0)}%</span>
            {comparativo.taxaRealizacaoRenda >= 90 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <span>Controle Gastos:</span>
            <span className="font-medium">{comparativo.taxaControleGastos.toFixed(0)}%</span>
            {comparativo.taxaControleGastos <= 100 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <span>Economia:</span>
            <span className={`font-medium ${
              comparativo.economiaEfetiva >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(comparativo.economiaEfetiva)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};