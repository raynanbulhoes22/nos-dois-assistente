import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditCard, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Cartao } from "@/hooks/useCartoes";
import { useLimiteDinamicoCartao } from "@/hooks/useLimiteDinamicoCartao";

interface LimiteCartaoDisplayProps {
  cartao: Cartao;
  className?: string;
  onClick?: () => void;
}

export const LimiteCartaoDisplay = ({ cartao, className, onClick }: LimiteCartaoDisplayProps) => {
  const { 
    limiteTotal, 
    limiteAtualDisponivel, 
    limiteUtilizado, 
    percentualUtilizado,
    comprasNoMes,
    pagamentosNoMes,
    diferenca,
    isLoading 
  } = useLimiteDinamicoCartao(cartao);

  const getStatusColor = () => {
    if (limiteAtualDisponivel < 0) return "destructive";
    if (percentualUtilizado > 80) return "destructive";
    if (percentualUtilizado > 60) return "secondary";
    return "default";
  };

  const getStatusIcon = () => {
    if (limiteAtualDisponivel < 0) return <AlertTriangle className="h-4 w-4" />;
    if (percentualUtilizado > 80) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (limiteAtualDisponivel < 0) return "Limite Excedido";
    if (percentualUtilizado > 80) return "Limite Baixo";
    return "Limite OK";
  };

  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  console.log('[LimiteCartaoDisplay] Renderizando cartão:', cartao.apelido);
  console.log('[LimiteCartaoDisplay] Dados dinâmicos:', {
    limiteTotal,
    limiteAtualDisponivel,
    limiteUtilizado,
    percentualUtilizado,
    comprasNoMes,
    pagamentosNoMes,
    isLoading
  });

  if (isLoading) {
    return (
      <Card className={className}>
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
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={className} onClick={onClick}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4" />
            {cartao.apelido}
            <Badge variant="outline" className="text-xs">
              ••••{cartao.ultimos_digitos}
            </Badge>
            {diferenca !== 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    {diferenca > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    {formatCurrency(Math.abs(diferenca))}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {diferenca > 0 
                      ? `Limite aumentou ${formatCurrency(diferenca)} este mês` 
                      : `Limite diminuiu ${formatCurrency(Math.abs(diferenca))} este mês`
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Disponível</span>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`font-medium ${limiteAtualDisponivel < 0 ? 'text-destructive' : 'text-primary'}`}>
                {formatCurrency(limiteAtualDisponivel)}
              </span>
            </div>
          </div>

          {/* Barra visual do limite */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Utilização do Limite</span>
              <span className="font-medium">{percentualUtilizado.toFixed(1)}%</span>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Progress 
                    value={Math.min(100, Math.max(0, percentualUtilizado))} 
                    className="h-3 cursor-help"
                  />
                  {limiteAtualDisponivel < 0 && (
                    <div className="absolute top-0 left-0 h-3 bg-destructive rounded-full opacity-20 animate-pulse" 
                         style={{ width: '100%' }} />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm space-y-1">
                  <p><strong>Limite Total:</strong> {formatCurrency(limiteTotal)}</p>
                  <p><strong>Utilizado:</strong> {formatCurrency(limiteUtilizado)} ({percentualUtilizado.toFixed(1)}%)</p>
                  <p><strong>Disponível:</strong> {formatCurrency(limiteAtualDisponivel)}</p>
                  {comprasNoMes > 0 && <p><strong>Compras do mês:</strong> {formatCurrency(comprasNoMes)}</p>}
                  {pagamentosNoMes > 0 && <p><strong>Pagamentos do mês:</strong> {formatCurrency(pagamentosNoMes)}</p>}
                </div>
              </TooltipContent>
            </Tooltip>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>R$ 0</span>
              <span>{formatCurrency(limiteTotal)}</span>
            </div>
          </div>

          {(comprasNoMes > 0 || pagamentosNoMes > 0) && (
            <div className="text-xs text-muted-foreground space-y-1">
              {comprasNoMes > 0 && (
                <div className="flex justify-between">
                  <span>📱 Compras do mês:</span>
                  <span className="text-red-500">-{formatCurrency(comprasNoMes)}</span>
                </div>
              )}
              {pagamentosNoMes > 0 && (
                <div className="flex justify-between">
                  <span>💳 Pagamentos do mês:</span>
                  <span className="text-green-500">+{formatCurrency(pagamentosNoMes)}</span>
                </div>
              )}
            </div>
          )}

          {cartao.dia_vencimento && (
            <div className="text-xs text-muted-foreground">
              Vencimento: dia {cartao.dia_vencimento}
            </div>
          )}

          <Badge variant={getStatusColor()} className="w-full justify-center">
            {getStatusText()}
          </Badge>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};