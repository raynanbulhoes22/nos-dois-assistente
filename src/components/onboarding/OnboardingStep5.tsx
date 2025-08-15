import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '../OnboardingWizard';
import { FINANCIAL_CATEGORIES } from '@/constants/categories';

interface OnboardingStep5Props {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const objetivos = [
  'Controlar gastos',
  'Economizar dinheiro',
  'Investir melhor',
  'Quitar dívidas',
  'Planejamento familiar'
];

export const OnboardingStep5 = ({ data, setData, onNext, onPrev }: OnboardingStep5Props) => {
  const handleCategoriaChange = (categoria: string, checked: boolean) => {
    if (checked) {
      setData({
        ...data,
        categoriasSelecionadas: [...data.categoriasSelecionadas, categoria]
      });
    } else {
      setData({
        ...data,
        categoriasSelecionadas: data.categoriasSelecionadas.filter(c => c !== categoria)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.objetivoPrincipal) return;
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objetivos e Preferências</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Objetivo Principal *</Label>
            <Select
              value={data.objetivoPrincipal}
              onValueChange={(value) => setData({ ...data, objetivoPrincipal: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu objetivo" />
              </SelectTrigger>
              <SelectContent>
                {objetivos.map(objetivo => (
                  <SelectItem key={objetivo} value={objetivo}>{objetivo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Meta de Economia Mensal (R$)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={data.metaEconomiaMensal || ''}
              onChange={(e) => setData({ 
                ...data, 
                metaEconomiaMensal: parseFloat(e.target.value) || undefined 
              })}
            />
          </div>

          <div className="space-y-3">
            <Label>Categorias de Gastos Mais Relevantes</Label>
            <p className="text-sm text-muted-foreground">
              Selecione as categorias que mais se aplicam ao seu perfil
            </p>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {Object.entries(FINANCIAL_CATEGORIES).map(([grupo, categorias]) => 
                categorias.map(categoria => (
                  <div key={categoria} className="flex items-center space-x-2">
                    <Checkbox
                      id={categoria}
                      checked={data.categoriasSelecionadas.includes(categoria)}
                      onCheckedChange={(checked) => 
                        handleCategoriaChange(categoria, checked as boolean)
                      }
                    />
                    <Label htmlFor={categoria} className="text-sm">
                      {categoria}
                    </Label>
                  </div>
                ))
              ).flat()}
            </div>
          </div>

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