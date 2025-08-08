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
    <Card>
      <CardHeader>
        <CardTitle>Dados Pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
            <Input
              id="dataNascimento"
              type="date"
              value={data.dataNascimento || ''}
              onChange={(e) => setData({ ...data, dataNascimento: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF (opcional)</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={data.cpf || ''}
              onChange={(e) => setData({ ...data, cpf: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              Próximo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};