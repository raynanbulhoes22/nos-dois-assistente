import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Edit3, Trash2, Info } from "lucide-react";
import { Cartao } from "@/hooks/useCartoes";
import { useLimiteDinamicoCartao } from "@/hooks/useLimiteDinamicoCartao";

interface LimiteCartaoDisplayProps {
  cartao: Cartao;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const LimiteCartaoDisplay = ({ cartao, className, onEdit, onDelete }: LimiteCartaoDisplayProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
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

  const getUtilizationColor = () => {
    if (limiteAtualDisponivel < 0) return {
      variant: "destructive" as const,
      barColor: "bg-destructive",
      textColor: "text-destructive",
      borderColor: "border-destructive/20",
      bgColor: "bg-destructive/5"
    };
    
    if (percentualUtilizado >= 90) return {
      variant: "destructive" as const,
      barColor: "bg-destructive",
      textColor: "text-destructive",
      borderColor: "border-destructive/20",
      bgColor: "bg-destructive/5"
    };
    
    if (percentualUtilizado >= 75) return {
      variant: "secondary" as const,
      barColor: "bg-orange-500",
      textColor: "text-orange-600",
      borderColor: "border-orange-200",
      bgColor: "bg-orange-50"
    };
    
    if (percentualUtilizado >= 50) return {
      variant: "outline" as const,
      barColor: "bg-yellow-500",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-200",
      bgColor: "bg-yellow-50"
    };
    
    return {
      variant: "default" as const,
      barColor: "bg-green-500",
      textColor: "text-green-600",
      borderColor: "border-green-200",
      bgColor: "bg-green-50"
    };
  };

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
    if (percentualUtilizado >= 90) return "Crítico";
    if (percentualUtilizado >= 75) return "Alto";
    if (percentualUtilizado >= 50) return "Moderado";
    return "Baixo";
  };

  const utilizationColors = getUtilizationColor();

  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Componente atualizado sem logs sensíveis

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
      <Card 
        className={`relative transition-all duration-300 hover:shadow-lg cursor-pointer group border-l-4 ${utilizationColors.borderColor} ${utilizationColors.bgColor} ${className || ''}`} 
        onClick={() => setShowInfoModal(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">{cartao.apelido}</CardTitle>
              <p className="text-sm text-muted-foreground">
                •••• {cartao.ultimos_digitos}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={utilizationColors.variant} className="shrink-0 animate-pulse">
                {getStatusText()}
              </Badge>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }} 
                    className="h-8 w-8 p-0 hover:bg-primary/10"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }} 
                    className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Disponível</span>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`font-medium transition-colors duration-300 ${utilizationColors.textColor}`}>
                {formatCurrency(limiteAtualDisponivel)}
              </span>
            </div>
          </div>

          {/* Barra visual do limite */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Utilização do Limite</span>
              <span className={`font-medium ${utilizationColors.textColor}`}>{percentualUtilizado.toFixed(1)}%</span>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${utilizationColors.barColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, percentualUtilizado))}%` }}
                    />
                  </div>
                  {limiteAtualDisponivel < 0 && (
                    <div className="absolute top-0 left-0 h-3 bg-destructive rounded-full opacity-30 animate-pulse" 
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
            <div className="text-xs text-muted-foreground space-y-1 animate-fade-in">
              {comprasNoMes > 0 && (
                <div className="flex justify-between">
                  <span>📱 Compras do mês:</span>
                  <span className="text-destructive font-medium">-{formatCurrency(comprasNoMes)}</span>
                </div>
              )}
              {pagamentosNoMes > 0 && (
                <div className="flex justify-between">
                  <span>💳 Pagamentos do mês:</span>
                  <span className="text-success font-medium">+{formatCurrency(pagamentosNoMes)}</span>
                </div>
              )}
            </div>
          )}

          {cartao.dia_vencimento && (
            <div className="text-xs text-muted-foreground">
              Vencimento: dia {cartao.dia_vencimento}
            </div>
          )}

          {diferenca !== 0 && (
            <div className="flex items-center gap-1 text-xs animate-fade-in">
              {diferenca > 0 ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={`${diferenca > 0 ? 'text-success' : 'text-destructive'} font-medium`}>
                {diferenca > 0 
                  ? `+${formatCurrency(diferenca)} este mês` 
                  : `${formatCurrency(diferenca)} este mês`
                }
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Informações */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações do Cartão
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{cartao.apelido}</h3>
              <p className="text-sm text-muted-foreground">
                Final: •••• {cartao.ultimos_digitos}
              </p>
              {cartao.dia_vencimento && (
                <p className="text-sm text-muted-foreground">
                  Vencimento: Todo dia {cartao.dia_vencimento}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Limite Total</p>
                <p className="font-semibold">{formatCurrency(limiteTotal)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Limite Disponível</p>
                <p className={`font-semibold ${limiteAtualDisponivel < 0 ? 'text-destructive' : 'text-success'}`}>
                  {formatCurrency(limiteAtualDisponivel)}
                </p>
              </div>
            </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilização</span>
                  <span className={utilizationColors.textColor}>{percentualUtilizado.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${utilizationColors.barColor}`}
                    style={{ width: `${Math.min(100, Math.max(0, percentualUtilizado))}%` }}
                  />
                </div>
            </div>

            {(comprasNoMes > 0 || pagamentosNoMes > 0) && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Movimento do Mês</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {comprasNoMes > 0 && (
                    <div>
                      <p className="text-muted-foreground">Compras</p>
                      <p className="font-medium text-destructive">
                        -{formatCurrency(comprasNoMes)}
                      </p>
                    </div>
                  )}
                  {pagamentosNoMes > 0 && (
                    <div>
                      <p className="text-muted-foreground">Pagamentos</p>
                      <p className="font-medium text-success">
                        +{formatCurrency(pagamentosNoMes)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};