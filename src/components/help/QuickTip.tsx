import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, ArrowRight } from "lucide-react";

interface Tip {
  id: string;
  title: string;
  description: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  category: string;
}

const tips: Tip[] = [
  {
    id: "categorize-transactions",
    title: "Organize por categorias",
    description: "Use categorias consistentes para ter relatórios mais precisos e insights sobre seus gastos.",
    category: "Movimentações"
  },
  {
    id: "set-budget-alerts",
    title: "Configure alertas",
    description: "Ative notificações para não perder vencimentos de faturas e compromissos financeiros.",
    category: "Dashboard"
  },
  {
    id: "review-projections",
    title: "Revise suas projeções",
    description: "Confira semanalmente o calendário financeiro para ajustar planejamentos futuros.",
    category: "Calendário"
  },
  {
    id: "export-reports",
    title: "Exporte relatórios",
    description: "Use os relatórios mensais para análises detalhadas e acompanhamento de metas.",
    category: "Relatórios"
  },
  {
    id: "link-card-expenses",
    title: "Vincule gastos aos cartões",
    description: "Conecte compras aos cartões de crédito para monitorar limites e faturas futuras.",
    category: "Cartões"
  }
];

interface QuickTipProps {
  className?: string;
}

export const QuickTip = ({ className }: QuickTipProps) => {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const dismissedTips = JSON.parse(localStorage.getItem('dismissedTips') || '[]');
    setDismissed(dismissedTips);
    
    const availableTips = tips.filter(tip => !dismissedTips.includes(tip.id));
    if (availableTips.length > 0) {
      const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
      setCurrentTip(randomTip);
    }
  }, []);

  const dismissTip = () => {
    if (currentTip) {
      const newDismissed = [...dismissed, currentTip.id];
      setDismissed(newDismissed);
      localStorage.setItem('dismissedTips', JSON.stringify(newDismissed));
      setCurrentTip(null);
    }
  };

  const nextTip = () => {
    if (currentTip) {
      const availableTips = tips.filter(tip => 
        !dismissed.includes(tip.id) && tip.id !== currentTip.id
      );
      if (availableTips.length > 0) {
        const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
        setCurrentTip(randomTip);
      } else {
        setCurrentTip(null);
      }
    }
  };

  if (!currentTip) return null;

  return (
    <Card className={`border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <CardTitle className="text-sm font-medium">Dica do Dia</CardTitle>
            <Badge variant="outline" className="text-xs">
              {currentTip.category}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissTip}
            className="h-6 w-6 p-0 text-muted-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">{currentTip.title}</h4>
            <p className="text-sm text-muted-foreground">{currentTip.description}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTip}
              className="text-xs h-7"
            >
              Próxima dica
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
            
            {currentTip.action && (
              <Button
                variant="outline"
                size="sm"
                onClick={currentTip.action.onClick}
                className="text-xs h-7"
              >
                {currentTip.action.text}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};