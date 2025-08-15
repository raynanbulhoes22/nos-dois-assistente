import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { Cartao } from "@/hooks/useCartoes";

interface LimiteCartaoDisplayProps {
  cartao: Cartao;
  className?: string;
  onClick?: () => void;
}

export const LimiteCartaoDisplay = ({ cartao, className, onClick }: LimiteCartaoDisplayProps) => {
  const limiteTotal = cartao.limite || 0;
  const limiteDisponivel = parseFloat((cartao.limite_disponivel || 0).toString());
  const limiteUtilizado = limiteTotal - limiteDisponivel;
  const percentualUtilizado = limiteTotal > 0 ? (limiteUtilizado / limiteTotal) * 100 : 0;

  const getStatusColor = () => {
    if (limiteDisponivel < 0) return "destructive";
    if (percentualUtilizado > 80) return "destructive";
    if (percentualUtilizado > 60) return "secondary";
    return "default";
  };

  const getStatusIcon = () => {
    if (limiteDisponivel < 0) return <AlertTriangle className="h-4 w-4" />;
    if (percentualUtilizado > 80) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card className={className} onClick={onClick}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4" />
          {cartao.apelido}
          <Badge variant="outline" className="text-xs">
            ••••{cartao.ultimos_digitos}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Disponível</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`font-medium ${limiteDisponivel < 0 ? 'text-destructive' : 'text-primary'}`}>
              {formatCurrency(limiteDisponivel)}
            </span>
          </div>
        </div>

        <Progress 
          value={Math.min(100, Math.max(0, percentualUtilizado))} 
          className="h-2"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Utilizado: {formatCurrency(limiteUtilizado)}</span>
          <span>Total: {formatCurrency(limiteTotal)}</span>
        </div>

        {cartao.dia_vencimento && (
          <div className="text-xs text-muted-foreground">
            Vencimento: dia {cartao.dia_vencimento}
          </div>
        )}

        <Badge variant={getStatusColor()} className="w-full justify-center">
          {limiteDisponivel < 0 
            ? "Limite Excedido" 
            : percentualUtilizado > 80 
            ? "Limite Baixo" 
            : "Limite OK"
          }
        </Badge>
      </CardContent>
    </Card>
  );
};