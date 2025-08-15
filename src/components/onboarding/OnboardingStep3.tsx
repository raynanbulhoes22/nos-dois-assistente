import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';

interface OnboardingStep3Props {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const tiposRenda = [
  'Salário',
  'Freelancer',
  'Aposentadoria',
  'Pensão',
  'Investimentos',
  'Aluguel',
  'Outros'
];

export const OnboardingStep3 = ({ data, setData, onNext, onPrev }: OnboardingStep3Props) => {
  const addFonte = () => {
    setData({
      ...data,
      fontes: [...data.fontes, { tipo: 'Outros', valor: 0, descricao: '' }]
    });
  };

  const removeFonte = (index: number) => {
    if (data.fontes.length > 1) {
      const newFontes = data.fontes.filter((_, i) => i !== index);
      setData({ ...data, fontes: newFontes });
    }
  };

  const updateFonte = (index: number, field: keyof typeof data.fontes[0], value: string | number) => {
    const newFontes = [...data.fontes];
    newFontes[index] = { ...newFontes[index], [field]: value };
    setData({ ...data, fontes: newFontes });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Permitir prosseguir mesmo sem salário informado, mas com pelo menos uma fonte de renda
    const hasValidIncome = data.fontes.some(f => f.valor > 0);
    if (!hasValidIncome) {
      // Se não há renda informada, adiciona uma fonte padrão para não bloquear o onboarding
      setData({
        ...data,
        fontes: [{ tipo: 'Outros', valor: 0, descricao: 'A definir' }]
      });
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Renda Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {data.fontes.map((fonte, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label>Fonte de Renda {index + 1}</Label>
                {data.fontes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFonte(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={fonte.tipo}
                    onValueChange={(value) => updateFonte(index, 'tipo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposRenda.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Valor (R$) {index === 0 && '*'}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={fonte.valor || ''}
                    onChange={(e) => updateFonte(index, 'valor', parseFloat(e.target.value) || 0)}
                    required={index === 0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  placeholder="Ex: Empresa XYZ, Projeto ABC..."
                  value={fonte.descricao || ''}
                  onChange={(e) => updateFonte(index, 'descricao', e.target.value)}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addFonte}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Fonte de Renda
          </Button>

          {/* Navigation Buttons - Mobile Optimized */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrev} 
              className="flex-1 h-12 sm:h-10 text-base sm:text-sm"
            >
              ← Anterior
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 sm:h-10 text-base sm:text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              Próximo →
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};