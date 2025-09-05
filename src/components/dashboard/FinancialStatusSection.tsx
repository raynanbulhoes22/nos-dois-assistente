import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye,
  EyeOff,
  Wallet,
  DollarSign,
  Target
} from "lucide-react";
import { FinancialHealth } from "@/hooks/useSmartDashboard";

interface FinancialStatusSectionProps {
  saldoTotal: number;
  saldoInicial: number;
  saldoMovimentacoes: number;
  rendaMes: number;
  gastosMes: number;
  saldoEsperado: number;
  saudeFinanceira: FinancialHealth;
  showBalance: boolean;
  onToggleBalance: () => void;
}

export const FinancialStatusSection = ({
  saldoTotal,
  saldoInicial,
  saldoMovimentacoes,
  rendaMes,
  gastosMes,
  saldoEsperado,
  saudeFinanceira,
  showBalance,
  onToggleBalance
}: FinancialStatusSectionProps) => {
  const formatCurrency = (value: number) => {
    if (!showBalance) return "••••••";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getHealthColor = () => {
    switch (saudeFinanceira.status) {
      case 'excelente': return 'text-emerald-600';
      case 'bom': return 'text-green-600';
      case 'atencao': return 'text-yellow-600';
      case 'critico': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBgColor = () => {
    switch (saudeFinanceira.status) {
      case 'excelente': return 'bg-emerald-50 border-emerald-200';
      case 'bom': return 'bg-green-50 border-green-200';
      case 'atencao': return 'bg-yellow-50 border-yellow-200';
      case 'critico': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Status Financeiro</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleBalance}
            className="h-8 px-3"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Saldo Total em Destaque */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Saldo Total</span>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <span className={`text-3xl font-bold ${saldoTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(saldoTotal)}
            </span>
            {saldoTotal >= 0 ? (
              <TrendingUp className="h-6 w-6 text-success" />
            ) : (
              <TrendingDown className="h-6 w-6 text-destructive" />
            )}
          </div>
          
          {saldoMovimentacoes !== 0 && (
            <p className="text-sm text-muted-foreground">
              {saldoMovimentacoes >= 0 ? '+' : ''}{formatCurrency(saldoMovimentacoes)} este mês
            </p>
          )}
        </div>

        {/* Score de Saúde Financeira */}
        <div className={`p-4 rounded-lg border ${getHealthBgColor()}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Saúde Financeira</span>
            <Badge variant="secondary" className={getHealthColor()}>
              {saudeFinanceira.status.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    saudeFinanceira.score >= 80 ? 'bg-emerald-500' :
                    saudeFinanceira.score >= 60 ? 'bg-green-500' :
                    saudeFinanceira.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${saudeFinanceira.score}%` }}
                />
              </div>
            </div>
            <span className={`font-bold text-lg ${getHealthColor()}`}>
              {saudeFinanceira.score}
            </span>
          </div>
        </div>

        {/* Receitas vs Despesas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs font-medium text-success">RECEITAS</span>
            </div>
            <p className="font-bold text-success">
              {formatCurrency(rendaMes)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">DESPESAS</span>
            </div>
            <p className="font-bold text-destructive">
              {formatCurrency(gastosMes)}
            </p>
          </div>
        </div>

        {/* Informações Adicionais */}
        {(saldoInicial !== 0 || saldoEsperado !== saldoTotal) && (
          <div className="pt-3 border-t space-y-2">
            {saldoInicial !== 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo Inicial:</span>
                <span className="font-medium">{formatCurrency(saldoInicial)}</span>
              </div>
            )}
            
            {Math.abs(saldoEsperado - saldoTotal) > 0.01 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo Esperado:</span>
                <span className="font-medium">{formatCurrency(saldoEsperado)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};