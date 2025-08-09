import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";

interface ValoresReaisSectionProps {
  mes?: number;
  ano?: number;
}

export const ValoresReaisSection = ({ mes, ano }: ValoresReaisSectionProps) => {
  const { comparativo, isLoading } = useComparativoFinanceiro(mes, ano);

  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const saldoRealizado = comparativo.rendaRealizada - comparativo.gastosRealizados;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Valores Realizados
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Movimentações financeiras reais do período
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Renda Realizada"
            value={formatCurrency(comparativo.rendaRealizada)}
            icon={TrendingUp}
            variant="success"
            isLoading={isLoading}
            subtitle="Entradas registradas no período"
          />
          
          <MetricCard
            title="Gastos Realizados"
            value={formatCurrency(comparativo.gastosRealizados)}
            icon={TrendingDown}
            variant="error"
            isLoading={isLoading}
            subtitle="Saídas registradas no período"
          />
          
          <MetricCard
            title="Saldo Real"
            value={formatCurrency(saldoRealizado)}
            icon={saldoRealizado >= 0 ? TrendingUp : TrendingDown}
            variant={saldoRealizado >= 0 ? "success" : "error"}
            isLoading={isLoading}
            subtitle="Diferença entre entradas e saídas"
          />
        </div>
      </CardContent>
    </Card>
  );
};