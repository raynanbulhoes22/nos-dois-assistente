import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, Calendar, TrendingDown } from "lucide-react";

interface AlertasCartaoPanelProps {
  alertas: string[];
  onDismiss?: (index: number) => void;
  className?: string;
}

export const AlertasCartaoPanel = ({ alertas, onDismiss, className }: AlertasCartaoPanelProps) => {
  if (!alertas || alertas.length === 0) {
    return null;
  }

  const getAlertIcon = (alerta: string) => {
    if (alerta.includes('limite negativo')) return <TrendingDown className="h-4 w-4" />;
    if (alerta.includes('limite baixo')) return <AlertTriangle className="h-4 w-4" />;
    if (alerta.includes('vence em')) return <Calendar className="h-4 w-4" />;
    return <CreditCard className="h-4 w-4" />;
  };

  const getAlertVariant = (alerta: string) => {
    if (alerta.includes('limite negativo')) return "destructive";
    if (alerta.includes('limite baixo')) return "destructive";
    if (alerta.includes('vence em')) return "default";
    return "secondary";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold text-sm">Alertas de Cartão</h3>
        <Badge variant="secondary" className="text-xs">
          {alertas.length}
        </Badge>
      </div>
      
      {alertas.map((alerta, index) => (
        <Alert key={index} variant={getAlertVariant(alerta) as any}>
          <div className="flex items-start gap-3">
            {getAlertIcon(alerta)}
            <div className="flex-1">
              <AlertTitle className="text-sm mb-1">
                {alerta.includes('limite negativo') && 'Limite Excedido'}
                {alerta.includes('limite baixo') && 'Limite Baixo'}
                {alerta.includes('vence em') && 'Vencimento Próximo'}
              </AlertTitle>
              <AlertDescription className="text-xs">
                {alerta}
              </AlertDescription>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(index)}
                className="h-auto p-1 text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  );
};