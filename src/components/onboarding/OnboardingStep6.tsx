import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingData } from '../OnboardingWizard';
import { Wallet, DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OnboardingStep6Props {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onComplete: () => void;
  onPrev: () => void;
  isLoading: boolean;
}

export const OnboardingStep6 = ({ data, setData, onComplete, onPrev, isLoading }: OnboardingStep6Props) => {
  const [saldoAtual, setSaldoAtual] = useState<string>(data.saldoInicial?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const saldoValue = parseFloat(saldoAtual.replace(',', '.')) || 0;
    setData({ 
      ...data, 
      saldoInicial: saldoValue 
    });
    
    onComplete();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const saldoNumerico = parseFloat(saldoAtual.replace(',', '.')) || 0;

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl">Saldo Inicial</CardTitle>
        <p className="text-muted-foreground">
          Quanto você tem atualmente na sua conta? Isso nos ajudará a calcular seu progresso financeiro.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="saldo" className="text-base font-medium">
              Saldo atual em conta (R$)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="saldo"
                type="text"
                placeholder="0,00"
                value={saldoAtual}
                onChange={(e) => setSaldoAtual(e.target.value)}
                className="pl-10 h-12 text-lg text-center"
                autoFocus
              />
            </div>
            
            {saldoNumerico !== 0 && (
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Valor informado:</p>
                <p className={`text-2xl font-bold ${saldoNumerico >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(saldoNumerico)}
                </p>
              </div>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> Inclua o saldo de todas suas contas correntes e poupanças. 
              Valores negativos também são permitidos se você estiver no vermelho.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Este valor será usado como ponto de partida para calcular sua evolução financeira. 
              Você pode pular esta etapa e adicionar depois se preferir.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrev} 
              disabled={isLoading}
              className="flex-1 h-12 text-base"
            >
              ← Anterior
            </Button>
            <Button 
              type="button"
              variant="ghost"
              onClick={() => {
                setData({ ...data, saldoInicial: 0 });
                onComplete();
              }}
              disabled={isLoading}
              className="flex-1 h-12 text-base"
            >
              Pular
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-12 text-base bg-gradient-to-r from-primary to-primary/90"
            >
              {isLoading ? 'Finalizando...' : 'Finalizar 🎉'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};