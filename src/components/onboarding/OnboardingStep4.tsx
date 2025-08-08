import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';

interface OnboardingStep4Props {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const OnboardingStep4 = ({ data, setData, onNext, onPrev }: OnboardingStep4Props) => {
  const [hasCards, setHasCards] = useState<string>(
    data.cartoes.length > 0 ? 'sim' : 'nao'
  );

  const addCartao = () => {
    setData({
      ...data,
      cartoes: [...data.cartoes, { apelido: '', ultimosDigitos: '', limite: 0, diaVencimento: 1 }]
    });
  };

  const removeCartao = (index: number) => {
    const newCartoes = data.cartoes.filter((_, i) => i !== index);
    setData({ ...data, cartoes: newCartoes });
  };

  const updateCartao = (index: number, field: keyof typeof data.cartoes[0], value: string | number) => {
    const newCartoes = [...data.cartoes];
    newCartoes[index] = { ...newCartoes[index], [field]: value };
    setData({ ...data, cartoes: newCartoes });
  };

  const handleHasCardsChange = (value: string) => {
    setHasCards(value);
    if (value === 'sim' && data.cartoes.length === 0) {
      addCartao();
    } else if (value === 'nao') {
      setData({ ...data, cartoes: [] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cartões de Crédito</CardTitle>
        <p className="text-sm text-muted-foreground">
          Esta informação é opcional e nos ajuda a oferecer relatórios mais completos
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Você possui cartão de crédito?</Label>
            <RadioGroup value={hasCards} onValueChange={handleHasCardsChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="sim" />
                <Label htmlFor="sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="nao" />
                <Label htmlFor="nao">Não</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pular" id="pular" />
                <Label htmlFor="pular">Prefiro não informar agora</Label>
              </div>
            </RadioGroup>
          </div>

          {hasCards === 'sim' && (
            <div className="space-y-4">
              {data.cartoes.map((cartao, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Cartão {index + 1}</Label>
                    {data.cartoes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCartao(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Apelido *</Label>
                      <Input
                        placeholder="Ex: Nubank, Inter..."
                        value={cartao.apelido}
                        onChange={(e) => updateCartao(index, 'apelido', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>4 últimos dígitos *</Label>
                      <Input
                        placeholder="1234"
                        maxLength={4}
                        value={cartao.ultimosDigitos}
                        onChange={(e) => updateCartao(index, 'ultimosDigitos', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Limite (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={cartao.limite || ''}
                        onChange={(e) => updateCartao(index, 'limite', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Dia do vencimento</Label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="5"
                        value={cartao.diaVencimento || ''}
                        onChange={(e) => updateCartao(index, 'diaVencimento', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addCartao}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cartão
              </Button>
            </div>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrev}>
              Anterior
            </Button>
            <Button type="submit">
              Próximo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};