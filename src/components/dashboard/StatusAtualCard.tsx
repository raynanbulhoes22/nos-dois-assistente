import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Plus,
  Eye,
  EyeOff
} from "lucide-react";
import { useState } from "react";

interface StatusAtualProps {
  saldoAtual: number;
  comprometimentoMes: number;
  saldoDisponivel: number;
  alertasUrgentes: number;
  onAddTransacao: () => void;
  isLoading?: boolean;
}

export const StatusAtualCard = ({
  saldoAtual,
  comprometimentoMes,
  saldoDisponivel,
  alertasUrgentes,
  onAddTransacao,
  isLoading
}: StatusAtualProps) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = () => {
    if (saldoDisponivel < 0) return "text-destructive";
    if (saldoDisponivel < comprometimentoMes * 0.2) return "text-warning";
    return "text-success";
  };

  const getStatusMessage = () => {
    if (saldoDisponivel < 0) return "Saldo insuficiente";
    if (saldoDisponivel < comprometimentoMes * 0.2) return "Atenção ao saldo";
    return "Situação estável";
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Situação Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-6 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Situação Atual
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="h-8 w-8 p-0"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Saldo Principal */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Saldo Disponível</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-2xl font-bold ${getStatusColor()}`}>
              {showBalance ? formatCurrency(saldoDisponivel) : "••••••"}
            </span>
            {saldoDisponivel >= 0 ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
          </div>
          <Badge variant={saldoDisponivel >= 0 ? "default" : "destructive"}>
            {getStatusMessage()}
          </Badge>
        </div>

        {/* Detalhes */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Saldo Total</p>
            <p className="font-semibold">
              {showBalance ? formatCurrency(saldoAtual) : "••••••"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Comprometido</p>
            <p className="font-semibold text-warning">
              {showBalance ? formatCurrency(comprometimentoMes) : "••••••"}
            </p>
          </div>
        </div>

        {/* Alertas e Ações */}
        <div className="flex items-center justify-between pt-4 border-t">
          {alertasUrgentes > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm text-warning">
                {alertasUrgentes} {alertasUrgentes === 1 ? 'alerta' : 'alertas'}
              </span>
            </div>
          )}
          
          <Button onClick={onAddTransacao} size="sm" className="ml-auto">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};