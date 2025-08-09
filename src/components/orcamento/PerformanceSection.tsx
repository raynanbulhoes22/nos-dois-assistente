import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";

interface PerformanceSectionProps {
  mes?: number;
  ano?: number;
}

export const PerformanceSection = ({ mes, ano }: PerformanceSectionProps) => {
  const { comparativo, isLoading } = useComparativoFinanceiro(mes, ano);

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

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg animate-pulse">
        <div className="h-4 bg-muted rounded w-20"></div>
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Projetado vs Realizado</span>
            <span className="sm:hidden">Resumo</span>
          </CardTitle>
          <Badge variant={performanceGeral.variant} className="text-xs">
            {performanceGeral.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {/* Layout responsivo: vertical no mobile, horizontal no desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center justify-between sm:justify-start gap-1">
            <span className="text-muted-foreground">Renda:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{formatCurrency(comparativo.rendaRealizada)}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">/{formatCurrency(comparativo.rendaProjetada)}</span>
              <Badge variant={comparativo.taxaRealizacaoRenda >= 90 ? "default" : "destructive"} className="text-xs h-4 px-1">
                {comparativo.taxaRealizacaoRenda.toFixed(0)}%
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-1">
            <span className="text-muted-foreground">Gastos:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{formatCurrency(comparativo.gastosRealizados)}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">/{formatCurrency(comparativo.gastosProjetados)}</span>
              <Badge variant={comparativo.taxaControleGastos <= 100 ? "default" : "destructive"} className="text-xs h-4 px-1">
                {comparativo.taxaControleGastos.toFixed(0)}%
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-1">
            <span className="text-muted-foreground">Saldo:</span>
            <div className="flex items-center gap-1">
              <span className={`font-medium ${comparativo.saldoRealizado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(comparativo.saldoRealizado)}
              </span>
              {comparativo.saldoRealizado >= comparativo.saldoProjetado ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};