import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingData } from '../OnboardingWizard';

interface OnboardingStep1Props {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onNext: () => void;
}

export const OnboardingStep1 = ({ data, setData, onNext }: OnboardingStep1Props) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card className="border-0 sm:border shadow-none sm:shadow-sm bg-card/80 sm:bg-card backdrop-blur-sm sm:backdrop-blur-none">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">📋 Dados Pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="dataNascimento" className="text-sm font-medium">📅 Data de Nascimento</Label>
            <Input
              id="dataNascimento"
              type="date"
              value={data.dataNascimento || ''}
              onChange={(e) => setData({ ...data, dataNascimento: e.target.value })}
              className="text-base sm:text-sm h-12 sm:h-10"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="cpf" className="text-sm font-medium">🆔 CPF (opcional)</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={data.cpf || ''}
              onChange={(e) => setData({ ...data, cpf: e.target.value })}
              className="text-base sm:text-sm h-12 sm:h-10"
            />
          </div>

          {/* Navigation Buttons - Mobile Optimized */}
          <div className="flex gap-3 pt-4">
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