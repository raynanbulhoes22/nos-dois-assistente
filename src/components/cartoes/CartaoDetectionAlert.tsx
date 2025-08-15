import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Plus, X, AlertTriangle } from 'lucide-react';
import { useCartaoDetection } from '@/hooks/useCartaoDetection';

export const CartaoDetectionAlert = () => {
  const { 
    cartoesDetectados, 
    isAnalyzing, 
    criarCartaoDetectado, 
    ignorarCartaoDetectado 
  } = useCartaoDetection();

  if (isAnalyzing || cartoesDetectados.length === 0) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Alert className="mb-4 border-primary/20 bg-primary/5">
      <AlertTriangle className="h-4 w-4 text-primary" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-medium text-primary">
            Detectamos {cartoesDetectados.length} cartão(s) não cadastrado(s) nas suas transações:
          </p>
          
          <div className="space-y-2">
            {cartoesDetectados.map((cartao) => (
              <Card key={cartao.ultimosDigitos} className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {cartao.apelido}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {cartao.transacoesOrfas} transação(s) • {formatCurrency(cartao.valorTotal)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => criarCartaoDetectado(cartao)}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => ignorarCartaoDetectado(cartao.ultimosDigitos)}
                        className="h-7 text-xs"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};