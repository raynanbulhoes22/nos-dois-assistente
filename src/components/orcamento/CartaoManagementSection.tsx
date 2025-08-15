import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";
import { LimiteCartaoDisplay } from "@/components/cartoes/LimiteCartaoDisplay";
import { AlertasCartaoPanel } from "@/components/cartoes/AlertasCartaoPanel";
import { Cartao } from "@/hooks/useCartoes";
import { useCartaoProcessamento } from "@/hooks/useCartaoProcessamento";

interface CartaoManagementSectionProps {
  cartoes: Cartao[];
  onAddCartao: () => void;
  onEditCartao: (cartao: Cartao) => void;
  onDeleteCartao: (id: string) => void;
  formatCurrency: (valor: number) => string;
}

export const CartaoManagementSection = ({ 
  cartoes, 
  onAddCartao, 
  onEditCartao, 
  onDeleteCartao,
  formatCurrency 
}: CartaoManagementSectionProps) => {
  const { alertasCartoes, verificarAlertas } = useCartaoProcessamento();
  const [alertasDismissed, setAlertasDismissed] = useState<number[]>([]);

  // Verificar alertas dos cartões
  const alertasAtuais = verificarAlertas(cartoes);
  const alertasVisiveis = alertasAtuais.filter((_, index) => !alertasDismissed.includes(index));

  const dismissAlert = (index: number) => {
    setAlertasDismissed(prev => [...prev, index]);
  };

  const cartoesAtivos = cartoes.filter(c => c.ativo);
  const totalLimiteTotal = cartoesAtivos.reduce((total, c) => total + (c.limite || 0), 0);
  const totalLimiteDisponivel = cartoesAtivos.reduce((total, c) => {
    return total + parseFloat((c.limite_disponivel || 0).toString());
  }, 0);

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {alertasVisiveis.length > 0 && (
        <AlertasCartaoPanel 
          alertas={alertasVisiveis}
          onDismiss={dismissAlert}
        />
      )}

      {/* Resumo Geral */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Gestão de Cartões
            </CardTitle>
            <Button onClick={onAddCartao} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cartão
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Limite Total</p>
              <p className="font-semibold text-lg">{formatCurrency(totalLimiteTotal)}</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Disponível</p>
              <p className={`font-semibold text-lg ${totalLimiteDisponivel < 0 ? 'text-destructive' : 'text-primary'}`}>
                {formatCurrency(totalLimiteDisponivel)}
              </p>
            </div>
          </div>

          {/* Lista de Cartões */}
          {cartoesAtivos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum cartão ativo</p>
              <p className="text-sm">Adicione cartões para controle automático de limites</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {cartoesAtivos.map(cartao => (
                <LimiteCartaoDisplay
                  key={cartao.id}
                  cartao={cartao}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => onEditCartao(cartao)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};