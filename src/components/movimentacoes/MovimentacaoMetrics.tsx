import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface MovimentacaoMetricsProps {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  entradasCount: number;
  saidasCount: number;
  totalEntradasCount: number;
  totalSaidasCount: number;
  formatCurrency: (value: number) => string;
}

export const MovimentacaoMetrics = ({
  totalEntradas,
  totalSaidas,
  saldo,
  entradasCount,
  saidasCount,
  totalEntradasCount,
  totalSaidasCount,
  formatCurrency
}: MovimentacaoMetricsProps) => {
  return (
    <div className="px-4 sm:px-6 py-3">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-none sm:max-w-3xl mx-auto">
        {/* Entradas */}
        <Card className="movimentacao-metric-card movimentacao-metric-success">
          <CardContent className="p-2 sm:p-4">
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                  Entradas
                </p>
                <p className="text-sm sm:text-xl font-bold text-green-700 dark:text-green-300 leading-tight">
                  {formatCurrency(totalEntradas)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {entradasCount} de {totalEntradasCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saídas */}
        <Card className="movimentacao-metric-card movimentacao-metric-error">
          <CardContent className="p-2 sm:p-4">
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-100 dark:bg-red-900/20">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">
                  Saídas
                </p>
                <p className="text-sm sm:text-xl font-bold text-red-700 dark:text-red-300 leading-tight">
                  {formatCurrency(totalSaidas)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {saidasCount} de {totalSaidasCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saldo */}
        <Card className="movimentacao-metric-card">
          <CardContent className="p-2 sm:p-4">
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                saldo >= 0 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                <DollarSign className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  saldo >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Saldo
                </p>
                <p className={`text-sm sm:text-xl font-bold leading-tight ${
                  saldo >= 0 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {formatCurrency(saldo)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Total geral
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};