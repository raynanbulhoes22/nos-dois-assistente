import { useState } from "react";
import { useFaturaVinculacao } from "@/hooks/useFaturaVinculacao";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { LinkIcon, Calendar, CreditCard } from "lucide-react";
import type { FaturaFutura } from "@/hooks/useFaturasFuturas";

interface VinculacaoFaturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transacao: {
    id: string;
    valor: number;
    cartao_final?: string;
    data: string;
    titulo?: string;
  };
  faturasPossiveis: FaturaFutura[];
  onVincular: (faturaId: string) => void;
}

export const VinculacaoFaturaDialog = ({
  open,
  onOpenChange,
  transacao,
  faturasPossiveis,
  onVincular
}: VinculacaoFaturaDialogProps) => {
  const [selectedFatura, setSelectedFatura] = useState<string | null>(null);

  if (faturasPossiveis.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Vincular Fatura Futura
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-accent/50 rounded-lg">
            <h4 className="font-medium mb-2">Pagamento Registrado:</h4>
            <p className="text-sm">
              <strong>{transacao.titulo}</strong>
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>{formatCurrency(transacao.valor)}</span>
              {transacao.cartao_final && (
                <>
                  <span>•</span>
                  <span>•••• {transacao.cartao_final}</span>
                </>
              )}
              <span>•</span>
              <span>{new Date(transacao.data).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Faturas Futuras Encontradas:</h4>
            <div className="space-y-2">
              {faturasPossiveis.map((fatura) => {
                const isExactMatch = fatura.valor === transacao.valor && 
                                   fatura.ultimos_digitos === transacao.cartao_final;
                
                return (
                  <div
                    key={fatura.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFatura === fatura.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedFatura(fatura.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{fatura.descricao}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CreditCard className="h-3 w-3" />
                          <span>{fatura.apelido_cartao}</span>
                          <span>•••• {fatura.ultimos_digitos}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(fatura.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(fatura.valor)}</p>
                        {isExactMatch && (
                          <Badge variant="secondary" className="text-xs">
                            Match Exato
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedFatura) {
                  onVincular(selectedFatura);
                  onOpenChange(false);
                }
              }}
              disabled={!selectedFatura}
            >
              Vincular Fatura
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};