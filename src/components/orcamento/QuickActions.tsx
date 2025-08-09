import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingUp, CreditCard, Building2 } from "lucide-react";

interface QuickActionsProps {
  onAddFonte: () => void;
  onAddCartao: () => void;
  onAddParcelamento: () => void;
  onCreateOrcamento?: () => void;
  hasOrcamento?: boolean;
}

export const QuickActions = ({
  onAddFonte,
  onAddCartao,
  onAddParcelamento,
  onCreateOrcamento,
  hasOrcamento
}: QuickActionsProps) => {
  return (
    <Card className="card-modern">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Ações Rápidas</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Button
              size="sm"
              onClick={onAddFonte}
              className="flex flex-col h-16 gap-1 text-xs bg-success/10 hover:bg-success/20 text-success border-success/20"
              variant="outline"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Renda</span>
            </Button>

            <Button
              size="sm"
              onClick={onAddCartao}
              className="flex flex-col h-16 gap-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              variant="outline"
            >
              <CreditCard className="h-4 w-4" />
              <span>Cartão</span>
            </Button>

            <Button
              size="sm"
              onClick={onAddParcelamento}
              className="flex flex-col h-16 gap-1 text-xs bg-warning/10 hover:bg-warning/20 text-warning border-warning/20"
              variant="outline"
            >
              <Building2 className="h-4 w-4" />
              <span>Parcelado</span>
            </Button>

            {!hasOrcamento && onCreateOrcamento && (
              <Button
                size="sm"
                onClick={onCreateOrcamento}
                className="flex flex-col h-16 gap-1 text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Orçamento</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};