import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, DollarSign, CreditCard, PiggyBank } from "lucide-react";
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useGastosFixos } from "@/hooks/useGastosFixos";
import { useContasParceladas } from "@/hooks/useContasParceladas";
import { useCartoes } from "@/hooks/useCartoes";

interface FinancialOverviewProps {
  mes?: number;
  ano?: number;
}

export const FinancialOverview = ({ mes, ano }: FinancialOverviewProps) => {
  const { comparativo, isLoading } = useComparativoFinanceiro(mes, ano);
  const { getTotalRendaAtiva } = useFontesRenda();
  const { getTotalGastosFixosAtivos } = useGastosFixos();
  const { getTotalParcelasAtivas } = useContasParceladas();
  const { getTotalLimite } = useCartoes();

  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getVariantByPerformance = (percentage: number, isExpense = false) => {
    if (isExpense) {
      return percentage <= 100 ? "default" : "destructive";
    }
    return percentage >= 90 ? "default" : percentage >= 70 ? "secondary" : "destructive";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Renda Mensal",
      value: formatCurrency(comparativo.rendaRealizada),
      projected: formatCurrency(comparativo.rendaProjetada),
      percentage: comparativo.taxaRealizacaoRenda,
      icon: DollarSign,
      trend: comparativo.rendaRealizada >= comparativo.rendaProjetada ? "up" : "down",
      color: "text-green-600"
    },
    {
      title: "Gastos Realizados",
      value: formatCurrency(comparativo.gastosRealizados),
      projected: formatCurrency(comparativo.gastosProjetados),
      percentage: comparativo.taxaControleGastos,
      icon: CreditCard,
      trend: comparativo.gastosRealizados <= comparativo.gastosProjetados ? "up" : "down",
      color: "text-red-600",
      isExpense: true
    },
    {
      title: "Saldo Atual",
      value: formatCurrency(comparativo.saldoRealizado),
      projected: formatCurrency(comparativo.saldoProjetado),
      percentage: comparativo.saldoProjetado !== 0 ? (comparativo.saldoRealizado / comparativo.saldoProjetado) * 100 : 0,
      icon: PiggyBank,
      trend: comparativo.saldoRealizado >= comparativo.saldoProjetado ? "up" : "down",
      color: comparativo.saldoRealizado >= 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const variant = getVariantByPerformance(card.percentage, card.isExpense);
          
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                      {card.title}
                    </p>
                    <p className={`text-lg sm:text-xl font-bold ${card.color}`}>
                      {card.value}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        Meta: {card.projected}
                      </span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        variant === "default" ? "bg-green-100 text-green-700" :
                        variant === "secondary" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {card.trend === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {card.percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Icon className={`h-8 w-8 ${card.color} opacity-70`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo performance geral */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Taxa de Realização da Renda:</span>
                <span className={`font-semibold ${
                  comparativo.taxaRealizacaoRenda >= 90 ? "text-green-600" : 
                  comparativo.taxaRealizacaoRenda >= 70 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {comparativo.taxaRealizacaoRenda.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Controle de Gastos:</span>
                <span className={`font-semibold ${
                  comparativo.taxaControleGastos <= 100 ? "text-green-600" : "text-red-600"
                }`}>
                  {comparativo.taxaControleGastos.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Economia Efetiva:</span>
                <span className={`font-semibold ${
                  comparativo.economiaEfetiva >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {formatCurrency(comparativo.economiaEfetiva)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Limite Total Cartões:</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(getTotalLimite())}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};