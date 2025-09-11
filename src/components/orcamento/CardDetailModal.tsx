import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrencySafe } from "@/lib/financial-utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: number;
  explanation: string;
  items: Array<{
    label: string;
    value: number;
    type?: "positive" | "negative" | "neutral";
  }>;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
  explanation,
  items,
}) => {
  const totalPositive = items.filter(item => item.type === "positive").reduce((sum, item) => sum + item.value, 0);
  const totalNegative = items.filter(item => item.type === "negative").reduce((sum, item) => sum + item.value, 0);
  const hasCalculation = totalPositive > 0 || totalNegative > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Valor Principal */}
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className={`text-3xl font-bold ${
              value >= 0 ? 'text-success' : 'text-error'
            }`}>
              {formatCurrencySafe(value)}
            </div>
            {hasCalculation && (
              <div className="text-sm text-muted-foreground mt-2">
                {totalPositive > 0 && `+${formatCurrencySafe(totalPositive)}`}
                {totalPositive > 0 && totalNegative > 0 && ' '}
                {totalNegative > 0 && `-${formatCurrencySafe(totalNegative)}`}
              </div>
            )}
          </div>

          {/* Explicação */}
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground text-center">
              {explanation}
            </p>
          </div>

          {/* Lista de Itens */}
          <div className="space-y-0">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Detalhamento {items.length > 5 && `(${items.length} itens)`}
            </h4>
            {items.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium flex-1 pr-3">{item.label}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`font-semibold ${
                      item.type === "positive" ? "text-success" :
                      item.type === "negative" ? "text-error" :
                      "text-foreground"
                    }`}>
                      {formatCurrencySafe(item.value)}
                    </span>
                    {item.type === "positive" && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5 bg-success/10 text-success border-success/30">
                        +
                      </Badge>
                    )}
                    {item.type === "negative" && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5 bg-error/10 text-error border-error/30">
                        -
                      </Badge>
                    )}
                  </div>
                </div>
                {index < items.length - 1 && <Separator className="opacity-50" />}
              </div>
            ))}
          </div>

          {/* Resumo do total se houver múltiplos itens */}
          {items.length > 1 && hasCalculation && (
            <div className="bg-muted/50 p-3 rounded-lg border-t-2 border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Total Calculado:</span>
                <span className={`font-bold ${
                  value >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {formatCurrencySafe(value)}
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};