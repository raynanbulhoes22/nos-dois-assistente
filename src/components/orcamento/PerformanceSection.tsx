import { Badge } from "@/components/ui/badge";
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
    <div className="flex items-center gap-6 p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Resumo do Mês</span>
      </div>
      
      <div className="flex items-center gap-1 text-sm">
        <span className="text-muted-foreground">Renda:</span>
        <span className="font-medium">{formatCurrency(comparativo.rendaRealizada)}</span>
        <span className="text-xs text-muted-foreground">/{formatCurrency(comparativo.rendaProjetada)}</span>
        <Badge variant={comparativo.taxaRealizacaoRenda >= 90 ? "default" : "destructive"} className="text-xs h-5 px-1">
          {comparativo.taxaRealizacaoRenda.toFixed(0)}%
        </Badge>
      </div>

      <div className="flex items-center gap-1 text-sm">
        <span className="text-muted-foreground">Gastos:</span>
        <span className="font-medium">{formatCurrency(comparativo.gastosRealizados)}</span>
        <span className="text-xs text-muted-foreground">/{formatCurrency(comparativo.gastosProjetados)}</span>
        <Badge variant={comparativo.taxaControleGastos <= 100 ? "default" : "destructive"} className="text-xs h-5 px-1">
          {comparativo.taxaControleGastos.toFixed(0)}%
        </Badge>
      </div>

      <div className="flex items-center gap-1 text-sm">
        <span className="text-muted-foreground">Saldo:</span>
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
  );
};