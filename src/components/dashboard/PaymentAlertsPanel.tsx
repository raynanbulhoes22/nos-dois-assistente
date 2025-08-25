import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CreditCard, 
  Calendar, 
  RefreshCw,
  ExternalLink,
  X
} from "lucide-react";
import { PaymentAlert } from "@/hooks/usePaymentAlerts";
import { useStripe } from "@/hooks/useStripe";

interface PaymentAlertsPanelProps {
  alerts: PaymentAlert[];
  loading?: boolean;
  onDismiss: (alertId: string) => void;
  onRefresh: () => void;
  className?: string;
}

export const PaymentAlertsPanel = ({ 
  alerts, 
  loading = false, 
  onDismiss, 
  onRefresh,
  className 
}: PaymentAlertsPanelProps) => {
  const { handlePortal } = useStripe();

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: PaymentAlert['type']) => {
    switch (type) {
      case 'payment_failed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'payment_due':
        return <Calendar className="h-4 w-4" />;
      case 'card_expiring':
        return <CreditCard className="h-4 w-4" />;
      case 'subscription_ending':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (priority: PaymentAlert['priority']) => {
    switch (priority) {
      case 'high':
        return "destructive";
      case 'medium':
        return "default";
      case 'low':
        return "secondary";
      default:
        return "default";
    }
  };

  const getPriorityBadge = (priority: PaymentAlert['priority']) => {
    const colors = {
      high: "bg-destructive text-destructive-foreground",
      medium: "bg-amber-500 text-white",
      low: "bg-muted text-muted-foreground"
    };

    const labels = {
      high: "Urgente",
      medium: "Importante",
      low: "Info"
    };

    return (
      <Badge className={`text-xs ${colors[priority]}`}>
        {labels[priority]}
      </Badge>
    );
  };

  const handleAction = (alert: PaymentAlert) => {
    switch (alert.actionType) {
      case 'update_payment':
      case 'renew_subscription':
        handlePortal();
        break;
      case 'contact_support':
        // Could open a support modal or email
        window.open('mailto:support@lyvo.ai', '_blank');
        break;
    }
  };

  const getActionButtonText = (actionType?: PaymentAlert['actionType']) => {
    switch (actionType) {
      case 'update_payment':
        return "Atualizar Pagamento";
      case 'renew_subscription':
        return "Renovar Assinatura";
      case 'contact_support':
        return "Contatar Suporte";
      default:
        return "Resolver";
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-sm">Alertas de Pagamento</h3>
          <Badge variant="secondary" className="text-xs">
            {alerts.length}
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-auto p-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={getAlertVariant(alert.priority) as any}>
          <div className="flex items-start gap-3">
            {getAlertIcon(alert.type)}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <AlertTitle className="text-sm">
                  {alert.title}
                </AlertTitle>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(alert.priority)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(alert.id)}
                    className="h-auto p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <AlertDescription className="text-xs">
                {alert.message}
              </AlertDescription>
              
              {alert.daysUntilAction && (
                <div className="text-xs text-muted-foreground">
                  {alert.daysUntilAction} dia{alert.daysUntilAction !== 1 ? 's' : ''} restante{alert.daysUntilAction !== 1 ? 's' : ''}
                </div>
              )}
              
              {alert.actionType && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(alert)}
                  className="h-8 text-xs"
                >
                  {getActionButtonText(alert.actionType)}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
};