import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '../OnboardingWizard';

interface OnboardingStep2Props {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onNext: () => void;
  onPrev: () => void;
  subscriptionTier?: string;
}

export const OnboardingStep2 = ({ data, setData, onNext, onPrev, subscriptionTier }: OnboardingStep2Props) => {
  const isCasalPlan = subscriptionTier === 'Casal';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.telefone) return;
    if (isCasalPlan && (!data.nomeConjuge || !data.telefoneConjuge)) return;
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Sistema</CardTitle>
        <p className="text-sm text-muted-foreground">
          Plano detectado: {subscriptionTier || 'Solo'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telefone">Seu Telefone *</Label>
            <Input
              id="telefone"
              placeholder="(11) 99999-9999"
              value={data.telefone}
              onChange={(e) => setData({ ...data, telefone: e.target.value })}
              required
            />
          </div>

          {isCasalPlan && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nomeConjuge">Nome do Cônjuge *</Label>
                <Input
                  id="nomeConjuge"
                  placeholder="Nome completo"
                  value={data.nomeConjuge || ''}
                  onChange={(e) => setData({ ...data, nomeConjuge: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefoneConjuge">Telefone do Cônjuge *</Label>
                <Input
                  id="telefoneConjuge"
                  placeholder="(11) 99999-9999"
                  value={data.telefoneConjuge || ''}
                  onChange={(e) => setData({ ...data, telefoneConjuge: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Preferência de Notificações</Label>
            <Select
              value={data.preferenciasNotificacao}
              onValueChange={(value) => setData({ ...data, preferenciasNotificacao: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="ambos">WhatsApp e Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

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