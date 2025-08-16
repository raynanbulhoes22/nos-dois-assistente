import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Valor Principal */}
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(value)}
            </div>
          </div>

          {/* Explicação */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              {explanation}
            </p>
          </div>

          {/* Lista de Itens */}
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${
                    item.type === "positive" ? "text-green-600" :
                    item.type === "negative" ? "text-red-600" :
                    "text-foreground"
                  }`}>
                    {formatCurrency(item.value)}
                  </span>
                  {item.type === "positive" && (
                    <Badge variant="outline" className="text-xs px-1 py-0 bg-green-50 text-green-700 border-green-200">
                      Entrada
                    </Badge>
                  )}
                  {item.type === "negative" && (
                    <Badge variant="outline" className="text-xs px-1 py-0 bg-red-50 text-red-700 border-red-200">
                      Saída
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};